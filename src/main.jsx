import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import { AppearanceProvider } from './context/AppearanceContext';
import './index.css';
import './social-home.css';
import './appearance.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppearanceProvider>
      <BrowserRouter>
        <AuthProvider>
          <PresenceProvider>
            <App />
          </PresenceProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppearanceProvider>
  </React.StrictMode>
);
