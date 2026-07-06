/**
 * Script TEMPORAL para poblar la base de datos con datos de prueba.
 * Añade (NO resetea) 30 productos, 3 usuarios y 20 órdenes con status variados.
 *
 * Ejecutar desde backend/:
 *   npx ts-node prisma/temp-bulk-seed.ts
 *
 * Puedes borrar este archivo cuando ya no lo necesites.
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import {
    OrderStatus,
    PrismaClient,
    ProductStatus,
    UserRole,
} from './generated/prisma/client';

const SALT_ROUNDS = 10;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ── Helpers ───────────────────────────────────────────────────────────────
const pick = <T>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Sufijo único para esta ejecución, evita colisiones de SKU/email al re-ejecutar.
const RUN = Date.now().toString(36).toUpperCase().slice(-5);

const PLACEHOLDER_IMG = 'https://placehold.co/600x600/png';

const CATEGORIES = [
    'electronica',
    'gaming',
    'perifericos',
    'audio',
    'hogar',
    'oficina',
    'fotografia',
    'movilidad',
] as const;

const BRANDS = [
    'Logitech',
    'Sony',
    'Razer',
    'AOC',
    'Samsung',
    'Asus',
    'Xiaomi',
    'HP',
    'Corsair',
    'Anker',
] as const;

const PRODUCT_TYPES = [
    'Ratón inalámbrico',
    'Teclado mecánico',
    'Auriculares Bluetooth',
    'Monitor 24"',
    'Webcam Full HD',
    'Altavoz portátil',
    'Disco SSD 1TB',
    'Memoria USB 128GB',
    'Hub USB-C',
    'Cargador rápido',
    'Silla ergonómica',
    'Lámpara LED escritorio',
    'Router WiFi 6',
    'Tablet 10"',
    'Smartwatch',
    'Powerbank 20000mAh',
    'Micrófono USB',
    'Soporte para portátil',
    'Cámara de seguridad',
    'Patinete eléctrico',
] as const;

const PRODUCT_STATUSES: ProductStatus[] = ['published', 'discontinued', 'draft'];

// 30 productos generados con datos variados
const products = Array.from({ length: 30 }, (_, i) => {
    const type = pick(PRODUCT_TYPES);
    const brand = pick(BRANDS);
    const n = i + 1;
    // mayoría published para que las órdenes tengan productos "reales"
    const status = i < 22 ? 'published' : pick(PRODUCT_STATUSES);
    const mainCategory = pick(CATEGORIES);
    let otherCategory = pick(CATEGORIES);
    if (otherCategory === mainCategory)
        otherCategory = pick(CATEGORIES.filter(c => c !== mainCategory));

    return {
        sku: `TMP-${RUN}-${String(n).padStart(3, '0')}`,
        name: `${type} ${brand} ${n}`,
        shortDescription: `${type} de la marca ${brand}, ideal para el día a día.`,
        longDescription: `${type} ${brand} (unidad de prueba #${n}). Producto generado automáticamente para poblar la base de datos con fines de desarrollo y testing.`,
        brand,
        price: randInt(999, 49999) / 100, // 9.99 – 499.99
        tax: 21,
        stock: status === 'published' ? randInt(5, 300) : randInt(0, 10),
        status: status as ProductStatus,
        mainCategory,
        otherCategories: [otherCategory],
        images: [{ url: PLACEHOLDER_IMG, isMain: true }],
    };
});

// 3 usuarios nuevos (passwords en texto plano, se hashean al insertar)
const users = [
    {
        email: `carla.${RUN.toLowerCase()}@test.com`,
        password: 'password123',
        name: 'Carla Gómez',
        role: 'customer' as const,
    },
    {
        email: `marco.${RUN.toLowerCase()}@test.com`,
        password: 'password123',
        name: 'Marco Ruiz',
        role: 'customer' as const,
    },
    {
        email: `lucia.${RUN.toLowerCase()}@test.com`,
        password: 'password123',
        name: 'Lucía Fernández',
        role: 'customer' as const,
    },
];

const ORDER_STATUSES: OrderStatus[] = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
];

function frozenAddressFor(name: string) {
    return {
        fullName: name,
        phone: `+34 6${randInt(10, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`,
        line1: `Calle Ejemplo ${randInt(1, 200)}`,
        line2: randInt(0, 1) ? `${randInt(1, 5)}º ${pick(['A', 'B', 'C'])}` : null,
        city: pick(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']),
        state: pick(['Madrid', 'Cataluña', 'C. Valenciana', 'Andalucía', 'País Vasco']),
        postalCode: String(randInt(1000, 52000)).padStart(5, '0'),
        country: 'España',
    };
}

async function main() {
    console.log(`🔖 Ejecución RUN=${RUN}\n`);

    // ── Usuarios ────────────────────────────────────────────────────────────
    const createdUsers: { id: string; name: string }[] = [];
    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                password: hashedPassword,
                name: u.name,
                role: u.role as UserRole,
            },
        });
        createdUsers.push({ id: user.id, name: user.name });
        console.log(`✅ Usuario creado: ${user.email}`);
    }

    // ── Productos ─────────────────────────────────────────────────────────────
    const createdProducts: {
        id: string;
        sku: string;
        name: string;
        price: number;
    }[] = [];
    for (const p of products) {
        const mainCat = await prisma.category.upsert({
            where: { name: p.mainCategory },
            update: {},
            create: { name: p.mainCategory },
        });
        const otherCats = await Promise.all(
            p.otherCategories.map(catName =>
                prisma.category.upsert({
                    where: { name: catName },
                    update: {},
                    create: { name: catName },
                }),
            ),
        );

        const product = await prisma.product.create({
            data: {
                sku: p.sku,
                name: p.name,
                shortDescription: p.shortDescription,
                longDescription: p.longDescription,
                brand: p.brand,
                price: p.price,
                tax: p.tax,
                stock: p.stock,
                status: p.status,
                mainCategory: { connect: { id: mainCat.id } },
                categories: { connect: otherCats.map(c => ({ id: c.id })) },
                images: { create: p.images },
            },
        });
        createdProducts.push({
            id: product.id,
            sku: p.sku,
            name: p.name,
            price: p.price,
        });
    }
    console.log(`✅ ${createdProducts.length} productos creados`);

    // Solo productos "vendibles" para las órdenes
    const sellable = createdProducts;

    // ── Órdenes (20, status variados) ─────────────────────────────────────────
    for (let i = 0; i < 20; i++) {
        const buyer = pick(createdUsers);
        // Reparte status: al menos uno de cada, el resto aleatorio
        const status =
            i < ORDER_STATUSES.length
                ? ORDER_STATUSES[i]
                : pick(ORDER_STATUSES);

        const lineCount = randInt(1, 4);
        const chosen = new Set<number>();
        while (chosen.size < lineCount) chosen.add(randInt(0, sellable.length - 1));

        const lines = [...chosen].map(idx => {
            const p = sellable[idx]!;
            return {
                productId: p.id,
                skuAtPurchase: p.sku,
                nameAtPurchase: p.name,
                priceAtPurchase: p.price,
                quantity: randInt(1, 3),
            };
        });

        const totalAmount = lines.reduce(
            (sum, l) => sum + l.priceAtPurchase * l.quantity,
            0,
        );

        const frozen = frozenAddressFor(buyer.name);
        const order = await prisma.order.create({
            data: {
                status,
                totalAmount,
                user: { connect: { id: buyer.id } },
                shippingAddress: { create: { ...frozen } },
                billingAddress: { create: { ...frozen } },
                orderItems: { create: lines },
            },
        });
        console.log(
            `✅ Orden #${order.orderNumber} (${status}) — ${lines.length} líneas — total ${totalAmount.toFixed(2)}`,
        );
    }
}

main()
    .then(async () => {
        console.log('\n🌱 Datos de prueba añadidos correctamente');
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
