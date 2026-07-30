import ProductsList from '@/features/products/components/ProductsList';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const Products = () => {
    return (
        <PageContainer maxWidth='6xl'>
            <title>Productos · Voltora</title>
            <PageHeader title='Productos' subtitle='Revisa y escoge el producto que más te guste' />
            <ProductsList />
        </PageContainer>
    );
};

export default Products;
