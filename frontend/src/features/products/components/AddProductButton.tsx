import Add from '@mui/icons-material/Add';

interface AddProductButtonProps {
    onClick: () => void;
}

const AddProductButton = ({ onClick }: AddProductButtonProps) => {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label='Añadir nuevo producto'
            className='bg-primary hover:bg-primary-hover fixed right-6 bottom-6 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-(--shadow-primary) transition-all duration-200 hover:shadow-lg active:scale-95'
        >
            <Add fontSize='small' />
            Nuevo
        </button>
    );
};

export default AddProductButton;
