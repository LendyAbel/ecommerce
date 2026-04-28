import { useNavigate } from 'react-router';

import { Badge, IconButton } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useCartStore } from '../../store/cartStore';

const CartBage = () => {
    const navigate = useNavigate();
    const totalItems = useCartStore(state => state.totalItems());

    return (
        <IconButton onClick={() => navigate('/cart')} color='inherit'>
            <Badge badgeContent={totalItems} color='error'>
                <ShoppingCart />
            </Badge>
        </IconButton>
    );
};

export default CartBage;
