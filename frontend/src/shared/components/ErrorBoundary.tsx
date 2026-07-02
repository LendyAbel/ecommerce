import { Component, type ErrorInfo, type ReactNode } from 'react';

import { logger } from '@/lib/logger';

type Props = { children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Punto único para enviar el error a un servicio de monitoreo (Sentry…).
        logger.error('ErrorBoundary:', error, info.componentStack);
    }

    handleReset = () => {
        window.location.assign('/');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className='bg-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center'>
                    <h1 className='font-display text-text text-2xl font-bold'>
                        Algo ha salido mal
                    </h1>
                    <p className='text-text-60 max-w-md'>
                        Ha ocurrido un error inesperado. Vuelve al inicio e
                        inténtalo de nuevo.
                    </p>
                    <button
                        type='button'
                        onClick={this.handleReset}
                        className='btn btn-primary'
                    >
                        Volver al inicio
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
