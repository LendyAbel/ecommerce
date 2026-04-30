Ready for review
Select text to add comments on the plan
Plan: Carrito de compras persistente en base de datos
Contexto
El carrito actual vive únicamente en localStorage (Zustand persist). El objetivo es que cada mutación del carrito se persista en PostgreSQL, de modo que el usuario recupere exactamente su carrito al volver a loguear desde cualquier dispositivo.

El schema de Prisma ya tiene los modelos Cart y CartItem, pero con un bug crítico (CartItem.productId @unique) que impide que dos usuarios tengan el mismo producto en sus carritos.

Fase 1 — Fix Prisma Schema
Archivo: backend/prisma/schema.prisma

Dos cambios:

Quitar @unique de CartItem.productId (permite que el mismo producto esté en múltiples carritos)
Cambiar Product.cartItem CartItem? → Product.cartItems CartItem[] (relación uno-a-muchos)
Después correr:

npx prisma migrate dev --name fix-cart-schema
npx prisma generate
Fase 2 — Backend: módulo cart
Archivos a crear
backend/src/modules/cart/schemas/cartZodSchema.ts

import z from 'zod';

export const AddItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).default(1),
});

export const UpdateItemSchema = z.object({
    quantity: z.coerce.number().int().min(1),
});

export type AddItemInput = z.infer<typeof AddItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
backend/src/modules/cart/services/cartServices.ts

import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../lib/AppError';
import type { AddItemInput, UpdateItemInput } from '../schemas/cartZodSchema';

const cartInclude = {
    cartItems: {
        include: {
            product: {
                include: { images: true, mainCategory: true, categories: true },
            },
        },
    },
} as const;

const getOrCreateCart = async (userId: string) => {
    return prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: cartInclude,
    });
};

const addItem = async (userId: string, data: AddItemInput) => {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new AppError('Product not found', 404);

    const cart = await getOrCreateCart(userId);
    const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: data.productId },
    });

    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + data.quantity },
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId: data.productId, quantity: data.quantity },
        });
    }

    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
};

const updateItem = async (userId: string, itemId: string, data: UpdateItemInput) => {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) throw new AppError('Item not found', 404);

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: data.quantity } });
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
};

const removeItem = async (userId: string, itemId: string) => {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) throw new AppError('Item not found', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
};

const clearCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return null;

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
};

export default { getOrCreateCart, addItem, updateItem, removeItem, clearCart };
Nota de seguridad: updateItem y removeItem verifican que item.cart.userId === userId para prevenir que un usuario modifique el carrito de otro.

backend/src/modules/cart/routers/cartRouter.ts

import express from 'express';
import { authenticate } from '../../../middlewares/authMiddleware';
import { AddItemSchema, UpdateItemSchema } from '../schemas/cartZodSchema';
import cartServices from '../services/cartServices';
import { getParam } from '../../../lib/utils';

const router = express.Router();
router.use(authenticate);  // todos los endpoints requieren auth

router.get('/', async (req, res) => {
    const cart = await cartServices.getOrCreateCart(req.user!.userId);
    res.status(200).json(cart);
});

router.post('/items', async (req, res) => {
    const data = AddItemSchema.parse(req.body);
    const cart = await cartServices.addItem(req.user!.userId, data);
    res.status(200).json(cart);
});

router.patch('/items/:itemId', async (req, res) => {
    const itemId = getParam(req.params['itemId']);
    const data = UpdateItemSchema.parse(req.body);
    const cart = await cartServices.updateItem(req.user!.userId, itemId, data);
    res.status(200).json(cart);
});

router.delete('/items/:itemId', async (req, res) => {
    const itemId = getParam(req.params['itemId']);
    const cart = await cartServices.removeItem(req.user!.userId, itemId);
    res.status(200).json(cart);
});

router.delete('/', async (req, res) => {
    const cart = await cartServices.clearCart(req.user!.userId);
    res.status(200).json(cart);
});

export default router;
Archivo modificado
backend/src/index.ts — agregar 2 líneas:

import cartRouter from './modules/cart/routers/cartRouter';
// ...
app.use('/api/cart', cartRouter);   // antes de app.use(errorHandler)
Fase 3 — Frontend: servicio + store
Archivos a crear
frontend/src/services/cart.service.ts

Axios con baseURL: '/api/cart' y withCredentials: true. Exporta:

getCart() → GET /
addItem(productId, quantity) → POST /items
updateItem(itemId, quantity) → PATCH /items/:itemId
removeItem(itemId) → DELETE /items/:itemId
clearCart() → DELETE /
Todos retornan el cart completo (mismo shape que el backend devuelve con include).

Archivos modificados
frontend/src/types/cartTypes.ts — agregar campo id?:

export type CartItem = {
    id?: string;   // CartItem.id del server, necesario para PATCH/DELETE
    product: Product;
    quantity: number;
};
frontend/src/store/cartStore.ts — reemplazar implementación:

Eliminar persist middleware (server es la fuente de verdad)
Agregar acción loadCart(serverCart) — llamada por authStore al login/me/logout
Convertir todas las acciones a async: llaman API primero, actualizan store con la respuesta
Las firmas externas son idénticas (addItem, removeItem, updateQuantity, clearCart) — sin cambios en componentes UI
removeItem(productId) y updateQuantity(productId, qty) buscan el item.id interno para la llamada a la API
frontend/src/store/authStore.ts — agregar sincronización de carrito:

login: después de set({ user }), llamar cartService.getCart() → cartStore.loadCart(serverCart)
register: mismo patrón post-login
logout: llamar cartStore.loadCart(null) para limpiar items locales
me: después de set({ user }), llamar cartService.getCart() → cartStore.loadCart(serverCart)
Patrón: useCartStore.getState().loadCart(...) (sin hook, acceso directo al store)
Archivos afectados
Archivo	Acción
backend/prisma/schema.prisma	Fix @unique en CartItem.productId, fix relación Product.cartItems
backend/src/modules/cart/schemas/cartZodSchema.ts	Crear
backend/src/modules/cart/services/cartServices.ts	Crear
backend/src/modules/cart/routers/cartRouter.ts	Crear
backend/src/index.ts	Agregar import + app.use('/api/cart', cartRouter)
frontend/src/services/cart.service.ts	Crear
frontend/src/types/cartTypes.ts	Agregar id?: string
frontend/src/store/cartStore.ts	Reemplazar con versión API-synced
frontend/src/store/authStore.ts	Agregar cart sync en login/me/logout/register
Sin cambios: Cart.tsx, ProductActions.tsx, CartBage.tsx, todos los demás componentes.

Verificación
Registrar usuario nuevo → carrito vacío en DB
Agregar productos → verificar en npx prisma studio que aparecen en CartItem
Hacer logout → carrito limpio en UI, pero los ítems siguen en DB
Login nuevamente → carrito reaparece exactamente como se dejó
Desde otro navegador (sin localStorage) → mismo carrito
Eliminar un ítem → desaparece de DB y UI
"Vaciar carrito" → CartItem eliminados, registro Cart sigue existiendo