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

// Fotos reales de Wikimedia Commons (contenido verificado por título de archivo,
// no un servicio de tags no fiable) — 2 imágenes distintas por tipo de producto.
const PRODUCT_TYPE_IMAGES: Record<(typeof PRODUCT_TYPES)[number], [string, string]> = {
    'Ratón inalámbrico': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg/960px-2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Computer_mouse_1_2015-02-28.JPG/960px-Computer_mouse_1_2015-02-28.JPG',
    ],
    'Teclado mecánico': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Backlit_keyboard.jpg/960px-Backlit_keyboard.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/QWERTY_keyboard.jpg/960px-QWERTY_keyboard.jpg',
    ],
    'Auriculares Bluetooth': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Headphones_on_desk.jpg/960px-Headphones_on_desk.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Studio_Headphones.jpg/960px-Studio_Headphones.jpg',
    ],
    'Monitor 24"': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Dell_monitor_and_keyboard.jpg/960px-Dell_monitor_and_keyboard.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/7/7a/Dual_Dell_monitor_workstation_setup.jpg',
    ],
    'Webcam Full HD': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/USB_webcam_for_PC.jpg/960px-USB_webcam_for_PC.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Webcam_%28Logitech_c922%29.jpg/960px-Webcam_%28Logitech_c922%29.jpg',
    ],
    'Altavoz portátil': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/JBL_Flip_3_bluetooth_speaker_%28DSCF2653%29.jpg/960px-JBL_Flip_3_bluetooth_speaker_%28DSCF2653%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/UE_Boom_2.jpg/960px-UE_Boom_2.jpg',
    ],
    'Disco SSD 1TB': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toshiba_1_TB_External_USB_Hard_Drive.jpg/960px-Toshiba_1_TB_External_USB_Hard_Drive.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/WD_Blue_Hard_Disk_Drive_connected_to_Laptop_via_USB-C.jpg/960px-WD_Blue_Hard_Disk_Drive_connected_to_Laptop_via_USB-C.jpg',
    ],
    'Memoria USB 128GB': [
        'https://upload.wikimedia.org/wikipedia/commons/6/67/USB_flash_drive.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg/960px-Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg',
    ],
    'Hub USB-C': [
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/4port-usb-hub-bus-powered.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/USB_hub_Gembird.jpg/960px-USB_hub_Gembird.jpg',
    ],
    'Cargador rápido': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/USB_power_adapter_for_Apple_iPod%2C_Model_A1205%2C_by_Foxlink_Technology_Ltd-1048.jpg/960px-USB_power_adapter_for_Apple_iPod%2C_Model_A1205%2C_by_Foxlink_Technology_Ltd-1048.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Apple_5W_USB_Power_Adapter_%284935%29.jpg/960px-Apple_5W_USB_Power_Adapter_%284935%29.jpg',
    ],
    'Silla ergonómica': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Buerostuhl_%28fcm%29.jpg/960px-Buerostuhl_%28fcm%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Office_chair_%284444288246%29.jpg/960px-Office_chair_%284444288246%29.jpg',
    ],
    'Lámpara LED escritorio': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Battery_powered_LED_desk_lamp-7420.jpg/960px-Battery_powered_LED_desk_lamp-7420.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/7/71/Concise_bamboo_eye_protection_LED_desk_lamp.jpg',
    ],
    'Router WiFi 6': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Netgear_N300_wireless_router_n03.jpg/960px-Netgear_N300_wireless_router_n03.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Wi-fi_router.jpg/960px-Wi-fi_router.jpg',
    ],
    'Tablet 10"': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Tablet_computer.jpeg/960px-Tablet_computer.jpeg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Tablet_computer.jpg/960px-Tablet_computer.jpg',
    ],
    Smartwatch: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/PineTime_smartwatch.jpg/960px-PineTime_smartwatch.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Samsung_Gear_S3.jpg/960px-Samsung_Gear_S3.jpg',
    ],
    'Powerbank 20000mAh': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/GP_PowerBank_Smart_2.jpg/960px-GP_PowerBank_Smart_2.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Power_bank.JPG/960px-Power_bank.JPG',
    ],
    'Micrófono USB': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Blue_Snowflake_USB_microphone.jpg/960px-Blue_Snowflake_USB_microphone.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Rode_NT-USB.jpg/960px-Rode_NT-USB.jpg',
    ],
    'Soporte para portátil': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Laptop_stand.jpg/960px-Laptop_stand.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/X_Shaped_Laptop_Stand_With_Telescopic_Holders.png/960px-X_Shaped_Laptop_Stand_With_Telescopic_Holders.png',
    ],
    'Cámara de seguridad': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/CCTV_camera_in_Poland_%281%29.jpg/960px-CCTV_camera_in_Poland_%281%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/e/e1/CP_Plus_CCTV_camera.jpg',
    ],
    'Patinete eléctrico': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Seattle_%28WA%2C_USA%29%2C_Pike_Street%2C_E-Scooter_--_2022_--_1460.jpg/960px-Seattle_%28WA%2C_USA%29%2C_Pike_Street%2C_E-Scooter_--_2022_--_1460.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Seattle_%28WA%2C_USA%29%2C_Pine_Street%2C_E-Scooter_--_2022_--_1489.jpg/960px-Seattle_%28WA%2C_USA%29%2C_Pine_Street%2C_E-Scooter_--_2022_--_1489.jpg',
    ],
};

// Todos los productos generados de un mismo tipo comparten estas 2 fotos reales
// (son unidades de prueba sintéticas, no hace falta una foto única por unidad).
const imagesForType = (type: (typeof PRODUCT_TYPES)[number]) => {
    const [main, secondary] = PRODUCT_TYPE_IMAGES[type];
    return [
        { url: main, isMain: true },
        { url: secondary, isMain: false },
    ];
};

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
        images: imagesForType(type),
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
