# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce app with a Node.js/Express backend and React frontend. Both live in the same repo under `backend/` and `frontend/` respectively.

## Commands

### Backend (run from `backend/`)
```bash
npm run dev          # Start dev server with nodemon + ts-node (port 3001)
npm run dev:clean    # Kill port 3001 first, then start dev server
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output
npm run seed         # Reset DB and seed with prisma/seed.ts
npm run reset-db     # npx prisma migrate reset
```

### Frontend (run from `frontend/`)
```bash
npm run dev          # Start Vite dev server (proxies /api to localhost:3001)
npm run build        # tsc + vite build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Database
```bash
npx prisma migrate dev    # Apply migrations
npx prisma studio         # Open Prisma Studio GUI
```

## Environment Variables

**Backend** (`.env`):
```
PORT=3001
DATABASE_URL="postgres://..."
JWT_SECRET="secret"
```

**Frontend** (`.env`):
```
VITE_API_URL="http://localhost:3001"
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so frontend code calls `/api/...` directly.

## Architecture

### Backend (`backend/src/`)

Module-based structure — each domain (auth, products, categories, users) has its own folder with routers, services, and Zod schemas.

```
src/
├── index.ts                  # Express app entry: middleware, routes, error handler
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   └── AppError.ts           # Custom error class (message + statusCode)
├── middlewares/
│   ├── errorHandler.ts       # Catches Zod, Prisma, AppError, and generic errors
│   └── authMiddleware.ts     # JWT verification from httpOnly cookie
└── modules/
    ├── auth/                 # POST /api/auth/register|login|logout, GET /api/auth/me
    ├── products/             # GET /api/products
    ├── categories/           # GET /api/categories
    └── users/
```

**Error handling flow**: All errors bubble to `errorHandler.ts`, which distinguishes Zod validation errors (400), Prisma known errors (e.g. unique constraint → 409), `AppError` instances (custom status), and falls back to 500.

**Auth flow**: Register hashes password with bcrypt (10 rounds) → Login verifies and issues JWT (7-day expiry) set as httpOnly cookie → `authMiddleware` extracts and verifies JWT from cookie on protected routes.

### Frontend (`frontend/src/`)

```
src/
├── App.tsx                   # Route definitions: /, /products, /products/:id, /cart, /auth
├── store/
│   ├── authStore.ts          # Zustand: user state, login/register/logout/me()
│   └── cartStore.ts          # Zustand: cart items
├── services/                 # Axios functions (auth, products, categories)
├── hooks/                    # React Query hooks wrapping services
├── components/
│   └── layout/
│       └── ProtectedRoute.tsx  # Guards /cart — redirects to /auth if not logged in
└── schemas/                  # Zod schemas for form validation
```

**Data flow**: Components → React Query hooks → `services/*.service.ts` (Axios with `withCredentials: true`) → Express backend → Prisma → PostgreSQL. Auth state lives in Zustand (`authStore`). Server state (products, categories) lives in React Query cache.

### Database Schema (Prisma)

Models: `User`, `Product`, `Image` (cascade-deleted with product), `Category`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Address`. Products and Categories have a many-to-many relation. Products also have a `mainCategory` FK. Prisma client is generated to `generated/prisma/` (not the default location).

**Multi-file schema**: the schema is split by module into `prisma/schema/` (`config.prisma` holds `generator` + `datasource`; then `products`, `categories`, `users`, `cart`, `orders`, `addresses`). Prisma concatenates all `.prisma` files in that folder, so models/enums reference each other across files with no imports. The folder path is set in `prisma.config.ts` (`schema: 'prisma/schema'`). `generator`/`datasource` must appear exactly once.

**`searchVector` drift caveat**: `Product.searchVector` is a Postgres `GENERATED` column (full-text search `tsvector`), created via custom SQL in a migration and mapped as `Unsupported("tsvector")?`. Prisma doesn't understand generated columns, so every `prisma migrate dev` emits a spurious `ALTER TABLE "Product" ALTER COLUMN "searchVector" DROP DEFAULT`, which Postgres rejects (error 42601, "is a generated column"). When creating a *real* migration, generate it with `--create-only`, delete that `searchVector` line from the `migration.sql`, then apply. If a `migrate dev` already failed on it, recover with `prisma migrate resolve --rolled-back "<migration_name>"` and delete the migration folder (the failed ALTER touches nothing, so the DB stays intact).
