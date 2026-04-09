import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service Worker registration with Base Path awareness
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine base for GitHub Pages or local
    const base = import.meta.env.BASE_URL;
    const swPath = `${base}sw.js`;
    
    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW register failed:', err));
  });
}
