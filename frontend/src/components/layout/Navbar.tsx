import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import CartBage from '../cart/CartBage';
import { useAuthStore } from '../../store/authStore';

type Props = {
    children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
        isActive ? 'text-white' : 'text-white/50 hover:text-white'
    }`;

const Navbar = ({ children }: Props) => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);

    return (
        <>
            <nav
                aria-label='Navegación principal'
                className='flex h-12 w-full items-center justify-between border-b border-white/10 bg-[#0f0c29]/90 px-6 backdrop-blur-md'
            >
                <span className='text-xs font-semibold tracking-widest text-purple-400 uppercase'>
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
                                className='text-xs font-semibold tracking-widest text-white/50 uppercase transition-colors duration-200 hover:cursor-pointer hover:text-white'
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
