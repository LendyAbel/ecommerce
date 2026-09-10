/**
 * Traduce los mensajes de error en inglés que devuelve el backend (`AppError`,
 * Zod, Prisma…) a mensajes en español para mostrar en la interfaz.
 *
 * Se mantiene como un mapeo explícito en vez de una librería de i18n porque
 * el set de mensajes del backend es pequeño y cerrado (ver `errorHandler.ts`
 * y los distintos `services`/`schemas` del backend).
 */

const EXACT_MESSAGES: Record<string, string> = {
    // Genéricos / errorHandler
    'Validation error': 'Error de validación',
    'Already exists': 'Ya existe un registro con estos datos',
    'Record not found': 'Registro no encontrado',
    'Related record not found': 'Registro relacionado no encontrado',
    'Invalid data': 'Datos inválidos',
    'Database error': 'Error de base de datos',
    'Internal server error': 'Error interno del servidor',
    'Invalid parameter': 'Parámetro inválido',

    // Auth
    'Invalid credentials': 'Credenciales incorrectas',
    'User not found': 'Usuario no encontrado',
    'Current password is incorrect': 'La contraseña actual es incorrecta',
    'Authentication required': 'Debes iniciar sesión',
    'Invalid or expired token': 'Sesión inválida o expirada',
    Unauthorized: 'No tienes permisos para realizar esta acción',

    // Zod: auth schemas
    'Name is required': 'El nombre es obligatorio',
    'Invalid email': 'Correo electrónico inválido',
    'Password must be at least 8 characters':
        'La contraseña debe tener al menos 8 caracteres',
    'Password is required': 'La contraseña es obligatoria',
    'Current password is required': 'La contraseña actual es obligatoria',

    // Direcciones
    'Address not found': 'Dirección no encontrada',

    // Productos / categorías / wishlist
    'Product not found': 'Producto no encontrado',
    'Product ID is required': 'Se requiere el ID del producto',
    'Category name is required': 'El nombre de la categoría es obligatorio',
    'Category not found': 'Categoría no encontrada',
    'Item not found': 'Elemento no encontrado',
    'SKU is required': 'El SKU es obligatorio',
    'Short description is required': 'La descripción corta es obligatoria',
    'Tax must be a positive number': 'El impuesto debe ser un número positivo',
    'Stock must be a positive number': 'El stock debe ser un número positivo',

    // Carrito
    'Not enough stock': 'No hay suficiente stock',
    'Cart not found': 'Carrito no encontrado',
    'Cart is empty': 'El carrito está vacío',

    // Pedidos / pagos
    'Order not found': 'Pedido no encontrado',
    'Order is not payable in its current state':
        'El pedido no se puede pagar en su estado actual',
    'Only pending orders can be cancelled':
        'Solo se pueden cancelar pedidos pendientes',
};

/** Mensajes con datos interpolados (nombre de producto, etc.). */
const PATTERN_MESSAGES: { pattern: RegExp; translate: (m: RegExpMatchArray) => string }[] = [
    {
        pattern: /^Insufficient stock for "(.+)"$/,
        translate: m => `Stock insuficiente para "${m[1]}"`,
    },
    {
        pattern: /^Not enough stock for (.+)$/,
        translate: m => `No hay suficiente stock para ${m[1]}`,
    },
];

/** Traduce un mensaje del backend a español; si no lo reconoce, lo devuelve tal cual. */
export const translateApiMessage = (message: string): string => {
    const exact = EXACT_MESSAGES[message];
    if (exact) return exact;

    for (const { pattern, translate } of PATTERN_MESSAGES) {
        const match = message.match(pattern);
        if (match) return translate(match);
    }

    return message;
};
