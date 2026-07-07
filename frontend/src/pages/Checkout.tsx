import { Wizard } from '@/features/checkout';
import { PageContainer } from '@/shared/components';

const Checkout = () => {
    return (
        <PageContainer maxWidth='5xl'>
            <Wizard />
        </PageContainer>
    );
};

export default Checkout;
