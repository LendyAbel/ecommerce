// import { OrderStatus } from '../generated/prisma/enums';
import { prisma } from '../src/lib/prisma';
import orderServices from '../src/modules/orders/services/orderServices';


const ORDER_ID = '684637fd-6590-4b5e-a557-942d674a7612';
const USER_ID = 'b1fff735-8972-4c4e-a483-e5b8fbab9a8e'
// const STATUS_UPDATE: OrderStatus = 'cancelled';

async function main() {
    const orderId = ORDER_ID;
    // const statusUpdate = STATUS_UPDATE;
    const userId = USER_ID

    if (!orderId || !userId) {
        console.log('Faltan argumentos');
        return;
    }

    console.log(`Probando getOrderbyId con orderId: ${orderId}\n`);

    // console.log('✅ Orden antes de actualizar:');
    // console.log(
    //     await prisma.order.findUnique({
    //         where: { id: orderId },
    //     }),
    // );

    const order = await orderServices.getOrderbyId(orderId, userId);

    if (!order) {
        console.log(
            '❌ No se encontró ninguna orden con ese id (devolvió null).',
        );
        return;
    }

    console.log('✅ Orden:');
    console.log(order);
}

main()
    .catch(e => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
