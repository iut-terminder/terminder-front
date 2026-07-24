import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
//import reportWebVitals from './reportWebVitals';
import { AuthContextProvider } from './store/Authentication/AuthContext';
import { ToastContextProvider } from './store/Toast/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastContextProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </ToastContextProvider>
  </React.StrictMode>
);

reportWebVitals();