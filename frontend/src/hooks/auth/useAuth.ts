import type { LoginForm } from '../../types/authTypes';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

const useAuth = () => {
    const login = async (LoginData: LoginForm) => {
        const user = await authService.login(LoginData);
        useAuthStore.getState().setUser(user);
        console.log(user);
    };

    const me = async () => {
        const user = await authService.me();
        useAuthStore.getState().setUser(user);
        console.log(user);
    };

    const logout = async () => {
        await authService.logout();
        useAuthStore.getState().setUser(null);
        console.log('logout');
    };

    return { login, me, logout };
};

export default useAuth;
