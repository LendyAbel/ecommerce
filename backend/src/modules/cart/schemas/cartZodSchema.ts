import z from 'zod';

export const AddItemSchema = z.object({
    productId: z.uuid(),
    quantity: z.coerce.number().int().min(1).default(1),
});

export const UpdateItemSchema = z.object({
    quantity: z.coerce.number().int().min(1).default(1),
});

export type AddItemInput = z.infer<typeof AddItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;