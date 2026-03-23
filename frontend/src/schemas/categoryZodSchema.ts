import z from 'zod';

export const categorySchema = z.object({
    id: z.string(),
    name: z.string().min(1),
});

export const categoryFormSchema = z.string();
