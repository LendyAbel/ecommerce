import { apiClient } from '@/lib/api/client';

import type { LoginForm, RegisterForm, User } from '../schemas/userSchema';

const login = async (data: LoginForm): Promise<User | null> => {
    const res = await apiClient.post('/auth/login', data);
    return res.data.user;
};

const register = async (data: RegisterForm): Promise<User | null> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data.user;
};

const logout = async () => {
    await apiClient.post('/auth/logout');
};

const me = async (): Promise<User | null> => {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
};

export default {
    login,
    register,
    logout,
    me,
};
