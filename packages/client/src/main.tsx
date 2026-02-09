import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';

// Initialize dir/lang from persisted language preference
const stored = localStorage.getItem('ui-storage');
if (stored) {
  try {
    const lang = JSON.parse(stored).state?.language || 'ar';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  } catch { /* use defaults from HTML */ }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
