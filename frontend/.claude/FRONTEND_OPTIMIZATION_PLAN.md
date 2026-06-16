# Plan de Optimización y Refactorización del Frontend

## Context

El frontend (React 19 + TypeScript + Vite + Tailwind 4 + MUI + Zustand + React Query) está **bien estructurado** pero tiene deuda técnica, bugs, código de depuración en producción, falta de primitivas de UI reutilizables y oportunidades de rendimiento. El objetivo es llevarlo a un estándar profesional actual: arquitectura *feature-based*, librería de UI propia, eliminación de bugs, optimización de carga/renders y dejar listo el camino para features reales de e-commerce (checkout, pagos, wishlist, reviews, etc.).

Alcance acordado con el usuario: **refactor completo** + **roadmap detallado de features futuras**. Este documento vive dentro del repo para que viaje con el proyecto.

---

## Hallazgos clave (de la revisión)

**Bugs / correctness**
- `ProtectedRoute.tsx` lee `isAuthLoading` del store, que **no existe** en `authStore`. Además la ruta protegida está vacía en `App.tsx` (`<Route element={<ProtectedRoute />}></Route>` sin hijos) → no protege nada (`/cart` es público).
- `cartStore` declara `isLoading` / `isSyncing` que nunca se actualizan; `ProductActions` lee un `isLoading` que nunca cambia.
- `useSyncCart` sincroniza items con `await` secuencial en bucle → lento y sin atomicidad.

**Código de depuración en producción**
- ~14 `console.log` / `console.error` en: `auth.service.ts`, `categories.service.ts`, `useAuth.ts`, `useSyncCart.ts`, `useAddNewProduct.ts`, `Cart.tsx`.

**Rendimiento**
- `QueryClient` con config por defecto (`staleTime: 0`, refetch en cada focus) → refetches innecesarios.
- `useProducts` pide `limit: 100` fijo y se renderiza todo; sin paginación real ni infinite scroll.
- Imágenes sin `loading="lazy"`, sin `srcSet` ni formatos modernos.
- Sin `React.memo` en componentes de lista (`ProductCard`), funciones recreadas en cada render.
- Sin code-splitting por ruta (`React.lazy` / `Suspense`).

**Arquitectura / consistencia**
- Mezcla de patrones de servicio: `categories.service.ts` usa `axios.get` directo (con try/catch + log) mientras los demás usan instancias; sin interceptores ni cliente API central.
- Sin librería de primitivas UI (`Button`, `Card`, `Badge`, `Input`, `Modal`) — todo inline con clases CSS + MUI.
- `Login`/`Register` casi idénticos (duplicación).
- `NewProductDialog` (190 líneas) consulta categorías por su cuenta en vez de usar `useCategory`.
- Tipos inline redundantes (`cat: {id,name}` en vez de `Category`).
- Nombres con typos: `AddProductButtom.tsx`, `MultipleSelecInput.tsx`, `CartBage.tsx`, `'Requiered'`.
- `authStore` sin persistencia (depende de `me()` en cada arranque).

**Accesibilidad / UX**
- Thumbnails con `alt=''`; pocos `aria-*`; faltan landmarks `<main>`.
- `Authenticate.tsx` con tamaños fijos (`w-215 h-130`) → no responsive en móvil.
- Sin Error Boundary.

**Features incompletas**: favoritos, compartir, checkout (botón deshabilitado), reset de contraseña, página About (stub).

---

## Estructura objetivo (feature-based)

Reorganizar de "por tipo" a "por feature" + capa `shared`/`lib` transversal:

```
src/
├── app/                      # App.tsx, router, providers, error boundary
│   ├── App.tsx
│   ├── router.tsx            # rutas con lazy + Suspense
│   └── providers.tsx         # QueryClientProvider, Router, Theme
├── lib/
│   ├── api/
│   │   └── client.ts         # instancia axios central (baseURL, withCredentials, interceptores)
│   ├── queryClient.ts        # config staleTime/gcTime/retry
│   └── logger.ts             # wrapper de logging (no-op en prod)
├── shared/
│   ├── ui/                   # primitivas: Button, Card, Badge, Input, Modal, Spinner, AsyncButton
│   ├── components/           # Navbar, ErrorBoundary, layout
│   └── hooks/                # useDebounce, etc.
├── features/
│   ├── auth/                 # components (Login, Register, SlicePanel, AuthForm), hooks, service, store, schema, types
│   ├── products/             # ProductCard, ProductDetails/*, ProductFilters, dialogs, hooks, service, schema, types
│   ├── cart/                 # CartBadge, Cart view, store, hooks, service, types
│   └── categories/           # service, hooks, schema, types
├── pages/                    # composición ligera por ruta (Home, Products, ProductDetailPage, CartPage, AuthPage, About)
└── index.css
```

Reglas: cada feature exporta vía `index.ts` (barrel); `pages/` solo compone; nada de imports cruzados entre features salvo a través de `shared`/`lib`.

> Configurar **alias de imports** (`@/`, `@features/`, `@shared/`, `@lib/`) en `vite.config.ts` + `tsconfig` para evitar rutas relativas frágiles tras mover archivos.

---

## Fases de ejecución

> **Leyenda de progreso:** ✅ completada · 🔄 en curso · ⬜ pendiente. Cada subfase se marca al terminarla.

### ✅ Fase 0 — Preparación (sin riesgo) — COMPLETADA
- ✅ **0.1** Guardar este plan en `frontend/.claude/FRONTEND_OPTIMIZATION_PLAN.md`.
- ✅ **0.2** Añadir alias `@` → `src` en `vite.config.ts` y `tsconfig.app.json`.
- ✅ **0.3** Crear `src/lib/logger.ts` (envuelve console; `debug`/`info` no-op en producción).
- ✅ **0.4** Verificación: los cambios de Fase 0 compilan sin errores (alias y logger aislados; el único error del build es un bug **preexistente** en `ProtectedRoute` que se resuelve en 1.2).

### ✅ Fase 1 — Limpieza y bugs críticos (quick wins) — COMPLETADA
- ✅ **1.1** Eliminados todos los `console.*`: dumps de depuración borrados (`auth.service`, `Cart`), trazas y errores migrados a `logger.debug`/`logger.error` (`useAuth`, `useSyncCart`, `useAddNewProduct`); `categories.service` simplificado quitando el try/catch redundante. Único `console.*` restante: dentro de `logger.ts`.
- ✅ **1.2** `ProtectedRoute` arreglado: se añadió `isAuthLoading` (+`setAuthLoading`) al `authStore`, sincronizado desde `useAuth` con la query `me`. **Decisión:** `/cart` se mantiene PÚBLICA (carrito anónimo en localStorage + merge al loguear); el wrapper `ProtectedRoute` queda listo como plantilla para futuras rutas privadas (`/checkout`, `/account`, `/orders`). Build en verde.
- ✅ **1.3** Eliminados `isLoading`/`isSyncing` muertos de `cartStore` (nunca se actualizaban). Se quitó el bloque de carga muerto en `Cart.tsx` (el carrito viene de localStorage = render instantáneo) y se simplificó `disabled` en `ProductActions` a `product.stock === 0`. Build en verde.
- ✅ **1.4** Archivos renombrados: `AddProductButtom`→`AddProductButton`, `MultipleSelecInput`→`MultipleSelectInput`, `CartBage`→`CartBadge` (con su identificador). Imports actualizados en `Navbar`, `Products`, `NewProductDialog`. Typo `'Requiered'`→`'Requerido'` corregido (3 ocurrencias en `productZodSchema`).
- ✅ **1.5** Verificación: `npm run build` ✅ y `npm run lint` ✅ en verde.

### ✅ Fase 2 — Capa de datos / API — COMPLETADA
- ✅ **2.1** Creado `lib/api/client.ts`: instancia axios (`baseURL: '/api'`, `withCredentials: true`) + interceptor que normaliza los errores del backend (campo `error`, con `issues`/`fields` opcionales) a un `ApiError` con `message`, `status` y `details`. `tsc -b` en verde.
- ✅ **2.2** Los 4 servicios (`auth`, `products`, `cart`, `categories`) migrados a `apiClient` con rutas relativas (`/auth/login`, `/products`, `/cart/items`…); eliminadas sus instancias duplicadas de axios y el `axios` directo de categories. `Login`/`Register` ahora capturan `ApiError` (en vez de `axios.isAxiosError`) usando `error.message` ya normalizado. Único import de `axios` en todo `src`: `lib/api/client.ts`. Build en verde.
- ✅ **2.3** `queryClient` extraído a `lib/queryClient.ts` con `staleTime: 60s`, `gcTime: 5min`, `refetchOnWindowFocus: false` y `retry` selectivo (no reintenta 4xx; sí red/5xx hasta 2 veces); mutaciones sin retry. Conectado en `main.tsx`. `tsc -b` en verde.
- ✅ **2.4** `useCategory` ya exponía `isCategoriesError` (cubierto). `NewProductDialog` ahora reutiliza `useCategory()` en vez de su propia `useQuery(['categories'])` duplicada; eliminados imports `useQuery` y `categoriesService` del componente. Build en verde.
- ✅ **2.5** `useSyncCart` paraleliza los `addItem` con `Promise.all` (antes bucle `await` secuencial) en `sync` y `replace`. Verificado en el backend que es seguro: `cart.upsert` atómico + `cartItem.upsert` por `@@unique([cartId, productId])` en transacción → productos distintos = filas distintas, sin carrera. `clearCart` se mantiene secuencial antes del replace (dependencia).
- ✅ **2.6** Verificación: `npm run build` ✅ + `npm run lint` ✅ en verde. (Pendiente prueba manual en runtime con backend levantado.)

### ✅ Fase 3 — Librería de UI (`shared/ui`) — COMPLETADA
- ✅ **3.1** Creado `shared/ui/Button.tsx` (variantes primary/secondary/accent/outline/ghost + tamaños sm/md/lg + `fullWidth` + `loading` con spinner integrado + `aria-busy`, `type='button'` por defecto) sobre las clases `.btn-*` existentes; barrel `shared/ui/index.ts`. Adoptado en los botones con spinner de `Login`, `Register` y `NewProductDialog` (2 botones) → eliminado el SVG de spinner duplicado 3-4 veces. Build + lint en verde.
- ✅ **3.2** Primitivas (una por una):
  - ✅ `Spinner` (`shared/ui/Spinner.tsx`): accesible con `label` / decorativo sin él; `Button` lo reutiliza (SVG inline eliminado) y `ProtectedRoute` sustituye MUI `CircularProgress` por él.
  - ✅ `Card` (`shared/ui/Card.tsx`): encapsula `rounded-2xl border border-border bg-surface shadow-sm` + prop `padded`; adoptado en las 2 tarjetas de `Cart` (item y resumen).
  - ✅ `Badge` (`shared/ui/Badge.tsx`): mapea las clases `.badge-*` (primary/success/warning/error/hot/new/best) que estaban definidas pero sin usar; adoptado en el modo compact de `ProductStockBadge`.
  - ✅ `Modal` (`shared/ui/Modal.tsx`): envuelve MUI `Dialog` con el estilo de superficie + cabecera opcional (`eyebrow`/`title`) y botón de cierre **accesible** (`aria-label='Cerrar'`); adoptado en `NewProductDialog` (eliminado su Dialog, header y el import de `Close`).
  - ✅ `Input`/`FormField`: **no se crea nada nuevo** (decisión YAGNI). La capa ya existe en `components/common/` (`TextFieldInput` + selects + `ImagesInput`, tied a TanStack Form); su **reubicación a `shared/`** se hará en la Fase 6. Mejora aplicada: error de `TextFieldInput` usa el token `text-error` en vez de `text-red-500`.
- ✅ **3.3** Creado `AuthForm` genérico (`components/auth/AuthForm.tsx`): encapsula la lógica de envío (Zod + `ApiError` + navigate) y la maquetación; campos por config. `Login` y `Register` reescritos sobre él (de ~120/140 líneas a ~60 cada uno) manteniendo su `motion.div`. Tipos resueltos: `icon: JSX.Element`, `schema: ZodType<TValues, TValues>`.
- ✅ **3.4** Verificación: `npm run build` ✅ + `npm run lint` ✅.

### ⬜ Fase 4 — Rendimiento
- ⬜ **4.1** Code-splitting por ruta con `React.lazy` + `<Suspense fallback>`.
- ⬜ **4.2** `React.memo` en `ProductCard` y subcomponentes; `useCallback`/`useMemo` en listas grandes.
- ⬜ **4.3** Paginación real / infinite scroll en `Products`; `Home` usa `limit:4` desde el API en vez de `slice(0,4)`.
- ⬜ **4.4** Imágenes: `loading="lazy"`, `decoding="async"`, dimensiones explícitas; `srcSet` si aplica.
- ⬜ **4.5** Revisar `manualChunks` en build de Vite (separar MUI/motion).
- ⬜ **4.6** Verificación: `npm run build` + tamaño de chunks; Lighthouse/Network antes-después.

### ⬜ Fase 5 — Accesibilidad, robustez y pulido
- ⬜ **5.1** `ErrorBoundary` global con fallback amigable.
- ⬜ **5.2** Alt text descriptivo; `aria-*`/`role` donde falte; landmark `<main>` por página; foco visible.
- ⬜ **5.3** `Authenticate` responsive (sustituir `w-215 h-130` por clases fluid + breakpoints).
- ⬜ **5.4** `authStore` con persistencia ligera opcional, manteniendo `me()` como verificación.
- ⬜ **5.5** Verificación: navegación por teclado, axe DevTools sin errores críticos, viewport móvil.

### ⬜ Fase 6 — Reorganización feature-based de carpetas
- ⬜ **6.1** Crear estructura `app/`, `lib/`, `shared/`, `features/`, `pages/` con barrels (`index.ts`).
- ⬜ **6.2** Mover servicios/hooks/componentes a su feature y actualizar imports al alias `@`.
- ⬜ **6.3** Verificación: `npm run build` + `npm run lint` en verde.

---

## Archivos críticos a tocar (representativos)

- Router/app: `src/App.tsx`, `src/main.tsx` → `src/app/{App,router,providers}.tsx`
- Cliente API: nuevo `src/lib/api/client.ts`, `src/lib/queryClient.ts`, `src/lib/logger.ts`
- Servicios: `src/services/*.service.ts` → `src/features/*/api`
- Hooks: `src/hooks/**` → `src/features/*/hooks`
- Bug guard: `src/layouts/ProtectedRoute.tsx`, `src/store/authStore.ts`, `src/store/cartStore.ts`
- UI nueva: `src/shared/ui/*`
- Listas/imágenes: `src/components/product/ProductCard.tsx`, `ProductDetails/ProductImageGallery.tsx`, `src/pages/{Products,Home}.tsx`

---

## Roadmap de features futuras (e-commerce real)

**Must-have (MVP comercial)**
1. **Checkout completo**: dirección de envío, resumen de pedido, métodos de envío. (frontend + endpoints de orders).
2. **Pasarela de pago**: integración Stripe (Payment Element) o similar; manejo de estados de pago y webhooks (backend).
3. **Órdenes / historial**: `/orders` y `/orders/:id`, estados (pendiente, pagado, enviado, entregado).
4. **Cuenta de usuario**: `/account` (perfil, direcciones, cambiar contraseña).
5. **Auth robusta**: validación fuerte de contraseña (Zod: min length, complejidad), recuperación de contraseña, verificación de email.
6. **Protección real de rutas privadas** (checkout, account, orders, panel admin).

**Should-have (conversión y confianza)**
7. **Wishlist / favoritos** (cablear el botón ya existente).
8. **Reviews y ratings** de productos.
9. **Búsqueda mejorada**: autocomplete, búsqueda server-side con índices, "no resultados" con sugerencias.
10. **Filtros avanzados**: rango de precio, marca, disponibilidad, multi-categoría con URL state (querystring).
11. **Panel de administración** dedicado (`/admin`): CRUD de productos, categorías, stock, pedidos (hoy es un FAB suelto).
12. **Stock en tiempo real** y aviso de bajo stock / agotado.

**Nice-to-have (escala y madurez)**
13. **SEO**: meta tags dinámicos, Open Graph, sitemap; valorar SSR/SSG (migración a Next.js) si SEO es prioridad.
14. **i18n** (multi-idioma) y multi-moneda.
15. **Cupones / descuentos** y promociones.
16. **Notificaciones** (toasts con `sonner`/MUI Snackbar) para feedback de acciones.
17. **Analítica** (eventos de carrito, conversión) y monitoreo de errores (Sentry).
18. **Tests**: Vitest + React Testing Library (unit/integration) y Playwright (e2e) — actualmente no hay tests.
19. **PWA / offline** para catálogo.

---

## Verificación end-to-end (global)

Tras cada fase y al final:
1. `cd frontend && npm run lint` → sin errores.
2. `npm run build` → compila; revisar tamaño de chunks.
3. `npm run dev` con el backend corriendo (`backend/ npm run dev`).
4. Flujos manuales: registro → login → navegar catálogo con filtros/orden → ver detalle → añadir al carrito (anónimo) → login (merge de carrito) → modificar carrito → logout (persistencia) → admin: crear/eliminar producto.
5. DevTools Network: confirmar reducción de refetches; React Query Devtools para cache.
6. Lighthouse (Performance/Accessibility) antes y después en `/products` y `/products/:id`.
7. axe DevTools: 0 errores críticos de accesibilidad.

> Estrategia de bajo riesgo: ejecutar por fases en commits separados; la reorganización de carpetas (con alias) en su propio commit para que los diffs sean revisables.
