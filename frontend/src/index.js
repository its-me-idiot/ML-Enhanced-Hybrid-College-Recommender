// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// React 18 createRoot method
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals();

// Optional: Log performance metrics
// reportWebVitals(console.log);

// Optional: Send to analytics endpoint
// reportWebVitals((metric) => {
//   // Send to analytics
//   console.log('Performance metric:', metric);
// });
