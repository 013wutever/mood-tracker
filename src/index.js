import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';           // Διατηρούμε αυτό
import './styles/globals.css';  // Προσθέτουμε και αυτό
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// IIFE για initialization code
(function() {
  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Set viewport height for mobile browsers
  function setMobileHeight() {
    if (isMobile) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  }

  // Initialize
  setMobileHeight();
  
  // Update on resize
  window.addEventListener('resize', setMobileHeight);
  
  // Prevent bounce effect on iOS
 document.body.addEventListener('touchmove', function(e) {
    if (e.target.closest('.scroll-container')) return;
    e.preventDefault();
  }, { passive: false });
})();
