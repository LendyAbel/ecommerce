import z from 'zod';

export const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.email('Invalid email'),
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
