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
