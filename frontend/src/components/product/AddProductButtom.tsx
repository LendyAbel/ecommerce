import { Add } from '@mui/icons-material';

interface AddProductButtonProps {
    onClick: () => void;
}

const AddProductButton = ({ onClick }: AddProductButtonProps) => {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label='Añadir nuevo producto'
            className='fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-(--shadow-primary) transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:scale-95'
        >
            <Add fontSize='small' />
            Nuevo
        </button>
    );
};

export default AddProductButton;
