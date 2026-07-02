import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export type MenuLink = {
    to: string;
    label: string;
    Icon: typeof ReceiptLongIcon;
};

// Enlaces de la cuenta del usuario, compartidos entre el menú de escritorio
// (UserMenu) y el panel desplegable móvil (Navbar). Vive en su propio módulo
// para que los archivos de componentes solo exporten componentes (Fast Refresh).
export const ACCOUNT_LINKS: MenuLink[] = [
    { to: '/orders', label: 'Pedidos', Icon: ReceiptLongIcon },
    { to: '/account', label: 'Mis datos', Icon: PersonOutlineIcon },
    {
        to: '/account/addresses',
        label: 'Mis direcciones',
        Icon: LocationOnOutlinedIcon,
    },
];
