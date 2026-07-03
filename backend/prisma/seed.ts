import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import { OrderStatus,PrismaClient, ProductStatus, UserRole } from '../generated/prisma/client';

const SALT_ROUNDS = 10;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const products = [
    {
        sku: 'MOUSE-LOGI-G502-BLK',
        name: 'Ratón gaming Logitech G502',
        shortDescription:
            'Ratón gaming ergonómico con 11 botones programables.',
        longDescription:
            'Ratón gaming Logitech G502 HERO con sensor de alta precisión, 11 botones programables, peso ajustable y retroiluminación RGB.',
        brand: 'Logitech',
        price: 69.99,
        tax: 21,
        stock: 120,
        status: 'published',
        mainCategory: 'gaming',
        otherCategories: ['perifericos', 'electronica'],
        images: [
            {
                url: 'https://i.pinimg.com/736x/17/fe/7a/17fe7a287650338935def8e91c51d570.jpg',
                isMain: true,
            },
            {
                url: 'https://i.pinimg.com/1200x/44/e5/15/44e5159e5b907a87cf9103a40347e46c.jpg',
                isMain: false,
            },
        ],
    },
    {
        sku: 'KEYB-MECH-RGB-TKL',
        name: 'Teclado mecánico TKL RGB',
        shortDescription:
            'Teclado mecánico TKL con switches rojos y retroiluminación RGB.',
        longDescription:
            'Teclado mecánico tenkeyless con switches lineales rojos, estructura de aluminio, keycaps PBT y retroiluminación RGB direccionable.',
        brand: 'RedDragon',
        price: 89.9,
        tax: 21,
        stock: 60,
        status: 'published',
        mainCategory: 'perifericos',
        otherCategories: ['gaming'],
        images: [
            {
                url: 'https://i.pinimg.com/1200x/69/fb/e1/69fbe186cfd816591247bada05689b19.jpg',
                isMain: true,
            },
        ],
    },
    {
        sku: 'HEADPH-BT-ANC-BLK',
        name: 'Auriculares Bluetooth con ANC',
        shortDescription:
            'Auriculares over-ear Bluetooth con cancelación de ruido activa.',
        longDescription:
            'Auriculares inalámbricos over-ear con cancelación de ruido activa (ANC), hasta 30 horas de batería y carga rápida USB-C.',
        brand: 'Sony',
        price: 199.0,
        tax: 21,
        stock: 35,
        status: 'published',
        mainCategory: 'audio',
        otherCategories: ['electronica'],
        images: [
            {
                url: 'https://i.pinimg.com/474x/b3/4b/06/b34b06b387e80dc28ac11d6145e82472.jpg',
                isMain: true,
            },
        ],
    },
    {
        sku: 'MONITOR-27-144HZ-IPS',
        name: 'Monitor 27" 144Hz IPS',
        shortDescription: 'Monitor gaming 27 pulgadas, 144Hz, panel IPS.',
        longDescription:
            'Monitor de 27" con resolución 2560x1440, tasa de refresco 144Hz, panel IPS, compatible con FreeSync y G-Sync.',
        brand: 'AOC',
        price: 299.99,
        tax: 21,
        stock: 18,
        status: 'published',
        mainCategory: 'electronica',
        otherCategories: ['gaming'],
        images: [
            {
                url: 'https://i.pinimg.com/1200x/3a/cb/9a/3acb9a5fe842ed9b6eba2ccd4e6961e2.jpg',
                isMain: true,
            },
        ],
    },
    {
        sku: 'MOUSEPAD-XL-RGB',
        name: 'Alfombrilla gaming XL RGB',
        shortDescription: 'Alfombrilla XXL con iluminación RGB perimetral.',
        longDescription:
            'Alfombrilla de ratón tamaño XXL con superficie de tejido microtexturizado, base de goma antideslizante e iluminación RGB perimetral con múltiples efectos.',
        brand: 'Razer',
        price: 39.99,
        tax: 21,
        stock: 0,
        status: 'discontinued',
        mainCategory: 'gaming',
        otherCategories: ['perifericos'],
        images: [
            {
                url: 'https://i.pinimg.com/1200x/5f/82/fd/5f82fd1d9a285976158f1025a62cc9f1.jpg',
                isMain: true,
            },
        ],
    },
];
// Passwords en texto plano; se hashean con bcrypt en el seed (ver main()).
const users = [
    {
        email: 'admin@test.com',
        password: 'admin',
        name: 'Admin',
        role: 'admin',
    },
    {
        email: 'user@test.com',
        password: 'user',
        name: 'User',
        role: 'customer',
    },
];

async function main() {
    // Crea los usuarios y los guarda por email para reutilizarlos más abajo
    const usersByEmail: Record<string, { id: string }> = {};
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
        usersByEmail[u.email] = user;
        console.log(`✅ Usuario creado: ${user.email}`);
    }

    // Crea los productos y los guarda por sku para reutilizarlos en carrito/órdenes
    const productsBySku: Record<
        string,
        { id: string; sku: string; name: string; price: number }
    > = {};
    for (const p of products) {
        // Busca o crea la categoría principal
        const mainCat = await prisma.category.upsert({
            where: { name: p.mainCategory },
            update: {},
            create: { name: p.mainCategory },
        });

        // Busca o crea las categorías secundarias
        const otherCats = await Promise.all(
            p.otherCategories.map(catName =>
                prisma.category.upsert({
                    where: { name: catName },
                    update: {},
                    create: { name: catName },
                }),
            ),
        );

        // Crea el producto con imágenes y relaciones
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
                status: p.status as ProductStatus,
                mainCategory: {
                    connect: { id: mainCat.id },
                },
                categories: {
                    connect: otherCats.map(cat => ({ id: cat.id })),
                },
                images: {
                    create: p.images,
                },
            },
        });

        productsBySku[p.sku] = {
            id: product.id,
            sku: p.sku,
            name: p.name,
            price: p.price,
        };
        console.log(`✅ Producto creado: ${product.name}`);
    }

    // ── Datos del cliente: libreta de direcciones, carrito y órdenes ──────────
    const customer = usersByEmail['user@test.com'];
    if (!customer) throw new Error('Seed: usuario user@test.com no encontrado');

    // Acceso seguro a un producto sembrado por sku
    const product = (sku: string) => {
        const p = productsBySku[sku];
        if (!p) throw new Error(`Seed: producto ${sku} no encontrado`);
        return p;
    };

    // Libreta de direcciones del usuario (userId set → direcciones reutilizables)
    const homeAddress = await prisma.address.create({
        data: {
            userId: customer.id,
            fullName: 'User Cliente',
            phone: '+34 600 123 456',
            line1: 'Calle Mayor 10',
            line2: '3º B',
            city: 'Madrid',
            state: 'Madrid',
            postalCode: '28013',
            country: 'España',
        },
    });
    console.log(`✅ Dirección creada: ${homeAddress.line1}`);

    // Carrito del usuario con un par de líneas
    const cart = await prisma.cart.create({
        data: {
            userId: customer.id,
            cartItems: {
                create: [
                    {
                        productId: product('MONITOR-27-144HZ-IPS').id,
                        quantity: 1,
                    },
                    {
                        productId: product('MOUSE-LOGI-G502-BLK').id,
                        quantity: 2,
                    },
                ],
            },
        },
    });
    console.log(`✅ Carrito creado para: ${customer.id} (id ${cart.id})`);

    // Datos de la dirección que se "congelarán" como copia en cada orden
    const frozenAddress = {
        fullName: 'User Cliente',
        phone: '+34 600 123 456',
        line1: 'Calle Mayor 10',
        line2: '3º B',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28013',
        country: 'España',
    };

    // Construye una línea de orden congelando sku/nombre/precio del producto
    const lineFor = (sku: string, quantity: number) => {
        const p = product(sku);
        return {
            productId: p.id,
            skuAtPurchase: p.sku,
            nameAtPurchase: p.name,
            priceAtPurchase: p.price,
            quantity,
        };
    };

    // Órdenes de ejemplo (la dirección se crea como copia congelada: userId null)
    const orderSeeds: {
        status: OrderStatus;
        items: { sku: string; quantity: number }[];
    }[] = [
        {
            status: 'delivered',
            items: [
                { sku: 'MOUSE-LOGI-G502-BLK', quantity: 1 },
                { sku: 'KEYB-MECH-RGB-TKL', quantity: 1 },
            ],
        },
        {
            status: 'pending',
            items: [{ sku: 'HEADPH-BT-ANC-BLK', quantity: 1 }],
        },
    ];

    for (const o of orderSeeds) {
        const lines = o.items.map(it => lineFor(it.sku, it.quantity));
        const totalAmount = lines.reduce(
            (sum, l) => sum + l.priceAtPurchase * l.quantity,
            0,
        );

        const order = await prisma.order.create({
            data: {
                status: o.status,
                totalAmount,
                user: { connect: { id: customer.id } },
                // Copias congeladas e independientes para envío y facturación
                shippingAddress: { create: { ...frozenAddress } },
                billingAddress: { create: { ...frozenAddress } },
                orderItems: { create: lines },
            },
        });
        console.log(
            `✅ Orden #${order.orderNumber} creada (${o.status}) — total ${totalAmount}`,
        );
    }
}

main()
    .then(async () => {
        console.log('🌱 Seed completado');
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error('❌ Error en seed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
