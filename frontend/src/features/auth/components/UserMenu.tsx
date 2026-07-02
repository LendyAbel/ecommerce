import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';

import { preloadRoute } from '@/app/routePreload';
import { ACCOUNT_LINKS } from '@/features/auth/components/accountLinks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';

const itemClass =
    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold tracking-widest uppercase transition-colors duration-200';

const UserMenu = () => {
    const { logout } = useAuth();
    const user = useAuthStore(state => state.user);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const close = () => setOpen(false);

    // Cerrar al hacer clic fuera o al pulsar Escape.
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                close();
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (!user) return null;

    return (
        <div ref={containerRef} className='relative'>
            <button
                type='button'
                onClick={() => setOpen(o => !o)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='text-text-60 hover:text-primary flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200'
            >
                <AccountCircleIcon fontSize='small' />
                <span className='max-w-32 truncate'>{user.name}</span>
                <KeyboardArrowDownIcon
                    fontSize='small'
                    className={`transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div
                    role='menu'
                    className='border-border bg-surface absolute top-[calc(100%+0.5rem)] right-0 z-50 w-52 overflow-hidden rounded-md border py-1 shadow-lg'
                >
                    {ACCOUNT_LINKS.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            role='menuitem'
                            onClick={close}
                            onMouseEnter={() => preloadRoute(to)}
                            onFocus={() => preloadRoute(to)}
                            className={({ isActive }) =>
                                `${itemClass} ${
                                    isActive
                                        ? 'text-primary bg-primary/10'
                                        : 'text-text-60 hover:text-primary hover:bg-primary/10'
                                }`
                            }
                        >
                            <Icon fontSize='small' />
                            {label}
                        </NavLink>
                    ))}

                    <hr className='border-border my-1' />

                    <button
                        type='button'
                        role='menuitem'
                        onClick={() => {
                            close();
                            logout();
                        }}
                        className={`${itemClass} text-text-60 hover:text-error hover:bg-error/10 cursor-pointer`}
                    >
                        <LogoutIcon fontSize='small' />
                        Salir
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
