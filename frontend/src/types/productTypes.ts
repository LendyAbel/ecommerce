import type z from 'zod';
import type {
    imageFormSchema,
    imageSchema,
    productFormSchema,
    productSchema,
    statusSchema,
} from '../schemas/productZodSchema';

export type Image = z.infer<typeof imageSchema>;
export type ImageForm = z.infer<typeof imageFormSchema>;

export type Product = z.infer<typeof productSchema>;
export type ProductForm = z.infer<typeof productFormSchema>;

export type ProductStatus = z.infer<typeof statusSchema>;
