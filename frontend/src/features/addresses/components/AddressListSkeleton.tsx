const AddressCardSkeleton = () => (
    <div className='border-border bg-surface flex flex-col gap-2 rounded-2xl border p-6'>
        <div className='skeleton h-4 w-32' />
        <div className='skeleton h-3 w-44' />
        <div className='skeleton h-3 w-36' />
        <div className='skeleton h-3 w-24' />
        <div className='border-border mt-4 flex gap-2 border-t pt-4'>
            <div className='skeleton h-8 w-20 rounded-full' />
            <div className='skeleton h-8 w-20 rounded-full' />
        </div>
    </div>
);

type AddressListSkeletonProps = {
    /** Número de tarjetas fantasma a mostrar. */
    cards?: number;
};

const AddressListSkeleton = ({ cards = 4 }: AddressListSkeletonProps) => (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {Array.from({ length: cards }).map((_, i) => (
            <AddressCardSkeleton key={i} />
        ))}
    </div>
);

export default AddressListSkeleton;
