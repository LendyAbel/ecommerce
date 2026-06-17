import z from 'zod';
import { categoryFormSchema, categorySchema } from '@/features/categories/schemas/categoryZodSchema';

export const imageSchema = z.object({
    id: z.string(),
    url: z.url('URL de imagen no válida'),
    isMain: z.boolean(),
});

export const imageFormSchema = imageSchema.omit({ id: true });

export const productStatus = ['published', 'draft', 'discontinued'] as const;
export const statusSchema = z.enum(productStatus, 'Selecciona un estado');

export const productSchema = z.object({
    id: z.uuid(),
    sku: z
        .string()
        .trim()
        .min(1, 'El SKU es obligatorio')
        .max(50, 'Máximo 50 caracteres'),
    name: z
        .string()
        .trim()
        .min(3, 'Mínimo 3 caracteres')
        .max(120, 'Máximo 120 caracteres'),
    brand: z
        .string()
        .trim()
        .min(1, 'La marca es obligatoria')
        .max(60, 'Máximo 60 caracteres'),
    price: z
        .number('El precio es obligatorio')
        .min(0, 'El precio no puede ser negativo')
        .max(1_000_000, 'El precio es demasiado alto'),
    tax: z
        .number('El IVA es obligatorio')
        .min(0, 'El IVA no puede ser negativo')
        .max(100, 'El IVA no puede superar el 100%'),
    status: statusSchema,
    shortDescription: z
        .string()
        .trim()
        .min(1, 'La descripción corta es obligatoria')
        .max(160, 'Máximo 160 caracteres'),
    longDescription: z
        .string()
        .trim()
        .max(2000, 'Máximo 2000 caracteres')
        .optional(),
    mainCategory: categorySchema.optional(),
    categories: z.array(categorySchema).optional(),
    stock: z
        .number('El stock debe ser un número')
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .optional(),
    images: z.array(imageSchema).optional(),
});

export const productFormSchema = productSchema
    .omit({ id: true, images: true, mainCategory: true, categories: true })
    .extend({
        mainCategory: categoryFormSchema,
        categories: z.array(categoryFormSchema),
        images: z
            .array(imageFormSchema)
            .refine(
                images => images.length === 0 || images.some(img => img.isMain),
                'Marca una imagen como principal',
            ),
    });
