import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import CartBage from '../cart/CartBage';

type Props = {
    children: ReactNode;
};

const Navbar = ({ children }: Props) => {
    return (
        <>
            <Box
                component={'div'}
                className='flex h-12 w-full items-center justify-between bg-[#79a7ec] p-5 text-white'
            >
                BIENVENIDO
                <div className='flex gap-6'>
                    <NavLink to='/'>HOME</NavLink>
                    <NavLink to='/products'>PRODUCTS</NavLink>
                    <NavLink to='/about'>ABOUT</NavLink>
                </div>
                <div style={{ display: 'flex' }}>
                    {/* <PanelMenu /> */}
                    <CartBage />
                </div>
            </Box>
            {children}
        </>
    );
};

export default Navbar;
