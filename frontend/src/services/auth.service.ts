import axios from 'axios';
import type { LoginForm, RegisterForm, User } from '../types/authTypes';

const api = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
});

const login = async (data: LoginForm): Promise<User | null> => {
    const res = await api.post('/login', data);
    console.log(res.data);
    return res.data.user;
};

const register = async (data: RegisterForm): Promise<User | null> => {
    const res = await api.post('/register', data);
    console.log(res.data.user);

    return res.data;
};

const logout = async () => {
    await api.post('/logout');
};

const me = async (): Promise<User | null> => {
    const res = await api.get('/me');
    console.log(res.data);
    return res.data.user;
};

export default {
    login,
    register,
    logout,
    me,
};
