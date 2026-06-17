import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CartBadge from '@/features/cart/components/CartBadge';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';

type Props = {
    children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-text-60 hover:text-text'
    }`;

const NAV_LINKS = [
    { to: '/', label: 'Inicio' },
    { to: '/products', label: 'Productos' },
    { to: '/about', label: 'Sobre nosotros' },
] as const;

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) =>
    NAV_LINKS.map(({ to, label }) => (
        <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            {label}
        </NavLink>
    ));

const Navbar = ({ children }: Props) => {
    const { logout } = useAuth();
    const user = useAuthStore(state => state.user);
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);


    return (
        <>
            <nav
                aria-label='Navegación principal'
                className='border-border bg-surface/90 sticky top-0 z-50 flex h-12 w-full items-center justify-between border-b px-4 backdrop-blur-md md:px-6'
            >
                <span className='text-primary max-w-[45%] truncate text-xs font-semibold tracking-widest uppercase'>
                    {user ? `Hola, ${user.name}` : 'Bienvenido'}
                </span>

                {/* Enlaces — solo escritorio */}
                <div className='hidden gap-6 md:flex'>
                    <NavLinks />
                </div>

                {/* Acciones derecha — escritorio */}
                <div className='hidden items-center gap-3 md:flex'>
                    {user ? (
                        <button
                            type='button'
                            onClick={() => logout()}
                            className='text-text-60 hover:text-error cursor-pointer text-xs font-semibold tracking-widest uppercase transition-colors duration-200'
                        >
                            Salir
                        </button>
                    ) : (
                        <NavLink to='/auth' className={navLinkClass}>
                            Iniciar sesión
                        </NavLink>
                    )}
                    <CartBadge />
                </div>

                {/* Acciones derecha — móvil: carrito + hamburguesa */}
                <div className='flex items-center gap-4 md:hidden'>
                    <CartBadge />
                    <button
                        type='button'
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuOpen}
                        className='text-text-60 hover:text-text flex items-center transition-colors duration-200'
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                {/* Panel desplegable móvil */}
                {menuOpen && (
                    <div className='border-border bg-surface absolute top-12 right-0 left-0 z-50 flex flex-col gap-4 border-b px-6 py-5 shadow-lg md:hidden'>
                        <NavLinks onNavigate={closeMenu} />
                        <hr className='border-border' />
                        {user ? (
                            <button
                                type='button'
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                                className='text-text-60 hover:text-error cursor-pointer text-left text-xs font-semibold tracking-widest uppercase transition-colors duration-200'
                            >
                                Salir
                            </button>
                        ) : (
                            <NavLink
                                to='/auth'
                                className={navLinkClass}
                                onClick={closeMenu}
                            >
                                Iniciar sesión
                            </NavLink>
                        )}
                    </div>
                )}
            </nav>
            <main>{children}</main>
        </>
    );
};

export default Navbar;
