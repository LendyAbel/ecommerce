# Ecommerce — Backend

API REST para una aplicación de e-commerce, construida con Node.js, Express y TypeScript. Usa Prisma sobre PostgreSQL para persistencia y Stripe Checkout para pagos (flujo de redirect hospedado).

## Stack

- **Runtime**: Node.js + TypeScript, Express 5
- **Base de datos**: PostgreSQL vía Prisma ORM (cliente generado en `prisma/generated/prisma/`)
- **Auth**: JWT en cookie httpOnly (`jsonwebtoken`, `bcrypt` para hashing)
- **Pagos**: Stripe Checkout + webhooks
- **Validación**: Zod (env vars, request bodies)
- **Logging**: pino / pino-http
- **Tests**: Jest + Supertest

## Requisitos

- Node.js 20+
- PostgreSQL en ejecución (local o remoto)
- Una cuenta de Stripe (modo test sirve para desarrollo) con su CLI si quieres probar webhooks en local

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y completar los valores, ver tabla de abajo
npx prisma migrate dev
npm run seed            # opcional: resetea la DB y carga datos de ejemplo
npm run dev             # http://localhost:3001
```

## Variables de entorno

Validadas al arrancar por `src/lib/config.ts` (Zod) — si falta o es inválida alguna, el proceso no arranca y muestra el error exacto.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP del servidor (ej. `3001`) |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los JWT, mínimo 16 caracteres. Generar uno: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `FRONTEND_URL` | Origen del frontend, usado en la configuración de CORS (`credentials: true`) |
| `LOG_LEVEL` | Nivel de log de pino: `trace \| debug \| info \| warn \| error \| fatal \| silent` (default `info`) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto de firma del webhook de Stripe (`whsec_...`) |
| `STRIPE_CURRENCY` | Moneda de Stripe, opcional (default `eur`) |

## Scripts

```bash
npm run dev            # Servidor de desarrollo con nodemon + ts-node
npm run dev:clean      # Libera el puerto 3001 y luego arranca el servidor
npm run build          # Compila TypeScript a dist/
npm run start          # Ejecuta el build compilado (node dist/src/index.js)
npm run seed           # Resetea la DB y siembra datos con prisma/seed.ts
npm run reset-db       # npx prisma migrate reset
npm run test           # Suite de tests con Jest
npm run test:watch     # Jest en modo watch
npm run test:coverage  # Jest con reporte de cobertura
```

## Base de datos

El schema de Prisma está dividido en varios archivos bajo `prisma/schema/` en lugar de un único `schema.prisma`: `users`, `products`, `categories`, `cart`, `orders`, `addresses`, `config`.

```bash
npx prisma migrate dev    # Aplicar migraciones
npx prisma studio         # Abrir Prisma Studio (GUI)
```

Modelos principales: `User`, `Product`, `Image` (se borra en cascada con el producto), `Category`, `Cart`/`CartItem`, `Order`/`OrderItem` (incluye campos de sesión de Stripe), `Address`. Productos y Categorías tienen relación muchos-a-muchos; Productos también tiene una FK `mainCategory`. Orders y Addresses soportan soft delete.

## Arquitectura

Estructura modular — cada dominio de negocio vive en su propia carpeta bajo `modules/`, con capas `routers/ → controllers/ → services/` y un `schemas/` para validación con Zod.

```
src/
├── index.ts                  # Entry point: arranca el servidor HTTP, apagado
│                              # gracioso (SIGTERM/SIGINT), captura de rejections/exceptions
├── app.ts                    # Construcción de la app Express: middlewares + montaje de rutas
│                              # (se exporta para tests vía supertest)
├── lib/
│   ├── config.ts              # Env vars validadas con Zod — única fuente de verdad
│   ├── prisma.ts               # Cliente de Prisma (singleton)
│   ├── AppError.ts              # Clase de error custom (mensaje + statusCode)
│   ├── logger.ts                 # Logger pino
│   ├── serializers.ts             # Helpers compartidos para dar forma a las respuestas
│   ├── stripe.ts                   # Cliente de Stripe (singleton)
│   └── utils.ts
├── middlewares/
│   ├── errorHandler.ts        # Captura errores de Zod, Prisma, AppError y genéricos
│   ├── authMiddleware.ts       # `authenticate` (JWT desde cookie httpOnly) + `requireAdmin`
│   ├── httpLogger.ts            # Logging de requests con pino-http
│   └── rateLimiters.ts           # `authLimiter` (login/register) + `generalLimiter` (todo /api)
├── tests/                     # Tests de integración con Jest + Supertest
└── modules/
    ├── auth/                   # POST /api/auth/register|login|logout, GET /api/auth/me
    ├── users/                  # /api/users
    ├── products/               # /api/products
    ├── categories/             # /api/categories
    ├── cart/                   # /api/cart
    ├── orders/                 # /api/orders (crear/listar/obtener/cancelar/cambiar estado, + checkout-session)
    ├── addresses/               # /api/addresses
    └── payments/                 # Creación de sesión de Stripe Checkout + /api/webhooks
```

### Flujo de errores

Todos los errores llegan a `errorHandler.ts`, que distingue errores de validación de Zod (400), errores conocidos de Prisma (ej. constraint único → 409), instancias de `AppError` (status custom), y hace fallback a 500.

### Flujo de autenticación

Registro: hashea la contraseña con bcrypt. Login: verifica credenciales y emite un JWT como cookie httpOnly. El middleware `authenticate` extrae y verifica el JWT de la cookie en rutas protegidas, dejando `req.user = { userId, role }`. `requireAdmin` restringe rutas de admin (ej. `GET /api/orders/all`, `PATCH /api/orders/:id/status`) comprobando `req.user.role === 'admin'`.

### Flujo de pagos

El frontend llama a `POST /api/orders/:orderId/checkout-session` (con header `Idempotency-Key`) para obtener la `url` de una sesión de Stripe Checkout, y redirige el navegador ahí. Stripe confirma el pago llamando a `POST /api/webhooks/stripe` (montado *antes* de `express.json()` para poder verificar la firma sobre el raw body) y el backend actualiza el estado de la orden.

### Middlewares de seguridad

En `app.ts`, en este orden: `httpLogger` → `helmet()` → `cors({ origin: FRONTEND_URL, credentials: true })` → `compression()` → router de webhooks (raw body) → `express.json({ limit: '1mb' })` → `cookieParser()` → health check → rate limiters → routers de dominio → `errorHandler`.

`app.set('trust proxy', N)` está fijado al número de proxies de confianza delante de la app (en producción: Netlify + el proxy interno de Fly), para que `express-rate-limit` lea `X-Forwarded-For` correctamente y no agrupe a todos los usuarios bajo una misma IP. Usar `true` en vez de un número concreto permitiría a un cliente falsificar el header y saltarse el rate limit.

## Tests

```bash
npm run test
```

Tests de integración con Jest + Supertest sobre la app de Express (`src/app.ts`), cubriendo auth, cart, categories, orders, products, addresses, payments, users, wishlist y config.

## Deploy

Desplegado en **Fly.io** como contenedor Docker (servicio Node persistente, no funciones serverless — necesario por las conexiones de Prisma y el manejo de raw body del webhook de Stripe), con **Neon** como Postgres gestionado.

- **`Dockerfile`** (multi-stage): instala todas las dependencias (incluidas devDependencies, necesarias para `prisma migrate deploy` en el release), corre `npx prisma generate` (con un `DATABASE_URL` dummy solo para ese paso — `prisma.config.ts` exige que exista la variable aunque `generate` no llegue a conectarse) y `npm run build`; la imagen final corre `node dist/src/index.js`. Instala `openssl` (ausente en `node:22-slim`) porque el motor de migraciones de Prisma lo necesita.
- **`fly.toml`**: expone el puerto 3001 con healthcheck contra `/health`, y usa `release_command = "npx prisma migrate deploy"` para aplicar migraciones automáticamente antes de que la nueva versión reciba tráfico.
- **Secrets** (nunca en `fly.toml`, que sí se commitea): `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` (la URL del frontend en Netlify).
- El webhook de Stripe se registra apuntando a `https://<tu-app>.fly.dev/api/webhooks/stripe` — la ruta real montada (`/api/webhooks` + `/stripe` del router), fácil de equivocar.

```bash
fly deploy                          # build + deploy + migraciones
fly secrets set DATABASE_URL="..." JWT_SECRET="..." STRIPE_SECRET_KEY="..." STRIPE_WEBHOOK_SECRET="..." FRONTEND_URL="https://tu-frontend.netlify.app"
fly logs -a <tu-app>                # logs en vivo
```
