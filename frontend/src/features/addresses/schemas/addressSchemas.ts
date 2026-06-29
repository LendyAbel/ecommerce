import z from 'zod';

export const AddressSchema = z.object({
    id: z.uuid(),
    fullName: z.string(),
    phone: z.string().nullable().optional(),
    line1: z.string(),
    line2: z.string().nullable().optional(),
    city: z.string(),
    state: z.string().nullable().optional(),
    postalCode: z.string(),
    country: z.string(),
});
export type Address = z.infer<typeof AddressSchema>;

export const AddressFormSchema = z.object({
    fullName: z.string().min(1, 'Requerido'),
    phone: z.string().optional(),
    line1: z.string().min(1, 'Requerido'),
    line2: z.string().optional(),
    city: z.string().min(1, 'Requerido'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Requerido'),
    country: z.string().min(1, 'Requerido'),
});
export type AddressFormInput = z.infer<typeof AddressFormSchema>;
