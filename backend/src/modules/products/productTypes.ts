import * as z from 'zod';
import {
    ImageInputSchema,
    ProductCrateSchema,
    ProductStatusSchema,
    ProductUpdateSchema,
} from './schemas/productsZodSchema';

export type ProductCrateInput = z.infer<typeof ProductCrateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export type ImagenInput = z.infer<typeof ImageInputSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
