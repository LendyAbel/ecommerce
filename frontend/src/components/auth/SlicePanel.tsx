import React from 'react'

type SlicePanelProps = {
    showLogin: boolean;
    setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
};
const SlicePanel = ({ showLogin, setShowLogin }: SlicePanelProps) => {
    return (
        <div
            className='absolute top-0 z-20 flex h-full flex-col items-center justify-center gap-6 px-12 text-center'
            style={{
                width: '50%',
                background: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)',
                borderRadius: showLogin ? '0 24px 24px 0' : '24px 0 0 24px',
                left: showLogin ? '50%' : '0%',
                transition:
                    'left 0.7s cubic-bezier(0.77, 0, 0.175, 1), border-radius 0.7s ease',
                boxShadow: showLogin
                    ? '-8px 0 32px rgba(0,0,0,0.3)'
                    : '8px 0 32px rgba(0,0,0,0.3)',
            }}
        >
            {/* Patrón geométrico decorativo */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-10'>
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
                <p className='text-xs font-semibold tracking-[0.3em] text-purple-200 uppercase'>
                    {showLogin ? '¿Nuevo aquí?' : '¿Ya tienes cuenta?'}
                </p>
                <h2
                    className='mt-2 text-3xl font-bold text-white'
                    style={{
                        fontFamily: 'Georgia, serif',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {showLogin ? 'Únete a nosotros' : 'Bienvenido de nuevo'}
                </h2>
                <p className='mt-3 text-sm leading-relaxed text-purple-100 opacity-80'>
                    {showLogin
                        ? 'Crea tu cuenta y empieza a explorar.'
                        : 'Inicia sesión para continuar donde lo dejaste.'}
                </p>
                <button
                    onClick={() => setShowLogin(!showLogin)}
                    className='mt-6 rounded-full border-2 border-white px-8 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-purple-700'
                >
                    {showLogin ? 'Registrarse' : 'Iniciar sesión'}
                </button>
            </div>
        </div>
    );
};

export default SlicePanel