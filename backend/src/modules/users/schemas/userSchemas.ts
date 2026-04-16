import z from 'zod';

export const UserRoleSchema = z.enum(['admin', 'customer']);

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    role: UserRoleSchema,
});
