import type {
    ChangePasswordForm,
    LoginForm,
    RegisterForm,
    UpdateProfileForm,
    User,
} from '@/features/auth/schemas/userSchemas';
import { apiClient } from '@/lib/api/client';

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

const updateProfile = async (data: UpdateProfileForm): Promise<User | null> => {
    const res = await apiClient.patch('/auth/me', data);
    return res.data.user;
};

const changePassword = async (
    data: Omit<ChangePasswordForm, 'confirmNewPassword'>,
): Promise<void> => {
    await apiClient.patch('/auth/me/password', data);
};

const deleteAccount = async (): Promise<void> => {
    await apiClient.delete('/auth/me');
};

export default {
    login,
    register,
    logout,
    me,
    updateProfile,
    changePassword,
    deleteAccount,
};
