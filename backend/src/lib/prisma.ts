import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/prisma/client';
import { config } from './config';

const connectionString = config.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

// Soft-delete filter for User: automatically exclude rows with `deletedAt` set on
// read operations whose `where` accepts arbitrary filters. `findUnique`/`findUniqueOrThrow`
// are intentionally skipped — their `where` only accepts unique fields, so Prisma would
// reject `deletedAt`. For user lookups that must exclude soft-deleted rows, use `findFirst`.
const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        user: {
            $allOperations({ operation, args, query }) {
                if (
                    operation === 'findFirst' ||
                    operation === 'findFirstOrThrow' ||
                    operation === 'findMany' ||
                    operation === 'count' ||
                    operation === 'aggregate' ||
                    operation === 'groupBy'
                ) {
                    args = {
                        ...args,
                        where: { ...(args as { where?: object }).where, deletedAt: null },
                    };
                }
                return query(args);
            },
        },
    },
});

export { prisma };
