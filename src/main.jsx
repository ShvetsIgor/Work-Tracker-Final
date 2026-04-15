import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@/context/AppContext';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
