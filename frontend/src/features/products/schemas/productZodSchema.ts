import z from 'zod';
import { categoryFormSchema, categorySchema } from '@/features/categories/schemas/categoryZodSchema';

export const imageSchema = z.object({
    id: z.string(),
    url: z.url(),
    isMain: z.boolean(),
});

export const imageFormSchema = imageSchema.omit({ id: true });

export const productStatus = ['published', 'draft', 'discontinued']
export const statusSchema = z.enum(productStatus, 'required');

export const productSchema = z.object({
    id: z.uuid(),
    sku: z.string().min(1, 'Requerido'),
    name: z.string().min(3, 'Too short'),
    brand: z.string().min(1, 'Requerido'),
    price: z.number().min(0),
    tax: z.number().min(0),
    status: statusSchema,
    shortDescription: z.string().min(1, 'Requerido'),
    longDescription: z.string().optional(),
    mainCategory: categorySchema.optional(),
    categories: z.array(categorySchema).optional(),
    stock: z.number().optional(),
    images: z.array(imageSchema).optional(),
});

export const productFormSchema = productSchema
    .omit({ id: true, images: true, mainCategory: true, categories: true })
    .extend({
        mainCategory: categoryFormSchema,
        categories: z.array(categoryFormSchema),
        images: z.array(imageFormSchema),
    });
