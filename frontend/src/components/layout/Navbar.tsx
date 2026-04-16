import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import CartBage from '../cart/CartBage';
import { useAuthStore } from '../../store/authStore';

type Props = {
    children: ReactNode;
};

const Navbar = ({ children }: Props) => {
    const user = useAuthStore.getState().user;
    return (
        <>
            <Box
                component={'div'}
                className='flex h-12 w-full items-center justify-between bg-[#79a7ec] p-5 text-white'
            >
                {' '}
                {user ? `HOLA, ${user.name?.toUpperCase()}` : `BIENVENIDO`}
                <div className='flex gap-6'>
                    <NavLink to='/'>HOME</NavLink>
                    <NavLink to='/products'>PRODUCTS</NavLink>
                    <NavLink to='/about'>ABOUT</NavLink>
                </div>
                <div className='flex items-center'>
                    {/* <PanelMenu /> */}
                    {user ? (
                        <NavLink to='/cart'>
                            <CartBage />
                        </NavLink>
                    ) : (
                        <NavLink to='/auth'>LOGIN</NavLink>
                    )}
                </div>
            </Box>
            {children}
        </>
    );
};

export default Navbar;
