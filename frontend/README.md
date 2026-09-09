# Ecommerce — Frontend

SPA de e-commerce construida con React 19, TypeScript y Vite. Consume la API REST del backend (ver [`../backend/README.md`](../backend/README.md)) y gestiona el pago mediante el flujo de redirect de Stripe Checkout.

## Stack

- **Build**: Vite 7, TypeScript
- **UI**: React 19, MUI 7 + Emotion (solo para inputs complejos e iconos), Tailwind v4 (`@tailwindcss/vite`, sin archivo de config separado)
- **Routing**: React Router v7 (`createBrowserRouter`, paquete unificado `react-router`)
- **Server state**: TanStack Query v5
- **Formularios**: TanStack Form
- **Estado global de cliente**: Zustand v5 (auth persistido en `sessionStorage`, carrito en `localStorage`)
- **Validación**: Zod v4
- **HTTP**: axios
- **Animaciones**: motion (sucesor de Framer Motion)
- **Pagos**: `@stripe/react-stripe-js` + `@stripe/stripe-js`

## Requisitos

- Node.js 20+
- El backend corriendo en local (ver [`../backend/README.md`](../backend/README.md)) — en dev, Vite proxya `/api` hacia `http://localhost:3001`

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar los valores, ver tabla de abajo
npm run dev             # http://localhost:5173
```

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API backend |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe (`pk_...`) |

En desarrollo, el código llama directamente a `/api/...` y Vite proxya esas rutas al backend, por lo que `VITE_API_URL` cobra relevancia sobre todo en build/producción.

## Scripts

```bash
npm run dev       # Servidor de desarrollo de Vite
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview del build de producción
```

## Arquitectura

Feature-sliced, con una capa de design system compartida. Alias de import `@` → `src/`.

```
src/
├── main.tsx                  # Entry: ErrorBoundary > QueryClientProvider > RouterProvider
├── app/
│   ├── App.tsx                 # Layout raíz (Navbar, Alerts, GeneralLoader, <Suspense><Outlet/></Suspense>)
│   ├── router.tsx               # createBrowserRouter — arma los árboles de rutas públicas/protegidas
│   ├── routes.config.ts         # Fuente única de verdad: [{ path, lazy import, protected? }]
│   └── routePreload.ts           # Precarga el chunk lazy de una ruta al hacer hover/focus
├── layouts/
│   └── Navbar.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts             # Instancia `apiClient` de axios (baseURL '/api', withCredentials)
│   │   │                         # + ApiError + interceptor que normaliza errores
│   │   └── validateResponse.ts    # Valida con Zod cada respuesta de los servicios
│   ├── logger.ts
│   └── queryClient.ts             # Cliente de React Query (staleTime 60s, gcTime 5min)
├── pages/                     # Pantallas a nivel de ruta (delgadas, componen features)
├── features/                  # Una carpeta por dominio: auth, cart, categories, addresses,
│   └── <feature>/             # products, orders, checkout
│       ├── api/                # <feature>.service.ts (axios + validateResponse) y
│       │                       # <feature>.queries.ts (factories de queryOptions/mutationOptions)
│       ├── hooks/                # Hooks delgados sobre useQuery/useMutation/useInfiniteQuery
│       ├── schemas/               # Schemas de Zod + tipos inferidos (capa de contrato)
│       ├── components/             # UI específica de la feature
│       ├── store/                   # Store de Zustand — solo en auth/ y cart/
│       └── types/ , utils/           # Presentes donde hace falta (cart, checkout, orders)
└── shared/                    # Código cross-feature, agnóstico de dominio
    ├── ui/                     # Primitivas del design system (Button, Card, Modal, TextFieldInput,
    │                           # SingleSelectInput, MultipleSelectInput, ImagesInput, Badge, Spinner...)
    ├── components/              # Alerts, ProtectedRoute, ErrorBoundary, GeneralLoader, PageContainer...
    ├── store/                    # themeStore.ts, alertStore.ts (estado de app, no de dominio)
    ├── hooks/                     # useDebounce
    └── utils/                      # format.ts (moneda/fechas), muiStyles.ts (sx compartidos)
```

> Los barrels `index.ts` solo existen bajo `shared/` (`shared/ui`, `shared/components`, `shared/hooks`). Las carpetas de features no tienen barrel — siempre se importa desde el archivo concreto (ej. `@/features/orders/api/orders.queries`).

### Flujo de datos

Páginas/componentes → hooks de la feature (`hooks/*`) → factories de query/mutation (`api/*.queries.ts`) → servicio con axios + validación Zod (`api/*.service.ts`) → API del backend → Prisma → PostgreSQL.

- Estado de auth: `features/auth/store/authStore.ts` (Zustand, persistido en `sessionStorage`)
- Estado de carrito: `features/cart/store/cartStore.ts` (Zustand, persistido en `localStorage`)
- Estado de UI de app (tema, toasts): `shared/store/`
- Estado de servidor: cache de React Query

### Routing

React Router v7 con `createBrowserRouter`; las rutas se declaran en `app/routes.config.ts` y se cargan lazy. Las rutas marcadas `protected: true` se envuelven en `shared/components/ProtectedRoute.tsx`, que lee `authStore` y redirige a `/auth` si no hay usuario.

- **Protegidas**: `/orders`, `/orders/:id`, `/account/addresses`, `/checkout`, `/checkout/success`, `/checkout/cancel`
- **Públicas**: `/`, `/products`, `/products/:id`, `/about`, `/auth`, `/cart`

### Convenciones

- **Imports**: alias `@/` para todo fuera de la carpeta actual (regla de ESLint `no-restricted-imports` contra `../`); `./` solo dentro de la misma carpeta.
- **Hooks de datos**: exports con nombre, un hook por query/mutation, sin renombrar los campos de React Query. Queries: `useX`/`useX(id)`. Mutaciones: `useCreateX`/`useUpdateX`/`useDeleteX`/`useCancelX`.
- **Query keys**: cada `api/<feature>.queries.ts` expone una factory `xKeys` más builders de `queryOptions()`/`mutationOptions()`; hooks y prefetch siempre consumen esas mismas options.
- **Schemas**: archivos `<feature>Schemas.ts`, instancias en PascalCase (`ProductSchema`), tipos inferidos sin el sufijo `Schema` (`type Product = z.infer<typeof ProductSchema>`).
- **Formato**: `formatCurrency`/`formatOrderDate`/`formatOrderDateTime` de `shared/utils/format.ts` — nada de `toLocaleString`/`toFixed`/`Intl.*` sueltos.
- **Notificaciones** (`shared/store/alertStore.ts`): `success` para acciones completadas, `info` para avisos neutrales, `warning` para acciones destructivas reversibles, `error` para fallos (mensaje de `ApiError` desde un `catch`).
- **Navegación**: `Link`/`NavLink` para ir a una ruta; `navigate()` solo como efecto secundario tras completar una acción.
- **Límite de MUI**: MUI solo para inputs complejos envueltos en `shared/ui` e iconos. El resto usa el design system propio de la app.

## Deploy

Build estático (`npm run build` → `dist/`), pensado para servirse desde un host de sitios estáticos (Netlify, Vercel, etc.) detrás de un backend desplegado por separado. Puntos a tener en cuenta:

- Configurar un rewrite `/* → /index.html` en el host estático (rutas de React Router en cliente).
- El cookie de sesión del backend usa `SameSite=Lax`: si frontend y backend quedan en dominios distintos, hay que proxyear `/api/*` hacia el backend desde el propio host del frontend (o servir ambos bajo subdominios del mismo dominio raíz) para que la cookie viaje.
