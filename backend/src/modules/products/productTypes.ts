import * as z from 'zod';

import {
    ImageInputSchema,
    ProductCreateSchema,
    ProductQuerySchema,
    ProductStatusSchema,
    ProductUpdateSchema,
} from './schemas/productsZodSchema';

export type ProductCrateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export type ImagenInput = z.infer<typeof ImageInputSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
