const WishItemCardSkeleton = () => (
    <div className='border-border bg-surface flex items-center gap-4 rounded-2xl border p-4'>
        <div className='skeleton size-20 shrink-0 rounded-xl' />
        <div className='flex flex-1 flex-col gap-2'>
            <div className='skeleton h-4 w-40' />
            <div className='skeleton h-3 w-20' />
        </div>
    </div>
);

type WishListSkeletonProps = {
    /** Número de tarjetas fantasma a mostrar. */
    rows?: number;
};

const WishListSkeleton = ({ rows = 4 }: WishListSkeletonProps) => (
    <div className='flex flex-col gap-3'>
        {Array.from({ length: rows }).map((_, i) => (
            <WishItemCardSkeleton key={i} />
        ))}
    </div>
);

export default WishListSkeleton;
