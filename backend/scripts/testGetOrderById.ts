import { OrderStatus } from '../generated/prisma/enums';
import { prisma } from '../src/lib/prisma';
import orderServices from '../src/modules/orders/services/orderServices';


const ORDER_ID = '9f4f77ed-d791-4b4a-9eca-b6b35f3d3e92';
const STATUS_UPDATE: OrderStatus = 'cancelled';

async function main() {
    const orderId = ORDER_ID;
    const statusUpdate = STATUS_UPDATE;

    if (!orderId || !statusUpdate) {
        console.log('Faltan argumentos');
        return;
    }

    console.log(`Probando updateOrder con orderId: ${orderId}\n`);

    console.log('✅ Orden antes de actualizar:');
    console.log(
        await prisma.order.findUnique({
            where: { id: orderId },
        }),
    );

    const order = await orderServices.updateOrder(orderId, statusUpdate);

    if (!order) {
        console.log(
            '❌ No se encontró ninguna orden con ese id (devolvió null).',
        );
        return;
    }

    console.log('✅ Orden actualizada:');
    console.log(order);
}

main()
    .catch(e => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
