import z from 'zod';

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    role: z.string(),
});

export const LoginFormSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const RegisterFormSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
});
