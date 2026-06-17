import './index.css';
import App from '@/app/App';

import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/shared/components';

createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </ErrorBoundary>,
);
