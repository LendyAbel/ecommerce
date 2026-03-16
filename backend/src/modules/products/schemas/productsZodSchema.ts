import * as z from 'zod';

export const ImageInputSchema = z.object({
    url: z.url({ error: 'Imagen URL no valid' }),
    isMain: z.boolean({ error: 'isMain must be a boolean' }),
});

export const ProductStatusSchema = z.enum(['active', 'inactive', 'draft']);

export const ProductCrateSchema = z.object({
    sku: z.string().min(1, 'SKU is required').trim(),
    name: z.string().min(1, 'Name is required').trim(),
    shortDescription: z.string().min(1, 'Short description is required').trim(),

    longDescription: z.string().trim().optional(),
    brand: z.string().trim().optional(),

    price: z.coerce
        .number({ error: 'Price must be a number' })
        .positive('Price must be a positive number'),

    tax: z.coerce
        .number()
        .int('Tax must be an integer')
        .min(0, 'Tax must be a positive number')
        .max(100, 'Tax cant be greater than 100%')
        .default(21),

    stock: z.coerce
        .number()
        .int('Stock must be an integer')
        .min(0, 'Stock must be a positive number')
        .default(0),

    status: ProductStatusSchema.optional(),

    mainCategory: z.string().min(1).trim().optional(),
    categories: z.array(z.string().min(1).trim()).default([]),

    images: z.array(ImageInputSchema).default([]),
});

export const ProductUpdateSchema = ProductCrateSchema.partial();