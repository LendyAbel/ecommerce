import z from 'zod';

import { normalizeName } from '../../../lib/utils';

// Validates and normalizes the `:name` route param: URL-decodes it, lowercases
// and strips accents (so lookups match the normalized names stored in the DB),
// and rejects values that are empty once trimmed.
export const CategoryNameParamSchema = z
    .string()
    .min(1, 'Category name is required')
    .transform((value, ctx) => {
        let decoded: string;
        try {
            decoded = decodeURIComponent(value);
        } catch {
            ctx.addIssue({ code: 'custom', message: 'Invalid category name' });
            return z.NEVER;
        }

        const normalized = normalizeName(decoded);
        if (!normalized) {
            ctx.addIssue({ code: 'custom', message: 'Category name is required' });
            return z.NEVER;
        }

        return normalized;
    });

export type CategoryNameParam = z.infer<typeof CategoryNameParamSchema>;
