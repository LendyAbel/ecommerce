import z from 'zod';

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    role: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginFormSchema = z.object({
    email: z.email(),
    password: z.string(),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
});
export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export const UpdateProfileFormSchema = z.object({
    name: z.string().min(1, 'Requerido'),
    email: z.email('Email inválido'),
});
export type UpdateProfileForm = z.infer<typeof UpdateProfileFormSchema>;

export const ChangePasswordFormSchema = z
    .object({
        currentPassword: z.string().min(1, 'Requerido'),
        newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmNewPassword: z.string().min(1, 'Requerido'),
    })
    .refine(data => data.newPassword === data.confirmNewPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmNewPassword'],
    });
export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;
