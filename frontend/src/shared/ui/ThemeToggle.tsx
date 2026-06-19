import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeStore } from '@/shared/store/themeStore';

type Props = {
    className?: string;
};

const ThemeToggle = ({ className = '' }: Props) => {
    const theme = useThemeStore(state => state.theme);
    const toggleTheme = useThemeStore(state => state.toggleTheme);
    const isDark = theme === 'dark';

    return (
        <button
            type='button'
            onClick={toggleTheme}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className={`text-text-60 hover:text-text flex cursor-pointer items-center transition-colors duration-200 ${className}`}
        >
            {isDark ? (
                <LightModeIcon fontSize='small' />
            ) : (
                <DarkModeIcon fontSize='small' />
            )}
        </button>
    );
};

export default ThemeToggle;
