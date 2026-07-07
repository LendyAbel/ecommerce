# Tareas Pendientes

Notas rápidas de cosas por hacer que surgen mientras trabajo en otra parte del código.

> Formato: cada tarea con un checkbox. Al completarla, marcar `[x]`. Indicar el componente/módulo afectado entre `()`.

## Pendientes

- [ ] _(ejemplo)_ Revisar algo en otro componente

- [ ] _(orders / pago / stock)_ Al implementar el pago, revisar el stock existente antes de cobrar y, si hay suficiente, descontarlo. Se quitó el descuento de stock de la creación de la orden (`createOrder` en `orderServices.ts`); ahora la orden se crea sin tocar el stock. El descuento debe hacerse en el flujo de pago: verificar que cada producto tiene stock disponible y, solo si es suficiente, descontar la cantidad comprada (idealmente dentro de una transacción junto con el cobro).

## Completadas

- `[x]` _(products / detalle de producto)_ Implementar un botón en la página de detalles de un producto para volver a la lista de productos.
- `[x]` _(notificaciones / hooks / stores)_ Mover las notificaciones del hook o del store al componente, para que no se lancen donde no deben. Ejemplo: al hacer logout también se vacía el carrito, lo que dispara la notificación de "carrito vaciado" que no debería mostrarse en ese caso.
- `[x]` _(cart / hooks / stores)_ Persistir el carrito en el backend durante la sesión logueada. **Bug actual:** al añadir productos y pulsar F5 estando logueado, el carrito se borra. Causa: `addItem`/`updateItem`/`removeItem` (`cartStore`) solo mutan el store local; mientras navegas logueado nunca llegan al backend (solo se sincroniza en login/register/logout). En F5, `useAuth` (al tener éxito `me`) llama a `fetchFromBackendAsync()` → `setCartItems(serverCart)` y machaca el carrito local rehidratado con el del servidor, que está vacío. No vale cambiar `me` a `syncWithBackendAsync` porque el backend `addItem` hace `increment` → duplicaría cantidades en cada refresh. **Fix:** capa `useCart` que envuelva las acciones del store: invitado = solo local (como ahora); logueado = llamar a `cartService.addItem/updateItem/removeItem` y refrescar el store con la respuesta del backend. Conectar `ProductActions.tsx` y `pages/Cart.tsx` a esa capa.
- `[x]` _(products / detalle de producto)_ Añadir confirmación de borrado al eliminar un producto. Ahora `ProductDetails.tsx` borra directo sin confirmar; replicar el modal de confirmación de `AddressBook.tsx` (Modal + botón `danger` + estado de carga).
- `[x]` _(products / schemas / types)_ Juntar los tipos de product dentro de su schema. Mover los `z.infer` de `types/productTypes.ts` al propio `schemas/productZodSchema.ts` (co-localizar el tipo inferido junto a su schema), y dejar `types/` solo para los tipos tipados a mano que no derivan de Zod. Aplicar el mismo criterio al resto de features (cart, orders).
    <!-- Mover aquí las tareas terminadas -->
