import { useState } from 'react';

import AuthMobile from '@/features/auth/components/AuthMobile';
import Login from '@/features/auth/components/Login';
import Register from '@/features/auth/components/Register';
import SlicePanel from '@/features/auth/components/SlicePanel';
import { useMediaQuery } from '@/shared/hooks';

const Authenticate = () => {
    const [showLogin, setShowLogin] = useState(true);
    // En escritorio (>= md de Tailwind) se usa el panel dividido animado; en
    // móvil, una tarjeta apilada con toggle. Se renderiza solo uno (no ambos).
    const isDesktop = useMediaQuery('(min-width: 768px)');

    return (
        <div className='bg-bg flex min-h-[calc(100vh-48px)] w-full items-center justify-center overflow-hidden px-4 py-8'>
            <title>Autenticación · Voltora</title>
            {isDesktop ? (
                <div className='border-border bg-surface relative flex h-130 w-215 overflow-hidden rounded-2xl border shadow-xl'>
                    <Login showLogin={showLogin} />
                    <SlicePanel
                        showLogin={showLogin}
                        setShowLogin={setShowLogin}
                    />
                    <Register showLogin={showLogin} />
                </div>
            ) : (
                <AuthMobile />
            )}
        </div>
    );
};

export default Authenticate;
