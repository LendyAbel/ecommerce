import type {
    Address,
    AddressFormInput,
} from '@/features/addresses/schemas/addressSchemas';

/**
 * Dirección elegida en el wizard. Puede ser:
 * - `saved`: una dirección existente de la libreta del usuario.
 * - `new`: una dirección escrita en el momento. `save` indica si además se
 *   guardará en la libreta (al confirmar) o si es solo para esta orden.
 */
export type CheckoutAddress =
    | { kind: 'saved'; address: Address }
    | { kind: 'new'; values: AddressFormInput; save: boolean };

/** Campos de dirección "planos" para mostrar, vengan de donde vengan. */
export const toDisplayAddress = (ca: CheckoutAddress): AddressFormInput =>
    ca.kind === 'saved'
        ? {
              fullName: ca.address.fullName,
              phone: ca.address.phone ?? '',
              line1: ca.address.line1,
              line2: ca.address.line2 ?? '',
              city: ca.address.city,
              state: ca.address.state ?? '',
              postalCode: ca.address.postalCode,
              country: ca.address.country,
          }
        : ca.values;
