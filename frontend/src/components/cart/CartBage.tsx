import { useNavigate } from 'react-router';

import { Badge, IconButton } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

const CartBage = () => {
    const navigate = useNavigate();

    return (
        <IconButton onClick={() => navigate('/cart')} color='inherit'>
            <Badge badgeContent={2} color='error'>
                <ShoppingCart />
            </Badge>
        </IconButton>
    );
};

export default CartBage;
