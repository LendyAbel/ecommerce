import z from 'zod';
import { categoryFormSchema, categorySchema } from './categoryZodSchema';

export const imageSchema = z.object({
    id: z.string(),
    url: z.url(),
    isMain: z.boolean(),
});

export const imageFormSchema = imageSchema.omit({ id: true });

export const statusSchema = z.enum(['published', 'draft', 'discontinued']);

export const productSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    sku: z.string().min(1),
    brand: z.string().min(1),
    shortDescription: z.string().min(1),
    longDescription: z.string().min(1).optional(),
    price: z.number().min(0),
    tax: z.number().min(0).optional().default(21),
    stock: z.number().min(0).optional().default(0),
    status: statusSchema.optional(),
    mainCategory: categorySchema.optional(),
    categories: z.array(categorySchema).optional(),
    images: z.array(imageFormSchema).optional(),
});

export const productFormSchema = productSchema
    .omit({ id: true, images: true, mainCategory: true, categories: true })
    .extend({
        mainCategory: categoryFormSchema.optional(),
        categories: z.array(categoryFormSchema).optional(),
        images: z.array(imageFormSchema).optional(),
    });
