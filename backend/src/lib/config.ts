import 'dotenv/config';

import z from 'zod';

// Single source of truth for environment variables. Validated and type-coerced
// once at startup so the rest of the app consumes a typed, trusted `config`
// object instead of reaching into `process.env` (and asserting non-null) ad hoc.
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    FRONTEND_URL: z.url().default('http://localhost:5173'),
    LOG_LEVEL: z
        .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
        .default('info'),
    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_WEBHOOK_SECRET: z
        .string()
        .min(1, 'STRIPE_WEBHOOK_SECRET is required'),
    STRIPE_CURRENCY: z.string().length(3).default('eur'),
});

export type Config = z.infer<typeof envSchema>;

// Exported so the validation rules can be unit-tested without triggering the
// module-level fail-fast below.
export { envSchema };

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    // Fail fast: config is foundational, so surface every problem and exit
    // before the app wires up routes or the DB with invalid configuration.
    // Uses console (not the pino logger) because the logger depends on config.
    console.error('❌ Invalid environment variables:');
    for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const config: Readonly<Config> = Object.freeze(parsed.data);
