import { envSchema } from '../lib/config';

// A complete, valid environment used as the baseline for each case.
const base = {
    NODE_ENV: 'test',
    PORT: '3001',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'a-sufficiently-long-secret',
    FRONTEND_URL: 'http://localhost:5173',
    LOG_LEVEL: 'info',
};

describe('env config schema', () => {
    it('parses a fully valid environment', () => {
        expect(envSchema.safeParse(base).success).toBe(true);
    });

    it('coerces PORT from string to number', () => {
        const result = envSchema.parse(base);
        expect(result.PORT).toBe(3001);
        expect(typeof result.PORT).toBe('number');
    });

    it('applies defaults for optional vars', () => {
        const result = envSchema.parse({
            DATABASE_URL: base.DATABASE_URL,
            JWT_SECRET: base.JWT_SECRET,
        });
        expect(result.NODE_ENV).toBe('development');
        expect(result.PORT).toBe(3001);
        expect(result.FRONTEND_URL).toBe('http://localhost:5173');
        expect(result.LOG_LEVEL).toBe('info');
    });

    it('rejects a missing DATABASE_URL', () => {
        const env: Record<string, string> = { ...base };
        delete env.DATABASE_URL;
        expect(envSchema.safeParse(env).success).toBe(false);
    });

    it('rejects a missing JWT_SECRET', () => {
        const env: Record<string, string> = { ...base };
        delete env.JWT_SECRET;
        expect(envSchema.safeParse(env).success).toBe(false);
    });

    it('rejects a too-short JWT_SECRET', () => {
        expect(
            envSchema.safeParse({ ...base, JWT_SECRET: 'short' }).success,
        ).toBe(false);
    });

    it('rejects an invalid FRONTEND_URL', () => {
        expect(
            envSchema.safeParse({ ...base, FRONTEND_URL: 'not-a-url' }).success,
        ).toBe(false);
    });

    it('rejects an unknown NODE_ENV', () => {
        expect(
            envSchema.safeParse({ ...base, NODE_ENV: 'staging' }).success,
        ).toBe(false);
    });
});
