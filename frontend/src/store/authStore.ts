import { create } from 'zustand';
import type { LoginForm, RegisterForm, User } from '../types/authTypes';
import authService from '../services/auth.service';
import { useCartStore } from './cartStore';

type AuthStore = {
    user: User | null;
    isAuthLoading: boolean;
    setUser: (user: User | null) => void;
    login: (data: LoginForm) => Promise<void>;
    register: (data: RegisterForm) => Promise<void>;
    logout: () => Promise<void>;
    me: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>(set => ({
    user: null,
    isAuthLoading: true,
    setUser: user => set({ user }),
    login: async data => {
        const user = await authService.login(data);
        set({ user });
        await useCartStore.getState().fetchCart();
    },
    register: async data => {
        await authService.register(data);
        const user = await authService.login({
            email: data.email,
            password: data.password,
        });
        set({ user });
        await useCartStore.getState().fetchCart();
    },
    logout: async () => {
        await authService.logout();
        set({ user: null });
        useCartStore.getState().reset();
    },
    me: async () => {
        try {
            const user = await authService.me();
            set({ user });
            await useCartStore.getState().fetchCart();
        } catch {
            set({ user: null });
        } finally {
            set({ isAuthLoading: false });
        }
    },
}));
