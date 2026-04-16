import axios from 'axios';
import type { LoginForm, RegisterForm, User } from '../types/authTypes';

const api = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
});

const login = async (data: LoginForm): Promise<User> => {
    const res = await api.post('/login', data);
    return res.data.user;
};

const register = async (data: RegisterForm): Promise<User> => {
    const res = await api.post('/register', data);
    return res.data.user;
};

const logout = async () => {
    await api.post('/logout');
};

export default {
    login,
    register,
    logout,
};
