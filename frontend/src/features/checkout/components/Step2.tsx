import { useCartStore } from '@/features/cart/store/cartStore';
import type { CheckoutAddress } from '@/features/checkout/types/checkoutTypes';
import { toDisplayAddress } from '@/features/checkout/types/checkoutTypes';
import { formatCurrency } from '@/shared/utils/format';

type Step2Props = {
    shipping: CheckoutAddress;
    billingSame: boolean;
    billing: CheckoutAddress | null;
};

const AddressSummary = ({
    title,
    address,
}: {
    title: string;
    address: CheckoutAddress;
}) => {
    const a = toDisplayAddress(address);
    return (
        <div className='border-border bg-surface flex flex-col gap-1 rounded-2xl border p-5'>
            <span className='text-text-38 text-xs font-semibold tracking-wide uppercase'>
                {title}
            </span>
            <p className='text-text font-semibold'>{a.fullName}</p>
            <address className='text-text-60 text-sm not-italic'>
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.postalCode} {a.city}
                {a.state && <>, {a.state}</>}
                <br />
                {a.country}
            </address>
            {a.phone && (
                <p className='text-text-60 mt-1 text-sm'>Tel. {a.phone}</p>
            )}
        </div>
    );
};

const Step2 = ({ shipping, billingSame, billing }: Step2Props) => {
    const cart = useCartStore(state => state.cart);
    const totalPrice = useCartStore(state => state.totalPrice);
    const items = cart.cartItems;

    return (
        <div className='flex flex-col gap-6'>
            <section className='grid gap-4 sm:grid-cols-2'>
                <AddressSummary title='Dirección de envío' address={shipping} />
                <AddressSummary
                    title='Dirección de facturación'
                    address={billingSame ? shipping : billing!}
                />
            </section>

            <section className='border-border bg-surface flex flex-col rounded-2xl border'>
                <div className='flex items-center justify-between p-6 pb-4'>
                    <h2 className='text-text font-display text-lg font-bold'>
                        Tu pedido
                    </h2>
                    <span className='text-text-60 text-sm'>
                        {items.length}{' '}
                        {items.length === 1 ? 'artículo' : 'artículos'}
                    </span>
                </div>

                <ul className='divide-border divide-y'>
                    {items.map(({ product, quantity }) => (
                        <li
                            key={product.id}
                            className='flex items-center justify-between gap-4 px-6 py-4'
                        >
                            <div className='flex min-w-0 flex-col'>
                                <span className='text-text truncate font-medium'>
                                    {product.name}
                                </span>
                                <span className='text-text-38 text-sm'>
                                    {quantity} × {formatCurrency(product.price)}
                                </span>
                            </div>
                            <span className='text-text shrink-0 font-semibold'>
                                {formatCurrency(product.price * quantity)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className='border-border flex items-center justify-between border-t px-6 py-5'>
                    <span className='text-text font-display text-base font-bold'>
                        Total
                    </span>
                    <span className='text-text font-display text-2xl font-extrabold'>
                        {formatCurrency(totalPrice())}
                    </span>
                </div>
            </section>
        </div>
    );
};

export default Step2;
