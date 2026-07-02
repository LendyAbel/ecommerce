import { motion } from 'motion/react';
import React from 'react';

type SlicePanelProps = {
    showLogin: boolean;
    setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

const SlicePanel = ({ showLogin, setShowLogin }: SlicePanelProps) => {
    return (
        <motion.div
            className='absolute top-0 left-0 z-20 flex h-full w-1/2 flex-col items-center justify-center gap-6 px-12 text-center'
            style={{
                background:
                    'linear-gradient(160deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            }}
            animate={{
                x: showLogin ? '100%' : '0%',
                borderRadius: showLogin ? '0 16px 16px 0' : '16px 0 0 16px',
                boxShadow: showLogin
                    ? '-8px 0 32px rgba(61,111,232,0.25)'
                    : '8px 0 32px rgba(61,111,232,0.25)',
            }}
            transition={{
                duration: 0.7,
                ease: [0.77, 0, 0.175, 1],
                borderRadius: { duration: 0.3 },
            }}
        >
            {/* Patrón geométrico decorativo */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-10'
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className='absolute rounded-full border border-white'
                        style={{
                            width: 80 + i * 60,
                            height: 80 + i * 60,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                ))}
            </div>

            <div className='relative z-10'>
                <p className='text-xs font-semibold tracking-[0.3em] text-white/80 uppercase'>
                    {showLogin ? '¿Nuevo aquí?' : '¿Ya tienes cuenta?'}
                </p>
                <h2 className='font-display mt-2 text-3xl font-bold tracking-[-0.02em] text-white'>
                    {showLogin ? 'Únete a nosotros' : 'Bienvenido de nuevo'}
                </h2>
                <p className='mt-3 text-sm leading-relaxed text-white/80'>
                    {showLogin
                        ? 'Crea tu cuenta y empieza a explorar.'
                        : 'Inicia sesión para continuar donde lo dejaste.'}
                </p>
                <button
                    type='button'
                    onClick={() => setShowLogin(!showLogin)}
                    className='hover:text-primary mt-6 rounded-full border-2 border-white/70 px-8 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white active:scale-95'
                >
                    {showLogin ? 'Registrarse' : 'Iniciar sesión'}
                </button>
            </div>
        </motion.div>
    );
};

export default SlicePanel;
