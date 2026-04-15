import type z from 'zod';
import type {
    LoginFormSchema,
    RegisterFormSchema,
    UserSchema,
} from '../schemas/userSchema';

export type User = z.infer<typeof UserSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type RegisterForm = z.infer<typeof RegisterFormSchema>;
