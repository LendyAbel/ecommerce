import type { Address } from '@/features/addresses/schemas/addressSchemas';
import { Spinner } from '@/shared/ui';
import type { CheckoutAddress } from '../types/checkoutTypes';
import AddressPicker from './AddressPicker';

type Step1Props = {
    addresses: Address[];
    isLoading: boolean;
    shipping: CheckoutAddress | null;
    onShippingChange: (value: CheckoutAddress) => void;
    billingSame: boolean;
    onBillingSameChange: (value: boolean) => void;
    billing: CheckoutAddress | null;
    onBillingChange: (value: CheckoutAddress) => void;
};

const Step1 = ({
    addresses,
    isLoading,
    shipping,
    onShippingChange,
    billingSame,
    onBillingSameChange,
    billing,
    onBillingChange,
}: Step1Props) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-10'>
                <Spinner className='text-primary size-8' label='Cargando direcciones' />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-8'>
            <section className='flex flex-col gap-3'>
                <h2 className='text-text font-display text-lg font-bold'>
                    Dirección de envío
                </h2>
                <AddressPicker
                    addresses={addresses}
                    value={shipping}
                    onChange={onShippingChange}
                />
            </section>

            <label className='text-text flex cursor-pointer items-center gap-2 text-sm font-medium'>
                <input
                    type='checkbox'
                    className='accent-primary size-4'
                    checked={billingSame}
                    onChange={e => onBillingSameChange(e.target.checked)}
                />
                La dirección de facturación es la misma que la de envío
            </label>

            {!billingSame && (
                <section className='flex flex-col gap-3'>
                    <h2 className='text-text font-display text-lg font-bold'>
                        Dirección de facturación
                    </h2>
                    <AddressPicker
                        addresses={addresses}
                        value={billing}
                        onChange={onBillingChange}
                    />
                </section>
            )}
        </div>
    );
};

export default Step1;
