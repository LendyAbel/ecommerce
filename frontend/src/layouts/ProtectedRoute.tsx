import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
    const user = useAuthStore(state => state.user);
    const isAuthLoading = useAuthStore(state => state.isAuthLoading);

    if (isAuthLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <CircularProgress />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to='/auth' replace />;
};

export default ProtectedRoute;
