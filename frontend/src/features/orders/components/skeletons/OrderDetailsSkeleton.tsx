const OrderDetailsSkeleton = () => (
    <div className='flex flex-col gap-6'>
        {/* Cabecera */}
        <div className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
            <div className='flex items-start justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                    <div className='skeleton h-3 w-16' />
                    <div className='skeleton h-7 w-40' />
                </div>
                <div className='skeleton h-6 w-24 rounded-full' />
            </div>
            <div className='skeleton h-4 w-56' />
            <div className='skeleton h-8 w-32' />
        </div>

        {/* Línea de tiempo */}
        <div className='border-border bg-surface flex justify-between gap-2 rounded-2xl border p-6'>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex flex-col items-center gap-2'>
                    <div className='skeleton size-9 rounded-full' />
                    <div className='skeleton h-3 w-14' />
                </div>
            ))}
        </div>

        {/* Artículos */}
        <div className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
            <div className='skeleton h-5 w-28' />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center justify-between gap-4'>
                    <div className='flex flex-col gap-2'>
                        <div className='skeleton h-4 w-44' />
                        <div className='skeleton h-3 w-24' />
                    </div>
                    <div className='skeleton h-4 w-16' />
                </div>
            ))}
        </div>
    </div>
);

export default OrderDetailsSkeleton;
