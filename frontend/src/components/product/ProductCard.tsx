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

    const handleClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <Card
            component={'div'}
            onClick={handleClick}
            variant='outlined'
            className='p-1 shadow-md hover:shadow-xl'
        >
            <CardHeader title={product.name} />
            <CardContent>
                {(product.images?? []).length > 0 && (
                    <CardMedia
                        component='img'
                        sx={{ width: 150, objectFit: 'cover' }}
                        image={product.images?.find(i => i.isMain === true)?.url}
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
