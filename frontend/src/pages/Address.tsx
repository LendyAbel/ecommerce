import { AddressBook } from '@/features/addresses';
import { PageContainer } from '@/shared/components';

const Address = () => {
    return (
        <PageContainer maxWidth='3xl'>
            <header className='mb-6'>
                <h1 className='text-text font-display text-2xl font-extrabold'>
                    Mis direcciones
                </h1>
                <p className='text-text-60 text-sm'>
                    Gestiona las direcciones de envío de tu cuenta.
                </p>
            </header>

            <AddressBook />
        </PageContainer>
    );
};

export default Address;
