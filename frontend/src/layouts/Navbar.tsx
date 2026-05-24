import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import CartBage from '../components/cart/CartBage';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/auth/useAuth';

type Props = {
    children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-text-60 hover:text-text'
    }`;

const Navbar = ({ children }: Props) => {
    const { logout } = useAuth();
    const user = useAuthStore(state => state.user);

    return (
        <>
            <nav
                aria-label='Navegación principal'
                className='border-border bg-surface/90 flex h-12 w-full items-center justify-between border-b px-6 backdrop-blur-md'
            >
                <span className='text-primary text-xs font-semibold tracking-widest uppercase'>
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
                            <button
                                type='button'
                                onClick={() => logout()}
                                className='text-text-60 hover:text-error cursor-pointer text-xs font-semibold tracking-widest uppercase transition-colors duration-200'
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to='/auth' className={navLinkClass}>
                                Iniciar sesión
                            </NavLink>
                        </>
                    )}
                    <CartBage />
                </div>
            </nav>
            {children}
        </>
    );
};

export default Navbar;
