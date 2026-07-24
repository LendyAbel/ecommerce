import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/features/auth/schemas/userSchemas';

type AuthStore = {
    user: User | null;
    // `true` mientras se verifica la sesión al arrancar la app (query `me`).
    // Empieza en `true` para que las rutas protegidas no parpadeen hacia /auth
    // antes de saber si hay sesión.
    isAuthLoading: boolean;
    setUser: (user: User | null) => void;
    setAuthLoading: (isAuthLoading: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        set => ({
            user: null,
            isAuthLoading: true,
            setUser: user => set({ user }),
            setAuthLoading: isAuthLoading => set({ isAuthLoading }),
        }),
        {
            name: 'auth-user',
            storage: createJSONStorage(() => sessionStorage),
            // Solo se persiste el usuario (datos no sensibles: id/nombre/email/rol).
            // NO hay token: la sesión real es la cookie httpOnly verificada por `me()`.
            // `isAuthLoading` es estado de runtime, no se persiste.
            partialize: state => ({ user: state.user }),
        },
    ),
);
