import * as z from 'zod';
import {
    ImageInputSchema,
    ProductCreateSchema,
    ProductStatusSchema,
    ProductUpdateSchema,
} from './schemas/productsZodSchema';

export type ProductCrateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export type ImagenInput = z.infer<typeof ImageInputSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
