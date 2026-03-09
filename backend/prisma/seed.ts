import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

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

async function main() {
    for (const p of products) {
        // Busca o crea la categoría principal
        const mainCat = await prisma.category.upsert({
            where: { id: p.mainCategory },
            update: {},
            create: { name: p.mainCategory },
        });

        // Busca o crea las categorías secundarias
        const otherCats = await Promise.all(
            p.otherCategories.map(catName =>
                prisma.category.upsert({
                    where: { id: catName },
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
                status: p.status,
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

        console.log(`✅ Producto creado: ${product.name}`);
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
