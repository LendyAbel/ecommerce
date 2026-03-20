import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';

interface AddProductButtonProps {
    onClick: () => void;
}

const AddProductButton = ({ onClick }: AddProductButtonProps) => {
    return (
        <Fab
            sx={{ position: 'absolute' }}
            className='item-center top-2.5 left-2.5 flex flex-col justify-center'
            color='primary'
            aria-label='add'
            onClick={onClick}
        >
            <Add /> NEW
        </Fab>
    );
};

export default AddProductButton;
