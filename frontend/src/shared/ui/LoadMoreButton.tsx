import Button from './Button';

type LoadMoreButtonProps = {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onClick: () => void;
};

const LoadMoreButton = ({
    hasNextPage,
    isFetchingNextPage,
    onClick,
}: LoadMoreButtonProps) => {
    return (
        <>
            {hasNextPage && (
                <div className='mt-8 flex justify-center'>
                    <Button
                        variant='outline'
                        loading={isFetchingNextPage}
                        onClick={onClick}
                    >
                        Cargar más
                    </Button>
                </div>
            )}
        </>
    );
};

export default LoadMoreButton;
