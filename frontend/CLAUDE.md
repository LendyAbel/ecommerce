# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce app with a Node.js/Express backend and React frontend. Both live in the same repo under `backend/` and `frontend/` respectively. Payments are handled through Stripe Checkout (hosted redirect flow).

## Commands

### Backend (run from `backend/`)
```bash
npm run dev            # Start dev server with nodemon + ts-node (port 3001)
npm run dev:clean      # Kill port 3001 first, then start dev server
npm run build          # Compile TypeScript to dist/
npm run start          # Run compiled output (node dist/src/index.js)
npm run seed           # Reset DB and seed with prisma/seed.ts
npm run reset-db       # npx prisma migrate reset
npm run test           # Run Jest test suite
npm run test:watch     # Jest in watch mode
npm run test:coverage  # Jest with coverage report
```

### Frontend (run from `frontend/`)
```bash
npm run dev          # Start Vite dev server (proxies /api to localhost:3001)
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Database
```bash
npx prisma migrate dev    # Apply migrations
npx prisma studio         # Open Prisma Studio GUI
```
Schema is split across multiple files under `backend/prisma/schema/` (`users.prisma`, `products.prisma`, `categories.prisma`, `cart.prisma`, `orders.prisma`, `addresses.prisma`, `config.prisma`) rather than a single `schema.prisma`.

## Environment Variables

**Backend** (`backend/.env`, validated at startup by `src/lib/config.ts` via Zod — the process exits with a clear error if anything is missing/invalid):
```
PORT=3001
DATABASE_URL="postgres://..."
JWT_SECRET="..."            # min 16 chars
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="info"            # trace|debug|info|warn|error|fatal|silent
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="eur"       # optional, defaults to eur
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL="http://localhost:3001"
VITE_STRIPE_PUBLISHABLE_KEY="pk_..."
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so frontend code calls `/api/...` directly.

## Architecture

### Backend (`backend/src/`)

Module-based structure — each domain has its own folder under `modules/`, generally following a `routers/ → controllers/ → services/` layering, plus a `schemas/` folder for Zod validation.

```
src/
├── index.ts                  # Process entry: starts the HTTP server, graceful shutdown (SIGTERM/SIGINT), unhandled rejection/exception handlers
├── app.ts                    # Express app construction: middleware stack + route mounting (exported for tests via supertest)
├── lib/
│   ├── config.ts             # Zod-validated env vars — single source of truth, fails fast on bad config
│   ├── prisma.ts             # Prisma client singleton
│   ├── AppError.ts           # Custom error class (message + statusCode)
│   ├── logger.ts             # pino logger
│   ├── serializers.ts        # Shared response-shaping helpers
│   ├── stripe.ts             # Stripe client singleton
│   └── utils.ts
├── middlewares/
│   ├── errorHandler.ts       # Catches Zod, Prisma, AppError, and generic errors
│   ├── authMiddleware.ts     # `authenticate` (JWT from httpOnly cookie) + `requireAdmin` (role check)
│   ├── httpLogger.ts         # pino-http request logging
│   └── rateLimiters.ts       # `authLimiter` (login/register) + `generalLimiter` (all /api routes)
├── tests/                    # Jest + supertest integration tests (auth, cart, categories, orders, products, config)
└── modules/
    ├── auth/                 # POST /api/auth/register|login|logout, GET /api/auth/me
    ├── users/                # /api/users
    ├── products/             # /api/products
    ├── categories/            # /api/categories
    ├── cart/                  # /api/cart
    ├── orders/                # /api/orders (create/list/get/cancel/update-status, + checkout-session)
    ├── addresses/              # /api/addresses
    └── payments/               # Stripe checkout-session creation + /api/webhooks (Stripe webhook handler, mounted before body-parsing)
```

**Error handling flow**: All errors bubble to `errorHandler.ts`, which distinguishes Zod validation errors (400), Prisma known errors (e.g. unique constraint → 409), `AppError` instances (custom status), and falls back to 500.

**Auth flow**: Register hashes password with bcrypt → Login verifies and issues JWT set as httpOnly cookie → `authenticate` middleware extracts and verifies JWT from cookie on protected routes, attaching `req.user = { userId, role }`. `requireAdmin` gates admin-only routes (e.g. `GET /api/orders/all`, `PATCH /api/orders/:id/status`) on `req.user.role === 'admin'`.

**Payments flow**: Frontend calls `POST /api/orders/:orderId/checkout-session` (with an `Idempotency-Key` header) to get a Stripe Checkout session `url`, then redirects the browser there. Stripe calls back via `POST /api/webhooks` (mounted *before* `express.json()` so the raw body is available for signature verification) to confirm payment and update order status.

**Security middleware** (in `app.ts`, in order): `httpLogger` → `helmet()` → `cors({ origin: FRONTEND_URL, credentials: true })` → `compression()` → webhook router (raw body) → `express.json({ limit: '1mb' })` → `cookieParser()` → health check → rate limiters → domain routers → `errorHandler`.

### Frontend (`frontend/src/`)

Feature-sliced architecture with a shared design-system layer. Path alias `@` → `src/`.

```
src/
├── main.tsx                  # Entry: ErrorBoundary > QueryClientProvider > RouterProvider
├── app/
│   ├── App.tsx                # Root layout element (Navbar, Alerts, GeneralLoader, <Suspense><Outlet/></Suspense>)
│   ├── router.tsx              # createBrowserRouter — builds public/protected route trees from routes.config
│   ├── routes.config.ts        # Single source of truth: [{ path, lazy import, protected? }]
│   └── routePreload.ts         # Preloads a route's lazy chunk on hover/focus intent
├── layouts/
│   └── Navbar.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts           # `apiClient` axios instance (baseURL '/api', withCredentials) + ApiError + error-normalizing interceptor
│   │   └── validateResponse.ts # Zod-validates every service response (throws in dev, logs+casts in prod)
│   ├── logger.ts
│   └── queryClient.ts          # React Query client (staleTime 60s, gcTime 5min, retry skips 4xx)
├── pages/                     # Route-level screens (thin; compose feature components) — Home, About, Products, Authenticate, Cart, Orders, Address, Checkout, CheckoutSuccess, CheckoutCancel
├── features/                  # One folder per domain: auth, cart, categories, addresses, products, orders, checkout
│   └── <feature>/
│       ├── api/               # <feature>.service.ts (axios + validateResponse) and <feature>.queries.ts (TanStack `queryOptions`/`mutationOptions` factories + key factory)
│       ├── hooks/              # Thin hooks that call useQuery/useMutation/useInfiniteQuery with the option factories above
│       ├── schemas/             # Zod schemas + inferred types (contract layer)
│       ├── components/          # Feature-specific UI
│       ├── store/               # Zustand store — only in auth/ and cart/
│       └── types/ , utils/       # Present where needed (cart, checkout, orders)
└── shared/                    # Cross-feature, domain-agnostic code
    ├── ui/                     # Design-system primitives: Button, Card, Modal, TextFieldInput, SingleSelectInput, MultipleSelectInput, ImagesInput, Badge, Spinner, StepProgressLine, ThemeToggle (barrel index.ts)
    ├── components/              # Alerts, ProtectedRoute, ErrorBoundary, GeneralLoader, PageContainer, BackLink, StateMessage (barrel index.ts)
    ├── store/                    # themeStore.ts, alertStore.ts (Zustand; app-wide, non-domain state)
    ├── hooks/                    # useDebounce (barrel index.ts)
    └── utils/                    # format.ts (currency/date formatters), muiStyles.ts (shared MUI sx objects)
```

Note: barrel `index.ts` files exist **only** under `shared/` (`shared/ui`, `shared/components`, `shared/hooks`). Feature folders have no barrels — always import from the concrete file path (e.g. `@/features/orders/api/orders.queries`).

**Data flow**: Pages/components → feature `hooks/*` → `api/*.queries.ts` (query/mutation option factories) → `api/*.service.ts` (axios + Zod `validateResponse`) → Express backend → Prisma → PostgreSQL. Auth state lives in `features/auth/store/authStore.ts` (Zustand, persisted to sessionStorage); cart state in `features/cart/store/cartStore.ts` (persisted to localStorage). App-wide UI state (theme, toasts) lives in `shared/store/`. Server state lives in the React Query cache.

**Routing**: React Router v7 (`createBrowserRouter`), routes declared in `app/routes.config.ts` and lazy-loaded. Routes flagged `protected: true` are wrapped in `shared/components/ProtectedRoute.tsx`, which reads `authStore` and redirects to `/auth` if there's no user. Protected: `/orders`, `/orders/:id`, `/account/addresses`, `/checkout`, `/checkout/success`, `/checkout/cancel`. Public: `/`, `/products`, `/products/:id`, `/about`, `/auth`, `/cart`.

**Key dependencies**: React 19, MUI 7 + Emotion, Tailwind v4 (`@tailwindcss/vite`, no separate config file), `react-router` v7 (unified package, not `react-router-dom`), `@tanstack/react-query` v5, `@tanstack/react-form` (not React Hook Form), `zustand` v5, `zod` v4, `axios`, `motion` (Framer Motion successor), `@stripe/react-stripe-js` + `@stripe/stripe-js`. ESLint uses flat config with `eslint-plugin-simple-import-sort`; Prettier has `prettier-plugin-tailwindcss`.

### Frontend conventions

- **Imports**: alias `@/` for anything outside the current folder (enforced by ESLint `no-restricted-imports`, pattern `../`); `./` only within the same folder. Always import a feature's concrete module (e.g. `@/features/cart/store/cartStore`), never a feature barrel — only `shared/*` has barrels.
- **Data hooks**: named exports, one hook per query/mutation, no renamed React Query fields (`isLoading`/`isError` as-is). Queries: `useX`/`useX(id)` (e.g. `useProducts`, `useProduct(id)`, `useOrders`, `useOrder(id)`, `useAddresses`, `useCategories`). Mutations: `useCreateX`/`useUpdateX`/`useDeleteX`/`useCancelX`.
- **Query keys**: each feature's `api/<feature>.queries.ts` exports a `xKeys` factory plus `queryOptions()`/`mutationOptions()` builders; hooks and prefetch calls (`queryClient.prefetchQuery(...)`) always consume the same options, never a hand-written key/fetcher.
- **Schemas**: files named `<feature>Schemas.ts`; schema instances in PascalCase (`ProductSchema`, `AddressSchema`), inferred types share the base name without the `Schema` suffix (`type Product = z.infer<typeof ProductSchema>`). Reuse a schema across features instead of redefining it (e.g. orders reuses `AddressFormSchema` from `features/addresses`).
- **Formatting**: `formatCurrency`/`formatOrderDate`/`formatOrderDateTime` from `shared/utils/format.ts` — no ad-hoc `toLocaleString`/`toFixed`/`Intl.*` elsewhere.
- **Notifications** (`shared/store/alertStore.ts`): `success` = completed action (login, register, create/edit/delete/cancel); `info` = neutral heads-up; `warning` = reversible destructive action (e.g. clearing the cart); `error` = failure, raised from a `catch` with the `ApiError` message.
- **Mutation handlers**: always `try { await mutateAsync(...) } catch (e) { notify.error(e instanceof ApiError ? e.message : '...') }` — never a fire-and-forget `mutateAsync` call in an event handler.
- **Navigation**: `Link`/`NavLink` to go to a route (never a `div`/`button` + `navigate()`); `navigate()` only as a side effect after an action completes.
- **MUI boundary**: MUI is only for complex inputs wrapped in `shared/ui` (`TextField`, `Select`, `Dialog` → wrapped as `Modal`) and icons (`@mui/icons-material/X`, deep import). Anything else gets the app's own design system: form/server errors use the `serverError` + `<p className='text-error'>` pattern (see `AuthForm`, `NewProductDialog`), not MUI's `Alert`. `useMediaQuery` uses the app's own `shared/hooks/useMediaQuery` (plain `matchMedia`), not MUI's.

### Database Schema (Prisma)

Schema files under `backend/prisma/schema/`: `User`, `Product`, `Image` (cascade-deleted with product), `Category`, `Cart`/`CartItem`, `Order`/`OrderItem` (with Stripe session fields), `Address`. Products and Categories have a many-to-many relation; Products also have a `mainCategory` FK. Orders and Addresses support soft delete. Prisma client generator uses `provider = "prisma-client"` and outputs to `prisma/generated/prisma/` (not the default location).
