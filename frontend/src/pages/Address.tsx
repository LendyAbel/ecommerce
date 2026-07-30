import AddressBook from '@/features/addresses/components/AddressBook';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const Address = () => {
    return (
        <PageContainer maxWidth='3xl'>
            <title>Mis Direcciones · Voltora</title>
            <PageHeader
                title='Mis direcciones'
                subtitle='Gestiona las direcciones de envío de tu cuenta.'
            />
            <AddressBook />
        </PageContainer>
    );
};

export default Address;
