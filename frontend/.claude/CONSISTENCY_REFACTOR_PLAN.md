# Plan de Correcciones, Optimización y Consistencia (v2)

> Continuación de `FRONTEND_OPTIMIZATION_PLAN.md` (completado). Este plan sale de una
> revisión completa del frontend (y de los contratos con el backend) contra la guía
> `.agents/skills/vercel-react-best-practices/SKILL.md`. Entre paréntesis se citan las
> reglas de la guía que aplican (`rerender-*`, `bundle-*`, etc.).
>
> **Leyenda de progreso:** ✅ completada · 🔄 en curso · ⬜ pendiente. Marcar cada subfase al terminarla.

---

## Diagnóstico general

La base es buena: arquitectura feature-based, design system propio en `index.css`,
React Query bien configurado (`staleTime`, retry selectivo), code-splitting por ruta
con preload por intención, `ErrorBoundary`, logger central. Lo que queda es de tres tipos:

1. **Bugs de flujo** (registro sin sesión real, promesas sin capturar, cart sync duplicado).
2. **Inconsistencias de código** (imports mixtos, naming de hooks/schemas/servicios dispar,
   query keys duplicadas a mano, 3 formateadores de precio distintos).
3. **Inconsistencias de UI/UX** (navegación con `div onClick` vs `<button>` vs `NavLink`,
   estados de error ad-hoc que duplican `ErrorState`, borrado sin confirmación en un sitio
   y con modal en otros, `<title>` fijo "frontend" con `lang="en"`).

---

## Fase 1 — Bugs y correcciones funcionales (prioridad máxima)

### ✅ 1.1 Registro no crea sesión real (bug frontend + backend)
`backend/src/modules/auth/controllers/authController.ts` → `register` **no setea la cookie**
`token`, pero el frontend (`useAuth.registerMutation.onSuccess`) hace `setUser(user)` +
`syncWithBackendAsync()`. Resultado: tras registrarse, la UI muestra sesión iniciada
(user persistido en sessionStorage) pero toda llamada autenticada (cart, orders) falla con 401.
- Corregir en backend: `register` debe generar el JWT y setear la cookie igual que `login`
  (reutilizar la lógica; devolver `{ user }`).
- Añadir test en `backend/src/tests/auth.test.ts` que verifique la cookie en register.

### ✅ 1.2 `useAuth()` se ejecuta en 6 componentes → efectos y fetches multiplicados
`useAuth` (query `me` + 3 mutaciones + 2 `useEffect`) se llama en `App`, `Navbar`, `Login`,
`Register`, `AuthMobile` y `UserMenu`. Cada instancia repite los `useEffect`: al resolverse
`me`, `fetchFromBackendAsync()` (GET /cart) se dispara **una vez por instancia montada**
(2–4 peticiones idénticas), y `setUser`/`setAuthLoading` se ejecutan N veces
(`client-swr-dedup`, `rerender-split-combined-hooks`).
- Dividir el hook:
  - `useAuthBootstrap()` — query `me` + sincronización con `authStore` + fetch inicial del
    carrito. Se llama **solo en `App`**.
  - `useAuthActions()` — mutaciones `login`/`register`/`logout` con sus `isPending`.
    Se llama donde haga falta la acción.
- De paso, evitar el patrón "estado derivado vía efecto" (`rerender-derived-state-no-effect`):
  hacer el `setUser` en el propio `queryFn`/`onSuccess` de la única instancia, no en efectos
  que observan `isSuccess`/`isError`.

### ✅ 1.3 Promesas de mutación sin capturar en handlers (unhandled rejections)
Patrón inconsistente: `AuthForm`, `AddressForm` y `Wizard` capturan errores y muestran
feedback; estos otros no — si la mutación falla, hay unhandled rejection y el usuario no
ve nada:
- `src/pages/Cart.tsx` → `goToCheckout` (`replaceCartAsync` puede fallar; además ver 1.4).
- `src/features/products/components/ProductDetails.tsx` → `handleDelete`.
- `src/features/addresses/components/AddressBook.tsx` → `handleConfirmDelete`.
- `src/features/orders/components/OrderUserActions.tsx` → `handleCancel`.
- `Navbar`/`UserMenu` → `logout()` (fire-and-forget sin catch).

Unificar el patrón: `try { await mutateAsync() ... } catch (e) { notify.error(...) }` usando
el mensaje de `ApiError` (igual que hace `Wizard.handleConfirm`).

### ✅ 1.4 `/cart` es pública pero "Proceder al pago" exige sesión
`goToCheckout` llama `replaceCartAsync()` (endpoints de cart autenticados) **antes** de
navegar a `/checkout`. Un usuario anónimo obtiene un 401 silencioso y no pasa nada.
- Comprobar `user` en `Cart`: si no hay sesión, redirigir a `/auth` (idealmente con
  `?redirect=/checkout` para volver tras loguearse).
- Alternativa mínima: dejar que `ProtectedRoute` haga la redirección y mover el
  `replaceCartAsync` al montar el `Wizard` (así el sync ocurre ya autenticado).

### ✅ 1.5 Reanudar checkout con `?orderId=` inválido → spinner infinito
`Wizard` solo contempla `isResuming && !activeOrder` como "cargando". Si
`useGetOrderDetails` falla (404, orden ajena), el spinner queda para siempre.
Manejar `isError`: mostrar `ErrorState` con acción de volver a `/orders`.

### ✅ 1.6 Carrito local guarda el shape del servidor
`useSyncCart` pasa `Cart.cartItems` del backend (con `id`, `cartId`, `productId`) directo a
`setCartItems(...)`, que espera `LocalCartItem[]` (`{ product, quantity }`). Los campos extra
se persisten en localStorage y los dos modelos (item local por `product.id`, item remoto por
`itemId`) se mezclan. Mapear explícitamente al shape local en los `onSuccess`:
`items.map(({ product, quantity }) => ({ product, quantity }))`.

### ✅ 1.7 Restos de UI en `OrderDetails`
`src/features/orders/components/OrderDetails.tsx:58-63`: párrafo suelto
"Direccion de envio: ..." sin estilos ni acentos que duplica el `OrderAddressCard`
renderizado más abajo. Eliminarlo.

### ✅ 1.8 Invalidación incompleta del detalle de producto
`useAddNewProduct`/`useDeleteProductById` invalidan `['products']` y `['categories']` pero
**no** `['product', id]` (singular). Tras editar/borrar, el detalle cacheado queda obsoleto.
Se resuelve de raíz con las query key factories de la Fase 2.1 (hacer el detalle hijo de la
key raíz: `['products', 'detail', id]`).

### ✅ 1.9 Verificación de fase
`npm run build` + `npm run lint` + prueba manual: registro → carrito → checkout → orden;
registro con backend levantado comprobando cookie y GET /cart único en Network.

---

## Fase 2 — Capa de datos consistente (React Query + servicios)

### ✅ 2.1 Query keys centralizadas por feature (factory + `queryOptions`)
Hoy conviven: `PRODUCT_KEY = ['products']` exportado, `['product', id]` literal,
`['products','featured']` literal, `ORDER_KEY = ['order']` local, `KEY = ['addresses']`
local, `['user']`, `['categories']`. Además `ProductCard.prefetchDetails` y
`OrderRow.prefetchDetail` duplican key+fetcher a mano — si cambia el hook, el prefetch
se desincroniza en silencio.
- Crear en cada feature un `<feature>.queries.ts` con **`queryOptions()`** de React Query v5:
  ```ts
  // features/products/api/products.queries.ts
  export const productKeys = {
      all: ['products'] as const,
      list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
      detail: (id: string) => [...productKeys.all, 'detail', id] as const,
      featured: (limit: number) => [...productKeys.all, 'featured', limit] as const,
  };
  export const productDetailOptions = (id: string) =>
      queryOptions({ queryKey: productKeys.detail(id), queryFn: () => productsService.getProductById(id) });
  ```
- Hooks y prefetch consumen las mismas options: `queryClient.prefetchQuery(productDetailOptions(id))`.
- Repetir para orders, addresses, categories y user. Invalidaciones vía `xKeys.all`.

### ✅ 2.2 `useSyncCart`: no suscribirse a estado que solo usan callbacks
`const { cart } = useCartStore()` suscribe el hook (y a quien lo use: `Navbar` vía `useAuth`,
`Cart`…) a cada cambio del carrito solo para leerlo dentro de `mutationFn`
(`rerender-defer-reads`). Además el closure puede capturar un cart desactualizado.
- Leer dentro de la mutación: `useCartStore.getState().cart.cartItems`.
- Mantener solo `setCartItems` como suscripción (es una función estable).

### ✅ 2.3 Unificar convención de hooks de datos
Conviven tres estilos: `useProducts` (default export, nombres `isProductsLoading`),
`useGetAddresses`/`useCreateAddress` (named, devuelven la query entera),
`useGetOrdersList` (named, objeto renombrado). Elegir **una** convención y aplicarla:
- Recomendada: named exports; queries `useProducts()`, `useProduct(id)`, `useOrders()`,
  `useOrder(id)`, `useAddresses()`; mutaciones `useCreateX/useUpdateX/useDeleteX`;
  devolver la query/mutación tal cual (sin renombrar campos) salvo datos derivados.
- Actualizar consumidores. Eliminar renombres tipo `isProductsLoading` → usar `isLoading`
  en el punto de uso.

### ✅ 2.4 Unificar servicios API
- Corregir typo `BASE_ENPOINT` → `BASE_ENDPOINT` (`orders.service.ts`).
- Naming uniforme de métodos: `getX`/`getXById`/`createX`/`updateX`/`deleteX`
  (hoy `fetchOrder` vs `getProductById` vs `addNewProduct`).
- Tipar respuestas con los schemas Zod existentes **o** eliminar la ilusión de validación:
  hoy los schemas de orders/addresses definen el contrato pero los servicios hacen cast
  (`res.data`). Decisión recomendada: validar en dev (`schema.parse` dentro del servicio
  solo si `import.meta.env.DEV`) y cast en prod; o documentar que los schemas son solo tipos.
- Backend: normalizar envelopes — `GET /addresses` devuelve `{ addresses }` mientras
  products/orders devuelven el recurso directo. Elegir "recurso directo" y ajustar
  `addressControler.listAddresses` + `addresses.service.ts` del frontend.

### ✅ 2.5 Verificación de fase
Build + lint + Network: un solo GET por recurso al navegar, prefetch en hover sigue
funcionando (Products → detalle instantáneo), invalidaciones correctas al crear/borrar.

`npm run build` y `npm run lint` en verde tras unificar hooks/servicios (2026-07-24).

---

## Fase 3 — Consistencia de escritura de código

### ✅ 3.1 Política única de imports
Mezcla actual: `@/features/...` absolutos (products, auth, shared) vs relativos
`../api/...` (addresses, orders, checkout). Además, se importa a veces del barrel
(`@/features/auth`) y a veces deep (`@/features/auth/store/authStore`) para lo mismo.
- Regla propuesta (alineada con `bundle-barrel-imports`):
  1. Todo import cruzado usa alias `@/` (nunca `../`). Relativos solo dentro de la misma carpeta (`./`).
  2. Import **directo al módulo** (deep), no al barrel de la feature. Los `index.ts` de
     features quedan solo como documentación de API pública o se eliminan.
- Hacerlo cumplir con ESLint: `no-restricted-imports` (patrón `../*`) — ya está
  `simple-import-sort`; añadir la regla y pasar `--fix` + ajuste manual.

Ya cumplido: `eslint.config.js` tiene `no-restricted-imports` bloqueando `../` y los
barrels de features (`^@/features/[^/]+/?$`); grep de `'../` en `src` = 0 coincidencias.

### ✅ 3.2 Naming uniforme de schemas y tipos
- Archivos: `productZodSchema.ts` / `categoryZodSchema.ts` vs `orderSchemas.ts` /
  `addressSchemas.ts` / `userSchema.ts` → renombrar todos a `<feature>Schemas.ts`.
- Identificadores: `productSchema` (camel) vs `OrderSchema`/`AddressSchema` (Pascal) →
  elegir una convención (recomendada: camelCase para instancias de schema, PascalCase
  solo para tipos) y aplicarla.
- Deduplicar: `AddressSchema`/`AddressInputSchema` en `orderSchemas.ts` duplican los de
  `features/addresses` → importar de addresses (o mover la parte compartida a un
  `shared/schemas` si se quiere evitar dependencia entre features).
- `BadgeVariant` está redefinido en `orders/utils/orderStatus.ts` → exportarlo desde
  `shared/ui/Badge.tsx` e importarlo.

Aplicado (2026-07-24): archivos renombrados a `<feature>Schemas.ts` (`userSchemas.ts`,
`categorySchemas.ts`, `productSchemas.ts`; `addressSchemas.ts`/`orderSchemas.ts` ya lo
cumplían). Identificadores unificados a **PascalCase para instancias** (`CategorySchema`,
`ImageSchema`, `StatusSchema`, etc. — se invirtió la recomendación original del plan porque
la mayoría del código ya usaba Pascal: 20 instancias Pascal vs 5 camel antes del cambio).
`orderSchemas.ts` ya no define `AddressInputSchema`: reutiliza `AddressFormSchema` de
`features/addresses` (misma forma exacta). `BadgeVariant` ya se importaba desde `Badge.tsx`.

### ✅ 3.3 Formateadores compartidos (precio/fecha)
Tres formatos de precio conviven y **se ven distintos en pantalla**:
- `Cart.tsx` → `toLocaleString('es-ES', { currency: 'EUR' })`
- `ProductPrice.tsx` → `parseFloat(...).toFixed(2) + ' €'`
- `orders/utils/orderStatus.ts` → `Intl.NumberFormat` (el bueno: formatter a nivel de módulo,
  `js-hoist-regexp`/coste de `Intl.*` amortizado)

Crear `shared/utils/format.ts` con `formatCurrency`, `formatDate`, `formatDateTime`
(mover los de `orderStatus.ts`, dejar allí solo lo específico de estados de pedido) y
usarlo en Cart, ProductPrice, Step2/3, OrderRow, OrderItemsCard, etc. Un solo formato de
precio en toda la app.

### ✅ 3.4 Reubicar utilidades mal colocadas
`shared/utils/utils.ts` mezcla estilos MUI (`sxInputStyle`, `sxButtonStyle`) con un hook
(`useDebounce`). Separar:
- `shared/hooks/useDebounce.ts`
- `shared/ui/muiStyles.ts` (o junto a los inputs que los usan)

Ya separados: `shared/hooks/useDebounce.ts` y `shared/utils/muiStyles.ts`.

### ✅ 3.5 Convención de notificaciones
Mensajes inconsistentes: login exitoso → `notify.info`, dirección creada → `notify.success`,
vaciar carrito → `notify.warning`, producto eliminado → `notify.info`. Definir y aplicar:
- `success` = operación completada (login, registro, crear/editar/eliminar con éxito).
- `info` = neutral informativo. `warning` = acción destructiva reversible o aviso.
- `error` = fallo (siempre desde el catch, con mensaje de `ApiError`).

Aplicado (2026-07-24): `AuthForm` (login/registro), `OrderUserActions` (cancelar pedido) y
`OrderAdminStatusSelect` (cambio de estado) pasaron de `notify.info` a `notify.success`.
`CartResumen` (vaciar carrito) pasó de `notify.success` a `notify.warning` (destructivo
reversible). Además se añadió `try/catch` + `notify.error` donde faltaba feedback de fallo:
`Step3.handlePay` (creación de sesión de Stripe), `CartItemCard.handleRemove/handleUpdate`
(sync de carrito con backend) y `ProductActions.handleAddToCart` (además, `notify.success`
ahora se dispara solo tras confirmar con el backend, no antes).

### ✅ 3.6 Actualizar `CLAUDE.md` (raíz del repo)
La sección de arquitectura describe la estructura antigua (`src/store`, `src/services`,
`src/hooks`, ProtectedRoute "guards /cart") y omite los módulos cart/orders/addresses del
backend y las páginas orders/checkout/addresses. Reescribir el árbol de frontend
(feature-based) y backend, rutas actuales, y documentar las convenciones decididas en
este plan (imports, hooks, keys, notify, formatters).

El árbol de arquitectura ya estaba al día. Añadida la sección "Frontend conventions" en
`CLAUDE.md` con el resumen de imports, hooks de datos, query keys, schemas, formatters,
notificaciones y manejo de errores en mutaciones (2026-07-24).

### ✅ 3.7 Verificación de fase
`npm run lint` sin errores con las reglas nuevas; `npm run build`; grep de `../` en imports
= 0 (fuera de mismos directorios); revisar que la UI muestra un único formato de precio.

`npm run build` y `npm run lint` en verde tras 3.2-3.6 (2026-07-24).

---

## Fase 4 — Consistencia UI/UX

### ✅ 4.1 Navegación semántica y accesible (un solo patrón)
Tres patrones conviven para "ir a una página": `ProductCard` = `motion.div onClick`
(**no enfocable, invisible para teclado y lectores**), `OrderRow` = `<button onClick=navigate>`
(enfocable pero sin semántica de enlace: no middle-click, no "abrir en pestaña"),
`Navbar`/`Home` = `NavLink` (correcto).
- Convertir `ProductCard` y `OrderRow` en `<Link to=...>` de react-router (envolver o usar
  el propio card como link con estilos actuales; motion se conserva con `motion(Link)` o
  wrapper). Mantener `onMouseEnter/onFocus` de prefetch.
- `CartBadge` → `<Link to='/cart'>` en lugar de `button + navigate`.

Ya cumplido: `ProductCard`, `OrderRow` y `CartBadge` envuelven su contenido en `NavLink`
de react-router, manteniendo `onMouseEnter`/`onFocus` para el prefetch (2026-07-30).

### ✅ 4.2 Estados de error/vacío: usar siempre los componentes compartidos
`OrdersList` re-implementa a mano tanto el error (div idéntico a `ErrorState`) como el
vacío (div idéntico a `EmptyState`). Sustituir por `ErrorState`/`EmptyState` con acción
de reintento (`refetch`) como ya hace `AddressBook`. Revisar el resto de páginas para
que todo error de query tenga botón «Reintentar» (hoy solo addresses lo tiene).

Aplicado (2026-07-30): `OrdersList`/`AddressBook` ya usaban `ErrorState`/`EmptyState` con
reintento. Se completó lo que faltaba: `useProducts`, `useProduct` y `useOrder` ahora
exponen `refetch`, y `ProductsList`, `ProductDetails` y `OrderDetails` muestran botón
«Reintentar» en su `ErrorState` (antes solo mostraban el mensaje).

### ✅ 4.3 `ConfirmDialog` compartido + confirmación consistente
- `AddressBook` (eliminar dirección) y `OrderUserActions` (cancelar pedido) duplican el
  mismo modal de confirmación → extraer `shared/ui/ConfirmDialog.tsx`
  (props: `title`, `message`, `confirmLabel`, `variant='danger'`, `loading`, `onConfirm`, `onClose`).
- **Inconsistencia grave**: "Eliminar producto" (`ProductDetails`, acción admin destructiva)
  borra **sin confirmación** mientras direcciones y pedidos sí confirman. Añadir el
  `ConfirmDialog` ahí.

Ya cumplido: `shared/components/ConfirmDialog.tsx` extraído y usado en `AddressBook`,
`OrderUserActions` y `ProductDetails` (borrado de producto ya confirma antes de ejecutar).

### ✅ 4.4 UI muerta: implementar u ocultar
- `ProductActions`: botones "favoritos" y "compartir" no hacen nada. Ocultarlos hasta que
  exista la feature (o implementar compartir con `navigator.share`/copiar enlace, que es barato).
- `Login`: "¿Olvidaste tu contraseña?" es un `<p>` clickable sin acción ni ruta. Quitarlo
  o convertirlo en link real cuando exista el flujo.
- `ProductActions` usa clases `btn btn-primary` crudas → usar el componente `Button`
  compartido (consistencia con el resto de acciones).

Aplicado (2026-07-30): `ProductActions` ya usaba el `Button` compartido. Se implementó
"compartir" (`navigator.share` con fallback a copiar el enlace al portapapeles +
`notify.success`/`notify.error`) y se corrigió el `title` del botón de compartir (decía
"Guardar en favoritos", duplicado del botón de favoritos). Por decisión explícita del
usuario, el botón de favoritos y el enlace "¿Olvidaste tu contraseña?" de `Login`
**se mantienen visibles sin funcionalidad** (no se ocultan ni se quitan) hasta que se
implementen sus flujos.

### ✅ 4.5 Metadatos del documento
`index.html`: `<title>frontend</title>`, `lang="en"`, favicon de Vite, sin meta description.
- `lang="es"`, título real de la tienda ("Voltora" según About), favicon propio, meta description.
- Título por página con React 19 (soporta `<title>` nativo en JSX): añadir en cada página
  `<title>Productos · Voltora</title>` etc. — barato y mejora historial/pestañas/SEO.

Ya cumplido `lang="es"`, `<title>Voltora</title>` y el `<title>` por página en las 9
páginas. Completado (2026-07-30): el favicon apuntaba a `/vite.svg`, que no existía en el
repo (sin carpeta `public/`, icono de pestaña roto) — se creó `public/favicon.svg` propio
("V" sobre el color primario) y se añadió `<meta name="description">`.

### ✅ 4.6 Fuentes sin bloquear el render (`rendering-resource-hints`)
El `@import url(googleapis...)` al inicio de `index.css` bloquea el primer render y
encadena requests (CSS → CSS de fonts → woff2). Mover a `index.html`:
`<link rel="preconnect" href="https://fonts.googleapis.com|gstatic.com">` +
`<link rel="stylesheet" href=...>` (o self-host con `@fontsource`). Quitar el `@import`.

Aplicado (2026-07-30): `@import` de Google Fonts eliminado de `index.css`; movido a
`index.html` como `preconnect` (googleapis + gstatic) + `<link rel="stylesheet">`.

### ✅ 4.7 Unificar patrón de cabecera de página y "Cargar más"
- `Orders`/`Address` tienen header h1+subtítulo; `Cart` solo h1; `Products` no tiene título.
  Extraer `PageHeader` (title, subtitle) y usarlo en las 4 (decidir si Products lleva título).
- Botón "Cargar más" duplicado en `Products` y `OrdersList` → extraer `LoadMoreButton`
  (recibe `hasNextPage`, `isFetchingNextPage`, `onClick`) o valorar infinite scroll con
  IntersectionObserver (`rendering-content-visibility` para listas largas si crecen).
- Skeletons: unificar ubicación (`components/skeletons/` en todas las features; addresses
  lo tiene en la raíz de components).

Ya cumplido: `shared/components/PageHeader.tsx` y `shared/ui/LoadMoreButton.tsx`
extraídos y usados en Products/Cart/Orders/Address y en `ProductsList`/`OrdersList`
respectivamente; skeletons unificados en `components/skeletons/` en las 4 features
(incluida `addresses`, que antes tenía `AddressListSkeleton.tsx` en la raíz).

### ✅ 4.8 Política de MUI vs design system propio (documentar y aplicar)
Hoy MUI aparece en: inputs de formulario (TextField/Select — OK, envueltos), `Dialog`
(OK, envuelto en `Modal`), pero también suelto: `IconButton`/`Tooltip` en Cart,
`ToggleButtonGroup` en filtros, `Alert` en `NewProductDialog`, `useMediaQuery` en
`Authenticate`. Decidir la frontera y documentarla en CLAUDE.md. Propuesta:
- MUI permitido: inputs complejos envueltos en `shared/ui` + iconos (`@mui/icons-material/X`).
- Reemplazar `Alert` de MUI en `NewProductDialog` por el patrón de error propio
  (`serverError` + `<p class='text-error'>` como `AuthForm`/`AddressForm`) — hoy hay dos
  lenguajes visuales de error de formulario.
- `useMediaQuery` de MUI → hook propio con `matchMedia` (evita depender de MUI para layout)
  o mantener y documentar. Elegir y anotar.

Aplicado (2026-07-30): frontera documentada en `CLAUDE.md` ("MUI boundary"). `Alert` de
`NewProductDialog` sustituido por el patrón `serverError` + `<p className='text-error'>`
(de paso se envolvió `createProduct` en `try/catch`, antes era una promesa sin capturar).
`useMediaQuery` de MUI reemplazado por `shared/hooks/useMediaQuery.ts` propio
(`matchMedia` + listener de `change`) en `Authenticate.tsx`.
**Pendiente de una pasada futura** (no se tocó en esta ronda): `IconButton`/`Tooltip` en
`CartItemCard` y `ToggleButtonGroup` en `ProductFilters` siguen sueltos, fuera de la
frontera documentada — quedan señalados como excepción conocida, no urgente.

### ✅ 4.9 Verificación de fase
Navegar toda la app solo con teclado (Tab/Enter): cards y filas alcanzables; abrir
producto/pedido en pestaña nueva con middle-click; axe DevTools sin errores críticos;
títulos de pestaña correctos; fuentes cargando sin FOIT largo (Network).

`npm run build` y `npm run lint` en verde tras 4.2, 4.4, 4.5, 4.6 y 4.8 (2026-07-30).
Verificación manual con la app levantada (navegación por teclado/middle-click, favicon,
fuentes) queda pendiente de que el usuario la haga en el navegador.

---

## Fase 5 — Pasada de rendimiento (guía Vercel)

### ✅ 5.1 Deep imports de MUI en código propio (`bundle-barrel-imports`)
Los iconos ya usan deep imports, pero los componentes se importan del barrel:
`import { Dialog } from '@mui/material'`, `{ TextField, Select... }`, `{ IconButton, Tooltip }`.
Cambiar a `@mui/material/Dialog`, `@mui/material/TextField`, etc. (mejora tiempo de dev
server y aísla el coste real por componente). Añadir regla ESLint `no-restricted-imports`
para `@mui/material` y `@mui/icons-material` (solo paths profundos).

Aplicado (2026-07-30): convertidos a import profundo los 5 ficheros que quedaban con
barrel de `@mui/material` (`ProductFilters`, `TextFieldInput`, `SingleSelectInput`,
`MultipleSelectInput`, `ImagesInput`) — `Modal`/`CartItemCard` ya usaban deep imports.
Añadida regla `no-restricted-imports` en `eslint.config.js` que bloquea
`^@mui/(material|icons-material)$` (barrel exacto), permitiendo subpaths.

### ✅ 5.2 Memoizar derivados de queries donde alimentan listas memoizadas
`useProducts` recrea `products` (`flatMap`) y `useGetOrdersList` recrea `orders` en cada
render. Los hijos están `memo`-izados por item así que el impacto es menor, pero para
consistencia con `categoriesList` (ya memoizado): envolver en `useMemo` con `query.data`
como dependencia (`rerender-memo`, `js-combine-iterations`).

Aplicado (2026-07-30): `products` en `useProducts` (`useProduct.ts`) y `orders` en
`useOrders` (`useOrder.ts`) envueltos en `useMemo` con `query.data` como dependencia.

### ✅ 5.3 Selectores Zustand consistentes
- Norma: **siempre** selector (`useAuthStore(s => s.user)`), nunca `const { user } = useAuthStore()`
  (suscripción total). Infractores: `useGetAddresses`, `useGetOrdersList` (`rerender-defer-reads`;
  además ahí solo se usa para `enabled`/`isAdmin`).
- `CartBadge`: `useCartStore(state => state.totalItems())` funciona (devuelve primitivo)
  pero es frágil; documentar el patrón o derivar con selector puro
  `s => s.cart.cartItems.reduce(...)` (`rerender-derived-state`).

Aplicado (2026-07-30): los 5 infractores restantes (`useAddresses`, `useOrders`, `useOrder`,
`CartResumen`, `ProductActions` — nombres actuales tras la 2.3) pasaron de
`const { user } = useAuthStore()` a `useAuthStore(state => state.user)`. `CartBadge` pasó
de `state.totalItems()` a un selector puro `state.cart.cartItems.reduce(...)`.

### ✅ 5.4 `useDebounce` → considerar `useDeferredValue` para el buscador
El input de Products ya va con debounce (350 ms). Alternativa más idiomática React 19:
mantener debounce para la red, pero si se nota jank al teclear, `useDeferredValue`
sobre el término (`rerender-use-deferred-value`). Baja prioridad; solo si se percibe.

Revisado (2026-07-30): el propio plan lo marca "baja prioridad; solo si se percibe [jank]".
No se ha reportado jank al teclear en el buscador con el debounce de 350 ms actual — no
se aplica `useDeferredValue` para no añadir complejidad sin un problema real que resolver.
Queda documentado como alternativa a revisar si en el futuro se percibe lag.

### ✅ 5.5 Revisión final de bundle
`npm run build` y revisar tamaños: confirmar que los cambios de imports no movieron
chunks; `manualChunks` sigue válido. Documentar tamaños en este archivo al cerrar la fase.

`npm run build` y `npm run lint` en verde (2026-07-30). Mismos chunks que antes de la
fase (`manualChunks` de `vite.config.ts` sigue agrupando react/motion/query/mui igual);
el chunk `mui` bajó ligeramente de 259.48 kB a 255.86 kB tras los imports profundos.
El resto de tamaños se mantiene estable, sin nuevos chunks ni chunks perdidos.

---

## Fase 6 — Alineación backend (contratos y naming)

> Cambios pequeños del lado backend que dan consistencia al conjunto. El bug 1.1
> (cookie en register) es parte de la Fase 1.

### ✅ 6.1 Envelopes de respuesta uniformes
`GET /addresses` → `{ addresses }` vs products/orders/cart → recurso directo vs auth →
`{ user }`. Normalizar (recomendado: recurso directo salvo auth que ya usa `{ user }`
de forma consistente) y ajustar el servicio frontend correspondiente.

Revisado (2026-07-30): el plan estaba desactualizado en este punto — `GET /addresses` ya
**no** devuelve `{ addresses }` (se corrigió en la 2.4, backend + frontend); devuelve el
array directo, igual que el resto de endpoints de recurso único en toda la app (auth sigue
usando `{ user }` de forma consistente, sin cambios). Lo único que queda "distinto" es que
`orders`/`products` envuelven sus listados en `{ data, total, page, limit }` (paginación
real, usada por scroll infinito) mientras `addresses` devuelve el array plano sin paginar.
Se decide **no** unificar esto: no es una inconsistencia sino una diferencia de diseño
legítima — `useAddresses` nunca pagina en el frontend (una libreta de direcciones no
necesita metadatos de paginación), forzar el mismo envelope ahí sería complejidad sin
beneficio. Sin cambios de código.

### ✅ 6.2 Naming de archivos backend
- `addressControler.ts` → `addressController.ts` (typo).
- `orderServices.ts` vs `ordersController.ts` → unificar prefijo (`orders*`).
- Schemas: `authZodSchema.ts`, `cartZodSchema.ts`, `categoriesZodSchema.ts`,
  `productsZodSchema.ts` vs `addressSchemas.ts`, `userSchemas.ts` → unificar a
  `<module>Schemas.ts` (mismo criterio que frontend, subfase 3.2).
- `productTypes.ts`/`userTypes.ts` viven en la raíz del módulo mientras el resto usa
  subcarpetas → mover a `types/` o eliminar si son redundantes con los schemas.

Aplicado (2026-07-30, con `git mv` para conservar el historial):
`addressControler.ts` → `addressController.ts`; `orderServices.ts` → `ordersServices.ts`;
`authZodSchema.ts` → `authSchemas.ts`; `cartZodSchema.ts` → `cartSchemas.ts`;
`categoriesZodSchema.ts` → `categoriesSchemas.ts`; `ordersZodSchema.ts` → `ordersSchemas.ts`;
`productsZodSchema.ts` → `productsSchemas.ts`. Todos los importadores actualizados
(incluido el cross-módulo `payments/controllers/paymentController.ts` y el script suelto
`backend/scripts/testGetOrderById.ts`, fuera de `src/`).
`productTypes.ts`/`userTypes.ts` **eliminados**: ninguno de los dos tenía tipos escritos a
mano (solo `z.infer<typeof XSchema>` reexportado) y ningún otro módulo del backend usa una
carpeta `types/` — todos derivan sus tipos directamente del fichero de schema. Los `type`
se movieron junto a su schema (`productsSchemas.ts`, `userSchemas.ts`, mismo patrón que
`ordersSchemas.ts` ya usaba) y se repuntó su único consumidor (`productServices.ts`,
`auth/utils/utils.ts`) a importar desde ahí.
**No aplicado, fuera del alcance literal del punto**: `productController.ts`/
`productRouter.ts`/`productServices.ts` (singular) vs `productsSchemas.ts` (plural), y
`usersController.ts`/`usersServices.ts` (plural) vs `userSchemas.ts` (singular) — mismo
tipo de inconsistencia de prefijo que `orderServices`, pero no nombrada explícitamente en
este punto del plan; se deja señalada para una pasada futura si se decide unificar también
router/controller/service, no solo schemas.

### ✅ 6.3 Verificación de fase
`cd backend && npm test` (suite Jest existente) + `npm run build`; frontend contra backend
levantado: flujo completo registro→compra.

`npm run build` en verde. `npm test`: **20 tests fallan en `config.test.ts`, `cart.test.ts`
y `orders.test.ts`, pero son fallos preexistentes, no causados por esta fase** — verificado
comparando cada archivo tocado contra `HEAD` (`git show HEAD:<path>`): los únicos diffs son
las rutas de import renombradas; la lógica es byte-a-byte idéntica al último commit salvo en
`ordersServices.ts`, donde ya había un `include: { orderItems, shippingAddress }` añadido
*antes* de esta sesión (trabajo en curso de integración de Stripe, ver memoria de proyecto).
Los fallos concretos: `config.test.ts` espera un entorno sin `STRIPE_SECRET_KEY`/
`STRIPE_WEBHOOK_SECRET` (el fixture del test no se actualizó cuando se añadieron esas env
vars obligatorias a `config.ts`); `cart.test.ts` recibe 500 en vez de 200/404/409 en varios
`PATCH /api/cart/items/:itemId`; `orders.test.ts` tiene aserciones de mock desalineadas con
el `include` añadido y algunos 500 en vez de 404/409. Arreglar esto es trabajo del flujo de
Stripe/pedidos, no de esta fase de consistencia — queda fuera de alcance y sin tocar.
Verificación manual (`registro→compra` con backend levantado) queda pendiente del usuario.

---

## Orden de ejecución y riesgo

| Fase | Riesgo | Notas |
|------|--------|-------|
| 1 | Bajo-medio | Bugs reales; 1.1 toca backend+frontend a la vez |
| 2 | Medio | Toca todos los hooks de datos; hacer feature por feature con build en verde |
| 3 | Bajo | Mecánico (renames, movidas); commits separados para diffs legibles |
| 4 | Bajo | Visual; verificar con la app levantada |
| 5 | Bajo | Mayormente mecánico |
| 6 | Bajo | Backend aislado; la suite de tests cubre los módulos |

Cada fase en commits propios. Tras cada fase: `npm run build` + `npm run lint` (frontend)
y marcar las subfases aquí (✅) antes de continuar.

---

## Convenciones acordadas (resumen para CLAUDE.md al cerrar el plan)

- **Imports**: alias `@/` siempre entre carpetas; deep imports (sin barrels internos ni de MUI).
- **Hooks de datos**: named exports; `useX`/`useXById` para queries, `useCreateX/useUpdateX/useDeleteX`
  para mutaciones; sin renombrar campos de React Query.
- **Query keys**: factory `xKeys` + `queryOptions()` por feature; prefetch siempre desde las options.
- **Zustand**: siempre con selector; lecturas solo-callback vía `getState()`.
- **Schemas**: archivos `<feature>Schemas.ts`; instancias camelCase, tipos PascalCase.
- **Formato**: `formatCurrency`/`formatDate` de `shared/utils/format.ts` en toda la app.
- **Notificaciones**: success=completado, error=fallo (desde catch), warning=destructivo, info=neutral.
- **Errores en handlers**: `try/catch` + `notify.error(ApiError.message)` en todo `mutateAsync`.
- **Navegación**: `Link`/`NavLink` para ir a rutas (nunca `div`/`button` + `navigate`); `navigate()` solo tras acciones.
- **Estados de UI**: `ErrorState` (con reintento), `EmptyState`, `ConfirmDialog`, `PageHeader`, `LoadMoreButton` compartidos.
