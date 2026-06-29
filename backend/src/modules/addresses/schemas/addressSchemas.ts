import z from 'zod';

export const CreateAddressSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().optional(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export const AddressIdParamSchema = z.object({ id: z.uuid() });

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
