import { create } from 'zustand';
import type { LoginForm, RegisterForm, User } from '../types/authTypes';
import authService from '../services/auth.service';

type AuthStore = {
    user: User | null;
    setUser: (user: User | null) => void;
    login: (data: LoginForm) => Promise<void>;
    register: (data: RegisterForm) => Promise<void>;
    logout: () => Promise<void>;
    me: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>(set => ({
    user: null,
    setUser: user => set({ user }),
    login: async data => {
        const user = await authService.login(data);
        set({ user });
        console.log(user);
    },
    register: async data => {
        await authService.register(data);
        const user = await authService.login({
            email: data.email,
            password: data.password,
        });
        set({ user });
        console.log(user);
    },

    logout: async () => {
        await authService.logout();
        set({ user: null });
        console.log('logout');
    },
    me: async () => {
        const user = await authService.me();
        set({ user });
        console.log(user);
    },
}));
