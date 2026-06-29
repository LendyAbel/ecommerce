# Tareas Pendientes

Notas rápidas de cosas por hacer que surgen mientras trabajo en otra parte del código.

> Formato: cada tarea con un checkbox. Al completarla, marcar `[x]`. Indicar el componente/módulo afectado entre `()`.

## Pendientes

- [ ] _(ejemplo)_ Revisar algo en otro componente
- [ ] _(notificaciones / hooks / stores)_ Mover las notificaciones del hook o del store al componente, para que no se lancen donde no deben. Ejemplo: al hacer logout también se vacía el carrito, lo que dispara la notificación de "carrito vaciado" que no debería mostrarse en ese caso.
- [ ] _(products / schemas / types)_ Juntar los tipos de product dentro de su schema. Mover los `z.infer` de `types/productTypes.ts` al propio `schemas/productZodSchema.ts` (co-localizar el tipo inferido junto a su schema), y dejar `types/` solo para los tipos tipados a mano que no derivan de Zod. Aplicar el mismo criterio al resto de features (cart, orders).
- [ ] _(products / detalle de producto)_ Añadir confirmación de borrado al eliminar un producto. Ahora `ProductDetails.tsx` borra directo sin confirmar; replicar el modal de confirmación de `AddressBook.tsx` (Modal + botón `danger` + estado de carga).

## Completadas

- `[x]` _(products / detalle de producto)_ Implementar un botón en la página de detalles de un producto para volver a la lista de productos.
<!-- Mover aquí las tareas terminadas -->
