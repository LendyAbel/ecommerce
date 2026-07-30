import Wizard from '@/features/checkout/components/Wizard';
import { PageContainer } from '@/shared/components';

const Checkout = () => {
    return (
        <PageContainer maxWidth='5xl'>
            <title>Pedido · Voltora</title>
            <Wizard />
        </PageContainer>
    );
};

export default Checkout;
