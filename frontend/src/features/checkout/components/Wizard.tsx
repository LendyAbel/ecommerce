import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import {
    type AddressFormInput,
    useCreateAddress,
    useGetAddresses,
} from '@/features/addresses';
import { useCartStore } from '@/features/cart';
import { type Order, useCreateOrder, useGetOrderDetails } from '@/features/orders';
import { ApiError } from '@/lib/api/client';
import { EmptyState } from '@/shared/components';
import { notify } from '@/shared/store/alertStore';
import { Button, Spinner } from '@/shared/ui';

import type { CheckoutAddress } from '../types/checkoutTypes';
import CheckoutStepperLine from './CheckoutStepperLine';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

const Wizard = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const resumeOrderId = params.get('orderId') ?? '';

    const [step, setStep] = useState(1);
    const [shipping, setShipping] = useState<CheckoutAddress | null>(null);
    const [billingSame, setBillingSame] = useState(true);
    const [billing, setBilling] = useState<CheckoutAddress | null>(null);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

    const { data: addresses = [], isLoading: addressesLoading } =
        useGetAddresses();
    const createAddress = useCreateAddress();
    const createOrder = useCreateOrder();

    const cartItems = useCartStore(state => state.cart.cartItems);

    // Modo «reanudar»: se entra con ?orderId=... desde una orden pendiente. Se
    // carga la orden y se salta directo al paso 3 (sin pasar por 1 y 2).
    const { order: resumedOrder } = useGetOrderDetails(resumeOrderId);
    const isResuming = !!resumeOrderId;

    // Orden a mostrar en el paso 3: la recién creada o la reanudada.
    const activeOrder = createdOrder ?? resumedOrder ?? null;
    // Al reanudar siempre estamos en el paso 3; si no, manda la navegación.
    const currentStep = isResuming ? 3 : step;

    const step1Valid = !!shipping && (billingSame || !!billing);

    // Resuelve una dirección elegida a la referencia que espera el backend:
    // id de la libreta (guardándola antes si el usuario lo pidió) o inline.
    const buildAddressRef = async (
        ca: CheckoutAddress,
    ): Promise<{ id?: string; inline?: AddressFormInput }> => {
        if (ca.kind === 'saved') return { id: ca.address.id };
        if (ca.save) {
            const created = await createAddress.mutateAsync(ca.values);
            return { id: created.id };
        }
        return { inline: ca.values };
    };

    const handleConfirm = async () => {
        if (!shipping) return;
        try {
            const ship = await buildAddressRef(shipping);
            const bill =
                billingSame || !billing ? null : await buildAddressRef(billing);

            const order = await createOrder.mutateAsync({
                shippingAddressId: ship.id,
                shippingAddress: ship.inline,
                ...(bill && {
                    billingAddressId: bill.id,
                    billingAddress: bill.inline,
                }),
            });
            setCreatedOrder(order);
            setStep(3);
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo crear el pedido. Inténtalo de nuevo.',
            );
        }
    };

    // Carga inicial al reanudar una orden existente.
    if (isResuming && !activeOrder) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner
                    className='text-primary size-10'
                    label='Cargando pedido'
                />
            </div>
        );
    }

    // Carrito vacío fuera del modo reanudar: no hay nada que comprar.
    if (!isResuming && cartItems.length === 0 && currentStep < 3) {
        return (
            <EmptyState
                icon={<ShoppingCartOutlinedIcon sx={{ fontSize: 48 }} />}
                title='Tu carrito está vacío'
                message='Añade productos antes de pasar por caja.'
                action={
                    <Button onClick={() => navigate('/products')}>
                        Ver productos
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            <CheckoutStepperLine step={currentStep} />

            <div className='mt-6 mb-6'>
                {currentStep === 1 && (
                    <Step1
                        addresses={addresses}
                        isLoading={addressesLoading}
                        shipping={shipping}
                        onShippingChange={setShipping}
                        billingSame={billingSame}
                        onBillingSameChange={setBillingSame}
                        billing={billing}
                        onBillingChange={setBilling}
                    />
                )}
                {currentStep === 2 && shipping && (
                    <Step2
                        shipping={shipping}
                        billingSame={billingSame}
                        billing={billing}
                    />
                )}
                {currentStep === 3 && activeOrder && (
                    <Step3 order={activeOrder} />
                )}
            </div>

            {/* Navegación: el paso 3 es terminal y gestiona sus propias acciones. */}
            {currentStep < 3 && (
                <div className='flex justify-between'>
                    <Button
                        variant='outline'
                        onClick={() => setStep(prev => prev - 1)}
                        disabled={currentStep === 1}
                    >
                        Anterior
                    </Button>
                    {currentStep === 1 ? (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!step1Valid}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConfirm}
                            loading={
                                createOrder.isPending || createAddress.isPending
                            }
                        >
                            Confirmar pedido
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Wizard;
