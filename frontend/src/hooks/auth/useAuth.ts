import type { LoginForm } from '../../types/authTypes';
import authService from '../../services/auth.service';

const useAuth = () => {
    
    const login = async (LoginData: LoginForm) => {
        const user = await authService.login(LoginData);
        console.log(user);
        return user;
    };

    const me = async () => {
        const user = await authService.me();
        console.log(user);
        return user;
    };
    return { login, me };
};

export default useAuth;
