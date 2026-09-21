import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HomeOsProvider } from './context/HomeOsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomeOsProvider>
      <App />
    </HomeOsProvider>
  </React.StrictMode>
);
