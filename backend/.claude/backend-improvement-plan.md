# Plan: Optimización, mejora y completado del backend de e-commerce

> Documento de referencia versionado en el repo. Alcance aprobado: **todo por fases** + migración de `price`
> `Float` → `Decimal`. Las fases están ordenadas: primero estabilizar/asegurar, luego optimizar/refactorizar, y por
> último construir las features que faltan.

## Estado de avance

Leyenda: ✅ completada · 🔄 en progreso · ⬜ pendiente. Cada subfase/fase se marca aquí al terminarla.

- ✅ **Fase 1 — Correcciones críticas y seguridad** (completada)
- ✅ **Fase 2 — Optimización de consultas e índices** (completada)
- ⬜ Fase 3 — Refactor y robustez
- ⬜ Fase 4 — Features nuevas para e-commerce completo

## Contexto

El backend (Node + Express 5 + Prisma 7 + PostgreSQL) ya cubre auth, productos, categorías y carrito, con tests
unitarios/de integración por módulo (supertest + prisma mockeado). La revisión completa revela **bugs y huecos de
seguridad concretos**, **ineficiencias de consulta**, y **piezas de e-commerce que aún no existen** (órdenes,
checkout, pagos, reseñas, etc.).

---

## ✅ Fase 1 — Correcciones críticas y seguridad (prioridad máxima) — COMPLETADA

> Verificación global de la fase: `tsc --noEmit` sin errores, 62/62 tests en verde, 14 migraciones aplicadas sin
> drift, servidor arranca y `/health` responde. Archivos nuevos: `src/lib/serializers.ts`,
> `src/middlewares/rateLimiters.ts`. Dependencias añadidas: `helmet`, `cors`, `compression`, `express-rate-limit`.

### ✅ 1.1 Bug de autorización: borrar categorías es público — COMPLETADA
`src/modules/categories/routers/categoriesRouter.ts` — `DELETE /:name` **no** tiene `authenticate`/`requireAdmin`.
Cualquiera puede borrar categorías y desasignar productos.
- Añadir `authenticate, requireAdmin` (reusar `src/middlewares/authMiddleware.ts`).

### ✅ 1.2 `price` Float → Decimal (dinero) — COMPLETADA
> Implementado: `Decimal(10,2)` en el schema; migraciones `..._price_to_decimal` y `..._price_decimal_precision`
> aplicadas. Serialización Decimal→number en `serializers.ts` aplicada en `productServices` y `cartServices`.

`prisma/schema.prisma` — `price Float` provoca errores de redondeo.
- Cambiar a `price Decimal @db.Decimal(10, 2)`. Crear migración.
- Ajustar `addNewProduct`/respuestas en `src/modules/products/services/productServices.ts`: Prisma devuelve `Decimal`;
  serializar a número/string en la capa de respuesta. Zod sigue con `z.coerce.number()` en entrada; convertir a
  `Prisma.Decimal` al crear.
- Mismo criterio para futuros campos monetarios (totales de orden). `tax` queda `Int` (% — OK).

### ✅ 1.3 Seed inconsistente y password sin hashear — COMPLETADA
> Implementado: `role: 'customer'` y passwords hasheados con bcrypt en el seed; tipados `ProductStatus`/`UserRole`
> corregidos. (Credenciales dev: `admin@test.com`/`admin`, `user@test.com`/`user`.)

`prisma/seed.ts` — el usuario `user@test.com` tiene `role: 'user'` (el resto del código espera `'customer'`) y
`password: 'user'` **sin hashear** (login con bcrypt fallará).
- Corregir `role` a `'customer'` y hashear el password con `bcrypt.hash` dentro del seed.

### ✅ 1.4 Endurecer middlewares de la app — COMPLETADA
> Implementado: helmet, cors (`FRONTEND_URL` + credentials), compression, `express.json({ limit: '1mb' })`,
> `GET /health` con ping a BD, y rate limiters (`generalLimiter` en `/api`, `authLimiter` en login/register, con
> `skip` en test). `FRONTEND_URL` documentada en `.env.example`.

`src/app.ts` — faltan capas estándar de seguridad/operación:
- `helmet`, `cors` (origen del frontend + `credentials: true`), `express-rate-limit` (global suave + estricto en
  `/api/auth/login` y `/register`), `compression`, y `express.json({ limit: '1mb' })`.
- Añadir `GET /health` (estado + ping a BD).

### ✅ 1.5 Limpieza y consistencia — COMPLETADA
> Implementado: `console.log` de register eliminado; `getParam` lanza `AppError(400)`; password `min(8)` en
> `RegisterSchema`; `User.role` convertido a enum `UserRole` (migración `..._user_role_enum`, normaliza `'user'`→
> `'customer'`).

- Quitar `console.log(user)` de `src/modules/auth/routers/authRouter.ts` (registro).
- `getParam` en `src/lib/utils.ts` lanza `Error` genérico → el `errorHandler` lo trata como 500. Cambiar a
  `AppError(..., 400)`.
- Reforzar `RegisterSchema` (`src/modules/auth/schemas/authZodSchema.ts`): password `min(8)` + complejidad razonable.
- Convertir `User.role` de `String` a `enum UserRole { admin customer }`, alineado con
  `src/modules/users/schemas/userSchemas.ts`.

---

## ✅ Fase 2 — Optimización de consultas e índices — COMPLETADA

> Verificación global: `tsc --noEmit` sin errores, 65/65 tests en verde, 16 migraciones aplicadas sin drift.
> Búsqueda full-text verificada read-only contra la BD (acento/case-insensitive + prefijo). Frontend ajustado al
> nuevo contrato paginado (queda 1 error TS preexistente y ajeno en `ProtectedRoute.tsx`).

### ✅ 2.1 Búsqueda de productos en una sola consulta — COMPLETADA
> Implementado: columna generada `searchVector tsvector` (name + brand + shortDescription, vía wrapper IMMUTABLE
> `f_unaccent`) + índice GIN (migración `..._add_product_search_vector`). `getAllProducts` usa
> `searchVector @@ to_tsquery('simple', f_unaccent(...))` con **prefijo** (`term:*`) y entrada saneada. Una sola
> consulta SQL devuelve ids ordenados + paginados + `count(*) OVER()`; la hidratación con includes queda acotada a
> `limit`. La columna se expone en el schema como `Unsupported("tsvector")?` con `@@index(type: Gin)` para evitar drift.

### ✅ 2.2 Paginación — COMPLETADA
> Implementado: `page`/`limit` en `ProductQuerySchema` (default 1/20, `limit` máx 100). `getAllProducts` devuelve
> `{ data, total, page, limit }`. Frontend: `products.service.ts` (`PaginatedProducts`) y `useProducts` adaptados.

### ✅ 2.3 Índices en el schema — COMPLETADA
> Implementado (migración `..._add_indexes_and_cartitem_unique`): `Product(mainCategoryId|status|createdAt|price)`,
> `Image(productId)`, `CartItem(productId)` y `@@unique([cartId, productId])`. Se omite `@@index([cartId])` por ser
> redundante con el índice del unique compuesto (cartId es su columna líder).

### ✅ 2.4 Carrito: menos viajes y consistencia — COMPLETADA
> Implementado: `addItem` reemplaza find-then-create por un único `cartItem.upsert` (`increment` en update) dentro de
> `$transaction`, con validación de stock atómica (rollback si excede → 409). `updateItem` también valida stock.

### ✅ 2.5 Categorías sin traer arrays de IDs — COMPLETADA
> Implementado: `getAllCategories` usa `_count: { select: { products: true, mainProducts: true } }`. Frontend solo
> consume `id`/`name`, no afectado.

### ✅ 2.6 Borrado de producto sin N+1 — COMPLETADA
> Implementado: `deleteProductById` recalcula huérfanas con **una** consulta (`category.findMany` con filtros `none`)
> + `deleteMany`, todo dentro de `$transaction`.

---

## Fase 3 — Refactor y robustez

### 3.1 Capa de controladores y uniformidad
Las rutas mezclan parseo Zod, llamada a servicio y respuesta inline; la estructura es desigual entre módulos.
- Mantener el patrón router→service (es correcto), pero **extraer controladores** finos por módulo (parse → service →
  status/json) y dejar los routers solo con el wiring. Sin sobre-ingeniería.

### 3.2 Producto: completar CRUD
Existe `ProductUpdateSchema` (`src/modules/products/schemas/productsZodSchema.ts`) pero **no hay** endpoint ni
servicio de update.
- Implementar `PATCH /api/products/:id` (admin) con `updateProduct` (manejar reemplazo de imágenes y re-conexión de
  categorías). Validar `isMain` única entre imágenes.

### 3.3 Logger estructurado
- Sustituir `console.*` por `pino` (o `winston`): logs JSON con nivel, request-id y middleware de request logging. El
  `errorHandler` registra con el logger en vez de `console.error`.

### 3.4 Cierre ordenado y arranque
`src/index.ts` — manejar `SIGTERM/SIGINT` con `server.close()` + `prisma.$disconnect()`, y handlers de
`unhandledRejection`/`uncaughtException`.

### 3.5 Tests e infra
- Tests para nuevos endpoints (update producto, órdenes, checkout) siguiendo el patrón existente
  (`src/tests/cart.test.ts`).
- Test de regresión: `DELETE /api/categories/:name` exige admin (Fase 1.1).
- (Opcional) GitHub Actions: `npm ci`, lint, test, `prisma migrate` contra Postgres de servicio.
- Documentación API con OpenAPI/Swagger (`swagger-ui-express`) o mínimo `.env.example` completo + `README`/`api.http`.

---

## Fase 4 — Features nuevas para e-commerce completo

### 4.1 Órdenes y Checkout (núcleo)
Nuevos modelos en `prisma/schema.prisma`:
- `Order` (userId, status enum `pending|paid|shipped|delivered|cancelled`, subtotal/tax/shipping/total en `Decimal`,
  dirección de envío, timestamps) y `OrderItem` (productId, **snapshot** de `nameAtPurchase`, `priceAtPurchase`,
  `quantity`).
- Módulo `orders/`: `POST /api/orders` (crea orden desde el carrito en una **transacción**: valida stock, decrementa
  `stock`, copia items con precio snapshot, vacía carrito), `GET /api/orders`, `GET /api/orders/:id`,
  `PATCH /api/orders/:id/status` (admin).

### 4.2 Pagos
- Stripe (PaymentIntent): `POST /api/orders/:id/pay` o checkout session + **webhook** `POST /api/payments/webhook`
  que marca la orden `paid`. Guardar `paymentIntentId`/estado en `Order`.

### 4.3 Direcciones de usuario
- Modelo `Address` (1-N con User) y módulo `addresses/` con CRUD; usado por el checkout.

### 4.4 Reseñas y valoraciones
- Modelo `Review` (userId, productId, rating 1-5, comment, `@@unique([userId, productId])`). Crear/listar por
  producto; agregado de rating medio en la respuesta del producto.

### 4.5 Wishlist / favoritos
- Modelo `Wishlist`/`WishlistItem` (o M-N User↔Product) con endpoints add/remove/list.

### 4.6 Panel admin / gestión
- Endpoints admin de listado de usuarios y órdenes, y métricas básicas (ventas, stock bajo). Reusar `requireAdmin`.

### 4.7 Extras de catálogo
- Filtros por rango de precio y por `status`/marca en `ProductQuerySchema`; orden por popularidad (nº de ventas).
- Subida real de imágenes (Cloudinary/S3) en vez de URLs sueltas (opcional).

---

## Archivos clave a tocar (resumen)
- Schema/migraciones: `prisma/schema.prisma`, nuevas migraciones, `prisma/seed.ts`
- Seguridad/app: `src/app.ts`, `src/index.ts`, `src/middlewares/authMiddleware.ts`, `src/middlewares/errorHandler.ts`, `src/lib/utils.ts`
- Productos: `src/modules/products/services/productServices.ts`, `.../routers/productRouter.ts`, `.../schemas/productsZodSchema.ts`
- Carrito: `src/modules/cart/services/cartServices.ts`
- Categorías: `src/modules/categories/routers/categoriesRouter.ts`, `.../services/categoriesServices.ts`
- Auth: `src/modules/auth/routers/authRouter.ts`, `.../schemas/authZodSchema.ts`
- Nuevos módulos: `orders/`, `payments/`, `addresses/`, `reviews/`, `wishlist/`
- Dependencias nuevas: `helmet`, `cors`, `express-rate-limit`, `compression`, `pino`, `stripe`, (opc.) `swagger-ui-express`

---

## Verificación
- **Migraciones:** `npx prisma migrate dev` aplica Decimal, índices, `@@unique` de CartItem, enum de role y nuevos
  modelos sin pérdida de datos; `npm run seed` corre limpio con password hasheado y role `customer`.
- **Tests:** `npm test` en verde, incluyendo nuevos casos (update producto, admin-only en delete categoría, flujo de
  orden/checkout, decremento de stock).
- **Seguridad manual:** `DELETE /api/categories/:name` sin token/admin devuelve 401/403; login excede rate-limit tras
  N intentos; `/health` responde 200.
- **Rendimiento:** `GET /api/products?search=...&page=1&limit=20` devuelve respuesta paginada en una sola consulta;
  añadir item repetido al carrito hace un solo `upsert`.
- **End-to-end (con frontend):** registro → login → listar/paginar productos → añadir al carrito (valida stock) →
  crear orden (decrementa stock, vacía carrito) → pagar (webhook marca `paid`).
</content>
