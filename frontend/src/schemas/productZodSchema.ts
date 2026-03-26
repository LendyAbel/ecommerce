import z from 'zod';
import { categoryFormSchema, categorySchema } from './categoryZodSchema';

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
    name: z.string().min(3, 'Too short'),
    sku: z.string().min(1, 'Requiered'),
    brand: z.string().min(1, 'Requiered'),
    shortDescription: z.string().min(1, 'Requiered'),
    price: z.number().min(0),
    tax: z.number().min(0),
    status: statusSchema,
    longDescription: z.string().optional(),
    stock: z.number().optional(),
    mainCategory: categorySchema.optional(),
    categories: z.array(categorySchema).optional(),
    images: z.array(imageFormSchema).optional(),
});

export const productFormSchema = productSchema
    .omit({ id: true, images: true, mainCategory: true, categories: true })
    .extend({
        mainCategory: categoryFormSchema,
        categories: z.array(categoryFormSchema),
        images: z.array(imageFormSchema),
    });
