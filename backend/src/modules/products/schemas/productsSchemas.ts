import * as z from 'zod';

export const ImageInputSchema = z.object({
    url: z.url({ error: 'Imagen URL no valid' }),
    isMain: z.boolean({ error: 'isMain must be a boolean' }),
});
export type ImagenInput = z.infer<typeof ImageInputSchema>;

// Refined on the array (not the object) so ProductCreateSchema stays a ZodObject
// and `.partial()` keeps working for the update schema. Empty arrays pass.
export const ImagesArraySchema = z
    .array(ImageInputSchema)
    .refine(images => images.filter(image => image.isMain).length <= 1, {
        error: 'Only one image can be marked as main',
    });

export const ProductStatusSchema = z.enum(['published', 'discontinued', 'draft']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

// Base field validators WITHOUT create-time defaults. The defaults live only on
// ProductCreateSchema; the update schema reuses these raw shapes so that PATCH
// stays additive — omitting a key means "leave untouched", not "reset to default".
const productFields = {
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
        .max(100, 'Tax cant be greater than 100%'),

    stock: z.coerce
        .number()
        .int('Stock must be an integer')
        .min(0, 'Stock must be a positive number'),

    status: ProductStatusSchema.optional(),

    mainCategory: z.string().min(1).trim().optional(),
    categories: z.array(z.string().min(1).trim()),

    images: ImagesArraySchema,
};

export const ProductCreateSchema = z.object({
    ...productFields,
    tax: productFields.tax.default(21),
    stock: productFields.stock.default(0),
    categories: productFields.categories.default([]),
    images: productFields.images.default([]),
});
export type ProductCrateInput = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = z.object(productFields).partial();
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export const ProductQuerySchema = z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ProductQuery = z.infer<typeof ProductQuerySchema>;