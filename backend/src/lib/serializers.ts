// Prisma devuelve los campos Decimal como objetos Decimal, que se serializan a
// string en JSON. Estos helpers los convierten a number para mantener el
// contrato de la API (precio numérico) en las respuestas.

type WithPrice = { price: unknown };
type CartLike = { cartItems: { product: WithPrice }[] };

export const serializeProduct = <T extends WithPrice>(product: T) => ({
    ...product,
    price: Number(product.price),
});

export const serializeCart = <T extends CartLike>(cart: T) => ({
    ...cart,
    cartItems: cart.cartItems.map(item => ({
        ...item,
        product: serializeProduct(item.product),
    })),
});
