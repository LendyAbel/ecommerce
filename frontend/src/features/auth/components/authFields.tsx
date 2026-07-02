import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import type { AuthFieldConfig } from '@/features/auth/components/AuthForm';

const iconSx = { color: 'var(--color-text-38)', fontSize: 18 };

export type LoginValues = { email: string; password: string };
export type RegisterValues = { name: string; email: string; password: string };

// Configuración de campos compartida por las variantes desktop (Login/Register)
// y mobile (AuthMobile), para no duplicar etiquetas/iconos.
export const loginFields: AuthFieldConfig<LoginValues>[] = [
    { name: 'email', label: 'Email', icon: <EmailOutlinedIcon sx={iconSx} /> },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        icon: <LockOutlinedIcon sx={iconSx} />,
    },
];

export const registerFields: AuthFieldConfig<RegisterValues>[] = [
    { name: 'name', label: 'Nombre', icon: <PersonOutlineIcon sx={iconSx} /> },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        icon: <EmailOutlinedIcon sx={iconSx} />,
    },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        icon: <LockOutlinedIcon sx={iconSx} />,
    },
];
