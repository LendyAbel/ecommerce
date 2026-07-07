import { Navigate, Outlet } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { Spinner } from '@/shared/ui';

const ProtectedRoute = () => {
    const user = useAuthStore(state => state.user);
    const isAuthLoading = useAuthStore(state => state.isAuthLoading);

    if (isAuthLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Spinner className='text-primary size-10' label='Cargando' />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to='/auth' replace />;
};

export default ProtectedRoute;
