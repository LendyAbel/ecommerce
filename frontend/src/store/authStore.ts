import { create } from 'zustand';
import type { User } from '../types/authTypes';

type AuthStore = {
    user: User | null;
    // `true` mientras se verifica la sesión al arrancar la app (query `me`).
    // Empieza en `true` para que las rutas protegidas no parpadeen hacia /auth
    // antes de saber si hay sesión.
    isAuthLoading: boolean;
    setUser: (user: User | null) => void;
    setAuthLoading: (isAuthLoading: boolean) => void;
};

export const useAuthStore = create<AuthStore>(set => {
    return {
        user: null,
        isAuthLoading: true,
        setUser: user => set({ user }),
        setAuthLoading: isAuthLoading => set({ isAuthLoading }),
    };
});
