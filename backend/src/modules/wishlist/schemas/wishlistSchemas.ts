import z from 'zod';

export const AddItemSchema = z.object({
    productId: z.uuid(),
});
export type AddItemInput = z.infer<typeof AddItemSchema>;
