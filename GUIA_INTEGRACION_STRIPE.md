# Guía práctica: integrar Stripe Checkout en un proyecto Node/Express + React

Esta guía documenta el patrón de integración de Stripe usado en este proyecto (backend Express + Prisma, frontend React + Vite), explicando el **por qué** de cada decisión, para poder replicarlo rápido en proyectos futuros. Usa **Stripe Checkout hospedado** (redirect a una página de Stripe), no Stripe Elements embebido — es el enfoque más rápido de implementar y el que menos superficie de PCI-compliance deja en tu servidor.

Referencia oficial: https://docs.stripe.com/checkout/quickstart y https://docs.stripe.com/webhooks

---

## 0. Decisión de arquitectura: Checkout redirect vs Elements

| | Checkout hospedado (este proyecto) | Stripe Elements embebido |
|---|---|---|
| Formulario de pago | Lo renderiza Stripe en su dominio | Lo renderizas tú con `@stripe/react-stripe-js` |
| Tiempo de implementación | Muy bajo (1 endpoint + 1 webhook) | Más alto (maneja `PaymentIntent`, confirmación client-side, 3DS) |
| PCI compliance | Mínima (nunca ves datos de tarjeta) | Mayor superficie, aunque Elements también tokeniza |
| Personalización visual | Limitada (branding básico) | Total |

**Por qué elegir el redirect por defecto**: para la mayoría de checkouts de e-commerce no vale la pena el esfuerzo extra de Elements. Empieza aquí; solo migra a Elements si necesitas checkout embebido sin salir de tu dominio.

> Nota de este proyecto: el frontend tiene instaladas `@stripe/stripe-js` y `@stripe/react-stripe-js` y una variable `VITE_STRIPE_PUBLISHABLE_KEY`, pero **no se usan** — son remanentes de una exploración de Elements descartada. Si replicas este proyecto como plantilla, no instales esos paquetes a menos que vayas a usar Elements.

---

## 1. Flujo end-to-end (mapa mental antes de programar)

```
1. Usuario confirma su pedido en tu app
      → creas una Order/Order interna en estado "pending"
2. Usuario pulsa "Pagar"
      → tu backend crea una Stripe Checkout Session (server-to-server)
      → guardas el sessionId en tu Order
      → devuelves { url } al frontend
3. Frontend hace window.location.href = url
      → el usuario paga en la página de Stripe (tú nunca ves la tarjeta)
4. Stripe redirige el navegador a tu success_url o cancel_url
      (esto es SOLO UX — nunca confirmes el pago aquí, es spoofeable)
5. En paralelo (servidor a servidor), Stripe llama a tu webhook
      con el evento checkout.session.completed
      → AQUÍ es donde confirmas el pago de verdad:
        marcas la Order como "paid", descuentas stock, etc.
6. Tu página de success hace polling a tu propio backend
      hasta que el estado de la Order deje de ser "pending"
```

**Por qué el webhook es la única fuente de verdad**: la `success_url` la controla el navegador del usuario, que puede cerrar la pestaña, perder conexión, o directamente visitar la URL manualmente sin haber pagado. El webhook es una llamada servidor-a-servidor autenticada con firma HMAC — es la única señal que no se puede falsificar.

---

## 2. Dependencias e inicialización

```bash
# backend
npm install stripe

# frontend — SOLO si vas a usar Stripe Elements. Para redirect simple no hace falta nada.
```

**`src/lib/stripe.ts`**
```ts
import Stripe from 'stripe';
import { config } from './config';

export const stripe: Stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-XX-XX', // fija la versión explícitamente (ver nota abajo)
});
```

**Por qué fijar `apiVersion`**: si no la pasas, el SDK usa la versión pinneada internamente en el paquete instalado, lo cual funciona, pero un `npm update` de `stripe` puede arrastrar cambios de API silenciosos. Fijarla explícitamente hace los upgrades intencionales. (Este proyecto no la fija todavía — es una mejora recomendada, no un requisito.)

---

## 3. Variables de entorno

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=eur          # opcional, con default razonable
FRONTEND_URL=http://localhost:5173   # para construir success_url/cancel_url
```

**Por qué validarlas con Zod al arrancar** (patrón usado en `src/lib/config.ts`):
```ts
STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
STRIPE_CURRENCY: z.string().length(3).default('eur'),
```
Fail-fast: si falta una env var de Stripe, el servidor no debe ni arrancar — es mejor que un 500 en producción a mitad de un checkout. Nunca leas `process.env.STRIPE_*` disperso por el código; consúmelo siempre a través de un objeto `config` tipado y centralizado.

`STRIPE_SECRET_KEY` **nunca** debe llegar al frontend. Si usas Elements, la clave pública (`pk_...`) sí es segura de exponer vía `VITE_STRIPE_PUBLISHABLE_KEY`.

---

## 4. Modelo de datos

Añade a tu modelo de orden:

```prisma
enum OrderStatus {
  pending
  paid
  shipped
  delivered
  cancelled
  refunded
}

model Order {
  id          String      @id @default(uuid())
  status      OrderStatus @default(pending)
  totalAmount Decimal     @db.Decimal(10, 2)

  stripeCheckoutSessionId String? @unique
  stripePaymentIntentId   String? @unique
  // ...resto de campos (items, dirección, usuario)
}
```

**Por qué `@unique` en los IDs de Stripe**: es una salvaguarda a nivel de base de datos contra reutilizar la misma Checkout Session o PaymentIntent en dos órdenes distintas — si un bug lo intentara, la DB lo rechaza en vez de corromper datos silenciosamente.

**Por qué un enum de estados y no un booleano `paid: boolean`**: necesitas distinguir `pending` (creada, no pagada), `paid`, y estados de fallo como `refunded` (pagó pero hubo que devolver el dinero, ver §7). Un booleano no modela esos casos intermedios.

> Nota Prisma + `searchVector` u otras columnas generadas: si tu schema tiene columnas `GENERATED` de Postgres, genera la migración con `--create-only` para poder revisar el SQL antes de aplicarlo (ver caveat en `CLAUDE.md` de este repo si aplica a tu proyecto).

---

## 5. Endpoint: crear la Checkout Session

**Guard previo — valida antes de llamar a Stripe** (`utils.ts`):
```ts
export const assertPayableOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { orderItems: { include: { product: true } } },
  });
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'pending')
    throw new AppError('Order is not payable in its current state', 409);

  for (const item of order.orderItems) {
    if (!item.product || item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${item.nameAtPurchase}"`, 409);
    }
  }
  return order;
};
```
**Por qué**: evita crear sesiones de pago para órdenes ajenas, ya pagadas, o sin stock. Es más barato fallar aquí (una query a tu DB) que dejar que el usuario pague y tener que reembolsar después.

**Servicio**:
```ts
const createCheckoutSession = async (
  orderId: string,
  userId: string,
  idempotencyKey?: string,
) => {
  const order = await assertPayableOrder(orderId, userId);

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: order.orderItems.map(item => ({
        price_data: {
          currency: config.STRIPE_CURRENCY,
          product_data: { name: item.nameAtPurchase },
          unit_amount: toCents(item.priceAtPurchase),
        },
        quantity: item.quantity,
      })),
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      success_url: `${config.FRONTEND_URL}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.FRONTEND_URL}/checkout/cancel?orderId=${order.id}`,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { id: session.id, url: session.url };
};
```

Decisiones clave, explicadas:

- **`price_data` inline vs Productos/Precios pre-creados en el dashboard de Stripe**: usa `price_data` inline cuando tus precios viven en tu propia base de datos y cambian por producto/promoción (típico e-commerce). Usa Productos/Precios de Stripe si vendes un catálogo fijo (ej. planes de suscripción) — te da reporting nativo en el dashboard de Stripe.
- **`unit_amount` en centavos**: Stripe siempre trabaja en la unidad mínima de la moneda. `toCents = (decimal) => Math.round(Number(decimal) * 100)`. Usa `Math.round`, no truncar, para evitar errores de redondeo de floating point.
- **`metadata: { orderId }` en la Session y también en `payment_intent_data.metadata`**: la metadata es el único puente entre "lo que pasa en Stripe" y "tu registro interno". Duplicarla en el PaymentIntent te permite recuperar el `orderId` incluso si en el webhook solo tienes el PaymentIntent (útil para eventos como `payment_intent.payment_failed` que no traen la Session).
- **`{CHECKOUT_SESSION_ID}` en `success_url`**: es un placeholder literal que Stripe sustituye por el ID real de la sesión al redirigir. Útil si luego quieres hacer una verificación adicional client-side (este proyecto no lo hace — ver §8, es una mejora posible).
- **Idempotency-Key**: pásala como segundo argumento de `stripe.checkout.sessions.create(params, { idempotencyKey })`, generada en el frontend (`crypto.randomUUID()`) y reenviada en un header custom. Evita crear dos sesiones (y cobrar dos veces) si el usuario hace doble clic o el request se reintenta por un fallo de red.
- **Guardar `stripeCheckoutSessionId` inmediatamente**, no esperar al webhook: así puedes reconciliar manualmente si algo falla antes de que llegue el webhook.

**Controller + ruta**:
```ts
export const createCheckoutSession = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { orderId } = OrderIdParamSchema.parse(req.params);
  const idempotencyKey = req.header('Idempotency-Key');

  const session = await paymentService.createCheckoutSession(orderId, userId, idempotencyKey);
  res.status(200).json(session);
};

// router (montado bajo middleware de autenticación)
router.post('/:orderId/checkout-session', paymentController.createCheckoutSession);
```

---

## 6. El webhook: la parte que más se rompe si no se sigue al pie de la letra

### 6.1 Body crudo (raw) ANTES de `express.json()`

```ts
// src/modules/payments/routers/webhookRouter.ts
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook,
);
```

```ts
// app.ts — orden de middlewares
app.use('/api/webhooks', webhookRouter);   // 1º: monta el webhook con su raw parser
app.use(express.json({ limit: '1mb' }));   // 2º: parser JSON global para el resto de rutas
app.use(cookieParser());
```

**Por qué el orden importa y por qué es el error #1 al integrar webhooks de Stripe**: `stripe.webhooks.constructEvent` necesita el **body exacto en bytes** tal como Stripe lo envió, para recalcular el HMAC y compararlo con la firma del header `stripe-signature`. Si `express.json()` ya parseó el body a un objeto JS, esos bytes originales se pierden y la verificación de firma falla siempre con "No signatures found matching the expected signature". Por eso el router del webhook se monta con `express.raw(...)` **antes** de registrar el `express.json()` global, y solo para esa ruta específica — el resto de tu API sigue usando JSON parseado normalmente.

### 6.2 Verificar la firma y despachar el evento

```ts
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    req.log?.warn({ err }, 'Stripe webhook signature verification failed');
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await paymentService.confirmOrderPayment({
        orderId,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent!.id,
        stripeCheckoutSessionId: session.id,
      });
    }
  }

  res.status(200).json({ received: true });
};
```

**Por qué escuchar `checkout.session.async_payment_succeeded` además de `checkout.session.completed`**: algunos métodos de pago (débitos bancarios, ciertos métodos locales) no confirman al instante — `checkout.session.completed` dispara cuando el checkout termina (puede quedar `payment_status: unpaid` en pagos asíncronos), y `async_payment_succeeded` confirma el cobro real más tarde. Si solo escuchas el primero, te arriesgas a marcar como pagadas órdenes que en realidad fallarán.

**Por qué responder siempre `200`** (incluso para eventos que ignoras): si respondes con error o timeout, Stripe reintenta el webhook con backoff durante días. Reservar códigos de error solo para "no pude verificar la firma" (400) evita reintentos infinitos por eventos que simplemente no te interesan.

**Por qué el `try/catch` de la firma es local y no delega al error handler global**: es un fallo de autenticación esperado (alguien mandando payloads falsos, o mal configurado el secret), no una excepción de tu lógica de negocio — se loguea como warning, no como error de aplicación.

### 6.3 Confirmar el pago de forma idempotente y atómica

```ts
const confirmOrderPayment = async (params: {
  orderId: string;
  stripePaymentIntentId: string;
  stripeCheckoutSessionId?: string;
}) => {
  try {
    const result = await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { orderItems: true },
      });
      // idempotencia: si ya no está "pending" (webhook duplicado), no hacer nada
      if (!order || order.status !== 'pending') return null;

      for (const item of order.orderItems) {
        if (!item.productId) continue;
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) throw new StockConflictError(order.id, item.productId);
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          stripePaymentIntentId: params.stripePaymentIntentId,
          ...(params.stripeCheckoutSessionId && {
            stripeCheckoutSessionId: params.stripeCheckoutSessionId,
          }),
        },
      });
    });
    return { ok: true as const, order: result };
  } catch (err) {
    if (err instanceof StockConflictError) {
      // la transacción ya hizo rollback: nadie quedó "paid" con stock insuficiente
      await stripe.refunds.create({ payment_intent: params.stripePaymentIntentId });
      await prisma.order.update({ where: { id: err.orderId }, data: { status: 'refunded' } });
      return { ok: false as const, reason: 'stock_conflict' as const };
    }
    throw err;
  }
};
```

Tres decisiones importantes, explicadas:

1. **Idempotencia por estado, no solo por `event.id`**: Stripe garantiza *al menos una* entrega de cada evento — puedes recibir el mismo webhook dos veces. Comprobar `order.status !== 'pending'` antes de procesar hace que reprocesar el mismo evento sea un no-op seguro. (Para mayor robustez, Stripe también recomienda guardar `event.id`s ya procesados en una tabla y descartar duplicados exactos — este proyecto se apoya solo en el estado de la orden, que cubre el caso práctico principal.)
2. **Descuento de stock atómico con `updateMany` + condición `gte`**: en vez de leer el stock y luego escribir (race condition clásica si dos pagos concurrentes decrementan el mismo producto), la condición `stock: { gte: quantity }` hace que la propia base de datos rechace el update si no alcanza — `count === 0` te dice si falló, todo en una sola operación atómica.
3. **Reembolso automático si el pago llegó pero ya no hay stock**: es el caso límite de "alguien pagó, pero el stock se agotó entre que creó la sesión y que Stripe confirmó el pago" (ej. dos usuarios comprando el último ítem a la vez). En vez de dejar la orden en un estado inconsistente, se reembolsa vía `stripe.refunds.create` y se marca `refunded`. Esta rama **vive fuera** de la transacción de Prisma porque el rollback de la DB ya ocurrió — el refund es una llamada externa que no participa en la transacción.

---

## 7. Frontend

### 7.1 Servicio + hook

```ts
// checkout.service.ts
const createCheckoutSession = async (orderId: string, idempotencyKey: string) => {
  const res = await apiClient.post<{ id: string; url: string }>(
    `/orders/${orderId}/checkout-session`,
    {},
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  return res.data;
};
```

```ts
// idempotency key generada una vez por orden y persistida en sessionStorage
// para sobrevivir si el usuario recarga la página antes de pagar
export const getOrCreateIdempotencyKey = (orderId: string) => {
  const key = `idem:${orderId}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
};
```

### 7.2 Redirect a Stripe

```ts
const handlePay = async () => {
  const { url } = await createCheckout.mutateAsync({ orderId: order.id, idempotencyKey });
  window.location.href = url;
};
```

**Por qué `window.location.href` y no `Stripe.js` / `redirectToCheckout`**: `redirectToCheckout` está deprecado por Stripe a favor de redirigir directamente a la `url` que ya devuelve `checkout.sessions.create`. Un simple redirect de navegador basta — no hace falta cargar `@stripe/stripe-js` en absoluto para este flujo.

### 7.3 Páginas Success / Cancel

**Success**: no confirma nada por sí misma — solo hace **polling** a tu propio backend hasta que el webhook (que llega en paralelo, server-to-server) actualice el estado:

```ts
const query = useQuery({
  queryFn: () => ordersService.fetchOrder(id),
  refetchInterval: query => (query.state.data?.status === 'pending' ? 2000 : false),
});
```

Muestra un spinner "Confirmando tu pago…" mientras `status === 'pending'`, y el resultado final (pagado / lo que sea) cuando cambia. **Por qué no confiar en la redirección misma**: como se explicó en §1, la `success_url` no es prueba de pago — solo el webhook lo es. El polling es el puente entre "el usuario ya volvió" y "el webhook ya llegó" (normalmente son milisegundos de diferencia, pero no hay garantía de orden).

**Cancel**: puramente informativa, con un botón para reintentar que vuelve a llamar a `createCheckoutSession` (reemplaza el `stripeCheckoutSessionId` de la orden, ya que las sesiones de Stripe expiran a las 24h).

### 7.4 Cuándo vaciar el carrito

En este proyecto, el carrito se vacía **al crear la Order en `pending`** (antes de llegar a Stripe), no en el webhook ni en la página de éxito — tanto en el backend (dentro de la misma transacción que crea la orden) como en el store del frontend (`onSuccess` de la mutación `createOrder`).

**Por qué esa decisión y no vaciar el carrito solo cuando se confirma el pago**: una vez que existe una `Order pending` con los ítems y el stock reservado lógicamente, dejarlos también en el carrito permitiría al usuario "comprarlos dos veces" en paralelo (una vez como orden pendiente, otra vez agregando de nuevo al carrito). Si tu app permite cancelar una orden `pending` y reponerla al carrito automáticamente, esa es la alternativa — pero añade complejidad. Evalúalo según tu UX; ambas son válidas, documenta la que elijas.

---

## 8. Probar localmente con Stripe CLI

```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Esto imprime un `whsec_...` **distinto** al de producción — úsalo como `STRIPE_WEBHOOK_SECRET` en tu `.env` local. En producción, genera el secret real desde el Dashboard → Developers → Webhooks → tu endpoint.

Para disparar un evento sin pagar de verdad:
```bash
stripe trigger checkout.session.completed
```

Tarjetas de prueba útiles: `4242 4242 4242 4242` (éxito), `4000 0000 0000 9995` (fondos insuficientes), cualquier fecha futura y CVC de 3 dígitos.

---

## 9. Checklist antes de ir a producción

- [ ] `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` son las claves **live**, no `test`, y viven solo en variables de entorno del servidor (nunca en el repo).
- [ ] El endpoint de webhook está registrado en el Dashboard de Stripe apuntando a tu dominio real (`https://tu-dominio.com/api/webhooks/stripe`), con **su propio** `whsec_...` (distinto al de `stripe listen`).
- [ ] El webhook responde `200` rápido (idealmente <5s) — no hagas trabajo pesado síncrono ahí; si necesitas procesos largos, encola un job y responde `200` de inmediato.
- [ ] `express.raw()` sigue montado **antes** de `express.json()` para la ruta del webhook (fácil de romper sin querer al reordenar middlewares).
- [ ] Los campos `stripeCheckoutSessionId` / `stripePaymentIntentId` tienen constraint `@unique` en la DB.
- [ ] Confirmaste que `apiVersion` está fijada explícitamente en la inicialización del cliente.
- [ ] Manejas al menos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, y decidiste si necesitas `checkout.session.expired` (limpiar `pending` viejas) o `charge.refunded`.
- [ ] Tienes un plan para reconciliación manual (ej. un script/endpoint admin que re-consulte una Session/PaymentIntent en Stripe si un webhook se perdiera).

---

## 10. Errores comunes (troubleshooting)

| Síntoma | Causa típica |
|---|---|
| `Webhook Error: No signatures found matching...` | `express.json()` corrió antes que `express.raw()` para esa ruta, o estás reenviando el body ya serializado/reparseado. |
| El webhook nunca llega en local | Falta `stripe listen --forward-to ...` corriendo, o el `whsec_` en `.env` no es el que imprime la CLI. |
| Orden se queda en `pending` para siempre | El webhook falló silenciosamente (revisa logs / Dashboard → Developers → Webhooks → tu endpoint → intentos), o el `metadata.orderId` no se está seteando al crear la sesión. |
| Doble cobro en doble clic | Falta la `Idempotency-Key` en la creación de la Checkout Session. |
| Se vendió stock que no existía | Falta el update atómico con condición `gte` — dos webhooks concurrentes decrementando con read-then-write clásico. |

---

## Referencias oficiales

- Checkout Quickstart: https://docs.stripe.com/checkout/quickstart
- Webhooks: https://docs.stripe.com/webhooks
- Verificar firmas: https://docs.stripe.com/webhooks/signatures
- Idempotent requests: https://docs.stripe.com/api/idempotent_requests
- Stripe CLI: https://docs.stripe.com/stripe-cli
- Tarjetas de prueba: https://docs.stripe.com/testing
