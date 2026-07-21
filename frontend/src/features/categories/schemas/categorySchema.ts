import z from 'zod';

export const categorySchema = z.object({
    id: z.string(),
    name: z.string().min(1),
});
export type Category = z.infer<typeof categorySchema>;

export const categoryFormSchema = z.string();
export type CategoryForm = z.infer<typeof categoryFormSchema>;
