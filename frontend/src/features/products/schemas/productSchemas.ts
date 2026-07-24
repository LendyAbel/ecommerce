import z from 'zod';

import {
    categoryFormSchema,
    categorySchema,
} from '@/features/categories/schemas/categorySchema';

export const imageSchema = z.object({
    id: z.string(),
    url: z.url('URL no válida'),
    isMain: z.boolean(),
});
export type Image = z.infer<typeof imageSchema>;

export const imageFormSchema = imageSchema.omit({ id: true });
export type ImageForm = z.infer<typeof imageFormSchema>;

export const productStatus = ['published', 'draft', 'discontinued'] as const;
export const statusSchema = z.enum(productStatus, 'Obligatorio');
export type ProductStatus = z.infer<typeof statusSchema>;

export const ProductSchema = z.object({
    id: z.uuid(),
    sku: z
        .string()
        .trim()
        .min(1, 'Obligatorio')
        .max(50, 'Máximo 50 caracteres'),
    name: z
        .string()
        .trim()
        .min(3, 'Mínimo 3 caracteres')
        .max(120, 'Máximo 120 caracteres'),
    brand: z
        .string()
        .trim()
        .min(1, 'Obligatorio')
        .max(60, 'Máximo 60 caracteres'),
    price: z
        .number('Obligatorio')
        .gt(0, 'Debe ser mayor que 0')
        .max(1_000_000, 'Demasiado alto'),
    tax: z
        .number('Obligatorio')
        .min(0, 'No puede ser negativo')
        .max(100, 'Máximo 100%'),
    status: statusSchema,
    shortDescription: z
        .string()
        .trim()
        .min(1, 'Obligatorio')
        .max(160, 'Máximo 160 caracteres'),
    longDescription: z
        .string()
        .trim()
        .max(2000, 'Máximo 2000 caracteres')
        .optional(),
    mainCategory: categorySchema.required(),
    categories: z.array(categorySchema).optional(),
    stock: z
        .number('Debe ser un número')
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),
    images: z.array(imageSchema).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductFormSchema = ProductSchema
    .omit({ id: true, images: true, mainCategory: true, categories: true })
    .extend({
        mainCategory: categoryFormSchema.min(1, 'Obligatorio'),
        categories: z.array(categoryFormSchema),
        images: z
            .array(imageFormSchema)
            .refine(
                images => images.length === 0 || images.some(img => img.isMain),
                'Marca una principal',
            ),
    });
export type ProductForm = z.infer<typeof ProductFormSchema>;

export const sortBy = ['price_asc', 'price_desc', 'newest', 'oldest'] as const;
export const SortBySchema = z.enum(sortBy);
export type SortBy = z.infer<typeof SortBySchema>;

export const ProductFiltersSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    sortBy: SortBySchema.optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export const PaginatedProductsSchema = z.object({
    data: ProductSchema.array(),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});
export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>;