import type z from 'zod';

import type {
    categoryFormSchema,
    categorySchema,
} from '@/features/categories/schemas/categoryZodSchema';

export type Category = z.infer<typeof categorySchema>;
export type CategoryForm = z.infer<typeof categoryFormSchema>;
