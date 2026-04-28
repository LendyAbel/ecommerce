import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import CartBage from '../components/cart/CartBage';
import { useAuthStore } from '../store/authStore';

type Props = {
    children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-text-60 hover:text-text'
    }`;

const Navbar = ({ children }: Props) => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);

    return (
        <>
            <nav
                aria-label='Navegación principal'
                className='flex h-12 w-full items-center justify-between border-b border-border bg-surface/90 px-6 backdrop-blur-md'
            >
                <span className='text-xs font-semibold uppercase tracking-widest text-primary'>
                    {user ? `Hola, ${user.name}` : 'Bienvenido'}
                </span>

                <div className='flex gap-6'>
                    <NavLink to='/' className={navLinkClass}>
                        Inicio
                    </NavLink>
                    <NavLink to='/products' className={navLinkClass}>
                        Productos
                    </NavLink>
                    <NavLink to='/about' className={navLinkClass}>
                        Sobre nosotros
                    </NavLink>
                </div>

                <div className='flex items-center gap-3'>
                    {user ? (
                        <>
                            <CartBage />
                            <button
                                type='button'
                                onClick={logout}
                                className='cursor-pointer text-xs font-semibold uppercase tracking-widest text-text-60 transition-colors duration-200 hover:text-error'
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <NavLink to='/auth' className={navLinkClass}>
                            Iniciar sesión
                        </NavLink>
                    )}
                </div>
            </nav>
            {children}
        </>
    );
};

export default Navbar;
