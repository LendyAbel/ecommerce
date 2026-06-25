const OrderRowSkeleton = () => (
    <div className='border-border bg-surface flex items-center gap-4 rounded-2xl border p-4 sm:p-5'>
        <div className='flex flex-col gap-2'>
            <div className='skeleton h-4 w-28' />
            <div className='skeleton h-3 w-20' />
        </div>
        <div className='ml-auto flex items-center gap-4'>
            <div className='skeleton hidden h-5 w-16 sm:block' />
            <div className='skeleton h-5 w-20 rounded-full' />
        </div>
    </div>
);

type OrdersListSkeletonProps = {
    /** Número de filas fantasma a mostrar. */
    rows?: number;
};

const OrdersListSkeleton = ({ rows = 5 }: OrdersListSkeletonProps) => (
    <div className='flex flex-col gap-3'>
        {Array.from({ length: rows }).map((_, i) => (
            <OrderRowSkeleton key={i} />
        ))}
    </div>
);

export default OrdersListSkeleton;
