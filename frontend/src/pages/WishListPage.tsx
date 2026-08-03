import WishList from '@/features/wishlist/components/WishList';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const WishListPage = () => {
    return (
        <PageContainer maxWidth='3xl'>
            <title>Pedidos · Voltora</title>
            <PageHeader
                title='Lista de deseados'
                subtitle='Guarda tus favoritos y compra luego'
            />
            <WishList />
        </PageContainer>
    );
};

export default WishListPage;
