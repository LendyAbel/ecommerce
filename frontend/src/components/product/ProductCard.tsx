import type { Product } from '../../types/productTypes';
import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Typography,
} from '@mui/material';


interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <Card variant='outlined' className='p-1'>
            <CardHeader title={product.name} />
            <CardContent>
                {product.images?.[0] && (
                    <CardMedia
                        component='img'
                        sx={{ width: 150, objectFit: 'cover' }}
                        image={product.images.find(i => i.isMain === true)?.url}
                    />
                )}
                <Typography>{product.shortDescription}</Typography>
                <Typography>Price: {product.price} €</Typography>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
