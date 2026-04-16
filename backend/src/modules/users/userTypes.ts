import z from 'zod';
import { UserSchema } from './schemas/userSchemas';

export type User = z.infer<typeof UserSchema>;
