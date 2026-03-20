import { useNavigate } from 'react-router';
import type { Product } from '../../types/productTypes';
import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Typography,
} from '@mui/material';
import ProductStockBadge from './ProductStockBadge';
import ProductPrice from './ProductPrice';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();
    const mainImage =
        product.images?.find(i => i.isMain)?.url ?? product.images?.[0]?.url;

    const handleClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <Card
            component={'div'}
            onClick={handleClick}
            variant='outlined'
            className='flex flex-col p-1 shadow-md hover:shadow-xl'
        >
            <CardHeader title={product.name} className='self-center' />
            <CardContent>
                {(product.images ?? []).length > 0 && (
                    <CardMedia
                        component='img'
                        sx={{ width: 200, objectFit: 'cover' }}
                        image={mainImage}
                    />
                )}
                <Typography>{product.shortDescription}</Typography>
                <div className='flex justify-between'>
                    <ProductPrice price={product.price} tax={product.tax} />
                    <ProductStockBadge stock={product.stock} />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
