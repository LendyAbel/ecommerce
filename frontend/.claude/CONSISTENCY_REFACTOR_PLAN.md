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

### ⬜ 2.1 Query keys centralizadas por feature (factory + `queryOptions`)
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

### ⬜ 2.2 `useSyncCart`: no suscribirse a estado que solo usan callbacks
`const { cart } = useCartStore()` suscribe el hook (y a quien lo use: `Navbar` vía `useAuth`,
`Cart`…) a cada cambio del carrito solo para leerlo dentro de `mutationFn`
(`rerender-defer-reads`). Además el closure puede capturar un cart desactualizado.
- Leer dentro de la mutación: `useCartStore.getState().cart.cartItems`.
- Mantener solo `setCartItems` como suscripción (es una función estable).

### ⬜ 2.3 Unificar convención de hooks de datos
Conviven tres estilos: `useProducts` (default export, nombres `isProductsLoading`),
`useGetAddresses`/`useCreateAddress` (named, devuelven la query entera),
`useGetOrdersList` (named, objeto renombrado). Elegir **una** convención y aplicarla:
- Recomendada: named exports; queries `useProducts()`, `useProduct(id)`, `useOrders()`,
  `useOrder(id)`, `useAddresses()`; mutaciones `useCreateX/useUpdateX/useDeleteX`;
  devolver la query/mutación tal cual (sin renombrar campos) salvo datos derivados.
- Actualizar consumidores. Eliminar renombres tipo `isProductsLoading` → usar `isLoading`
  en el punto de uso.

### ⬜ 2.4 Unificar servicios API
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

### ⬜ 2.5 Verificación de fase
Build + lint + Network: un solo GET por recurso al navegar, prefetch en hover sigue
funcionando (Products → detalle instantáneo), invalidaciones correctas al crear/borrar.

---

## Fase 3 — Consistencia de escritura de código

### ⬜ 3.1 Política única de imports
Mezcla actual: `@/features/...` absolutos (products, auth, shared) vs relativos
`../api/...` (addresses, orders, checkout). Además, se importa a veces del barrel
(`@/features/auth`) y a veces deep (`@/features/auth/store/authStore`) para lo mismo.
- Regla propuesta (alineada con `bundle-barrel-imports`):
  1. Todo import cruzado usa alias `@/` (nunca `../`). Relativos solo dentro de la misma carpeta (`./`).
  2. Import **directo al módulo** (deep), no al barrel de la feature. Los `index.ts` de
     features quedan solo como documentación de API pública o se eliminan.
- Hacerlo cumplir con ESLint: `no-restricted-imports` (patrón `../*`) — ya está
  `simple-import-sort`; añadir la regla y pasar `--fix` + ajuste manual.

### ⬜ 3.2 Naming uniforme de schemas y tipos
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

### ⬜ 3.3 Formateadores compartidos (precio/fecha)
Tres formatos de precio conviven y **se ven distintos en pantalla**:
- `Cart.tsx` → `toLocaleString('es-ES', { currency: 'EUR' })`
- `ProductPrice.tsx` → `parseFloat(...).toFixed(2) + ' €'`
- `orders/utils/orderStatus.ts` → `Intl.NumberFormat` (el bueno: formatter a nivel de módulo,
  `js-hoist-regexp`/coste de `Intl.*` amortizado)

Crear `shared/utils/format.ts` con `formatCurrency`, `formatDate`, `formatDateTime`
(mover los de `orderStatus.ts`, dejar allí solo lo específico de estados de pedido) y
usarlo en Cart, ProductPrice, Step2/3, OrderRow, OrderItemsCard, etc. Un solo formato de
precio en toda la app.

### ⬜ 3.4 Reubicar utilidades mal colocadas
`shared/utils/utils.ts` mezcla estilos MUI (`sxInputStyle`, `sxButtonStyle`) con un hook
(`useDebounce`). Separar:
- `shared/hooks/useDebounce.ts`
- `shared/ui/muiStyles.ts` (o junto a los inputs que los usan)

### ⬜ 3.5 Convención de notificaciones
Mensajes inconsistentes: login exitoso → `notify.info`, dirección creada → `notify.success`,
vaciar carrito → `notify.warning`, producto eliminado → `notify.info`. Definir y aplicar:
- `success` = operación completada (login, registro, crear/editar/eliminar con éxito).
- `info` = neutral informativo. `warning` = acción destructiva reversible o aviso.
- `error` = fallo (siempre desde el catch, con mensaje de `ApiError`).

### ⬜ 3.6 Actualizar `CLAUDE.md` (raíz del repo)
La sección de arquitectura describe la estructura antigua (`src/store`, `src/services`,
`src/hooks`, ProtectedRoute "guards /cart") y omite los módulos cart/orders/addresses del
backend y las páginas orders/checkout/addresses. Reescribir el árbol de frontend
(feature-based) y backend, rutas actuales, y documentar las convenciones decididas en
este plan (imports, hooks, keys, notify, formatters).

### ⬜ 3.7 Verificación de fase
`npm run lint` sin errores con las reglas nuevas; `npm run build`; grep de `../` en imports
= 0 (fuera de mismos directorios); revisar que la UI muestra un único formato de precio.

---

## Fase 4 — Consistencia UI/UX

### ⬜ 4.1 Navegación semántica y accesible (un solo patrón)
Tres patrones conviven para "ir a una página": `ProductCard` = `motion.div onClick`
(**no enfocable, invisible para teclado y lectores**), `OrderRow` = `<button onClick=navigate>`
(enfocable pero sin semántica de enlace: no middle-click, no "abrir en pestaña"),
`Navbar`/`Home` = `NavLink` (correcto).
- Convertir `ProductCard` y `OrderRow` en `<Link to=...>` de react-router (envolver o usar
  el propio card como link con estilos actuales; motion se conserva con `motion(Link)` o
  wrapper). Mantener `onMouseEnter/onFocus` de prefetch.
- `CartBadge` → `<Link to='/cart'>` en lugar de `button + navigate`.

### ⬜ 4.2 Estados de error/vacío: usar siempre los componentes compartidos
`OrdersList` re-implementa a mano tanto el error (div idéntico a `ErrorState`) como el
vacío (div idéntico a `EmptyState`). Sustituir por `ErrorState`/`EmptyState` con acción
de reintento (`refetch`) como ya hace `AddressBook`. Revisar el resto de páginas para
que todo error de query tenga botón «Reintentar» (hoy solo addresses lo tiene).

### ⬜ 4.3 `ConfirmDialog` compartido + confirmación consistente
- `AddressBook` (eliminar dirección) y `OrderUserActions` (cancelar pedido) duplican el
  mismo modal de confirmación → extraer `shared/ui/ConfirmDialog.tsx`
  (props: `title`, `message`, `confirmLabel`, `variant='danger'`, `loading`, `onConfirm`, `onClose`).
- **Inconsistencia grave**: "Eliminar producto" (`ProductDetails`, acción admin destructiva)
  borra **sin confirmación** mientras direcciones y pedidos sí confirman. Añadir el
  `ConfirmDialog` ahí.

### ⬜ 4.4 UI muerta: implementar u ocultar
- `ProductActions`: botones "favoritos" y "compartir" no hacen nada. Ocultarlos hasta que
  exista la feature (o implementar compartir con `navigator.share`/copiar enlace, que es barato).
- `Login`: "¿Olvidaste tu contraseña?" es un `<p>` clickable sin acción ni ruta. Quitarlo
  o convertirlo en link real cuando exista el flujo.
- `ProductActions` usa clases `btn btn-primary` crudas → usar el componente `Button`
  compartido (consistencia con el resto de acciones).

### ⬜ 4.5 Metadatos del documento
`index.html`: `<title>frontend</title>`, `lang="en"`, favicon de Vite, sin meta description.
- `lang="es"`, título real de la tienda ("Voltora" según About), favicon propio, meta description.
- Título por página con React 19 (soporta `<title>` nativo en JSX): añadir en cada página
  `<title>Productos · Voltora</title>` etc. — barato y mejora historial/pestañas/SEO.

### ⬜ 4.6 Fuentes sin bloquear el render (`rendering-resource-hints`)
El `@import url(googleapis...)` al inicio de `index.css` bloquea el primer render y
encadena requests (CSS → CSS de fonts → woff2). Mover a `index.html`:
`<link rel="preconnect" href="https://fonts.googleapis.com|gstatic.com">` +
`<link rel="stylesheet" href=...>` (o self-host con `@fontsource`). Quitar el `@import`.

### ⬜ 4.7 Unificar patrón de cabecera de página y "Cargar más"
- `Orders`/`Address` tienen header h1+subtítulo; `Cart` solo h1; `Products` no tiene título.
  Extraer `PageHeader` (title, subtitle) y usarlo en las 4 (decidir si Products lleva título).
- Botón "Cargar más" duplicado en `Products` y `OrdersList` → extraer `LoadMoreButton`
  (recibe `hasNextPage`, `isFetchingNextPage`, `onClick`) o valorar infinite scroll con
  IntersectionObserver (`rendering-content-visibility` para listas largas si crecen).
- Skeletons: unificar ubicación (`components/skeletons/` en todas las features; addresses
  lo tiene en la raíz de components).

### ⬜ 4.8 Política de MUI vs design system propio (documentar y aplicar)
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

### ⬜ 4.9 Verificación de fase
Navegar toda la app solo con teclado (Tab/Enter): cards y filas alcanzables; abrir
producto/pedido en pestaña nueva con middle-click; axe DevTools sin errores críticos;
títulos de pestaña correctos; fuentes cargando sin FOIT largo (Network).

---

## Fase 5 — Pasada de rendimiento (guía Vercel)

### ⬜ 5.1 Deep imports de MUI en código propio (`bundle-barrel-imports`)
Los iconos ya usan deep imports, pero los componentes se importan del barrel:
`import { Dialog } from '@mui/material'`, `{ TextField, Select... }`, `{ IconButton, Tooltip }`.
Cambiar a `@mui/material/Dialog`, `@mui/material/TextField`, etc. (mejora tiempo de dev
server y aísla el coste real por componente). Añadir regla ESLint `no-restricted-imports`
para `@mui/material` y `@mui/icons-material` (solo paths profundos).

### ⬜ 5.2 Memoizar derivados de queries donde alimentan listas memoizadas
`useProducts` recrea `products` (`flatMap`) y `useGetOrdersList` recrea `orders` en cada
render. Los hijos están `memo`-izados por item así que el impacto es menor, pero para
consistencia con `categoriesList` (ya memoizado): envolver en `useMemo` con `query.data`
como dependencia (`rerender-memo`, `js-combine-iterations`).

### ⬜ 5.3 Selectores Zustand consistentes
- Norma: **siempre** selector (`useAuthStore(s => s.user)`), nunca `const { user } = useAuthStore()`
  (suscripción total). Infractores: `useGetAddresses`, `useGetOrdersList` (`rerender-defer-reads`;
  además ahí solo se usa para `enabled`/`isAdmin`).
- `CartBadge`: `useCartStore(state => state.totalItems())` funciona (devuelve primitivo)
  pero es frágil; documentar el patrón o derivar con selector puro
  `s => s.cart.cartItems.reduce(...)` (`rerender-derived-state`).

### ⬜ 5.4 `useDebounce` → considerar `useDeferredValue` para el buscador
El input de Products ya va con debounce (350 ms). Alternativa más idiomática React 19:
mantener debounce para la red, pero si se nota jank al teclear, `useDeferredValue`
sobre el término (`rerender-use-deferred-value`). Baja prioridad; solo si se percibe.

### ⬜ 5.5 Revisión final de bundle
`npm run build` y revisar tamaños: confirmar que los cambios de imports no movieron
chunks; `manualChunks` sigue válido. Documentar tamaños en este archivo al cerrar la fase.

---

## Fase 6 — Alineación backend (contratos y naming)

> Cambios pequeños del lado backend que dan consistencia al conjunto. El bug 1.1
> (cookie en register) es parte de la Fase 1.

### ⬜ 6.1 Envelopes de respuesta uniformes
`GET /addresses` → `{ addresses }` vs products/orders/cart → recurso directo vs auth →
`{ user }`. Normalizar (recomendado: recurso directo salvo auth que ya usa `{ user }`
de forma consistente) y ajustar el servicio frontend correspondiente.

### ⬜ 6.2 Naming de archivos backend
- `addressControler.ts` → `addressController.ts` (typo).
- `orderServices.ts` vs `ordersController.ts` → unificar prefijo (`orders*`).
- Schemas: `authZodSchema.ts`, `cartZodSchema.ts`, `categoriesZodSchema.ts`,
  `productsZodSchema.ts` vs `addressSchemas.ts`, `userSchemas.ts` → unificar a
  `<module>Schemas.ts` (mismo criterio que frontend, subfase 3.2).
- `productTypes.ts`/`userTypes.ts` viven en la raíz del módulo mientras el resto usa
  subcarpetas → mover a `types/` o eliminar si son redundantes con los schemas.

### ⬜ 6.3 Verificación de fase
`cd backend && npm test` (suite Jest existente) + `npm run build`; frontend contra backend
levantado: flujo completo registro→compra.

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
