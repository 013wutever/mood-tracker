import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import App from './App';

// Mobile optimization
(function() {
  // Fix iOS height
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Initial set
  setViewportHeight();

  // Update on resize and orientation change
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });

  // Prevent overscroll on iOS
  document.body.addEventListener('touchmove', function(e) {
    if (!e.target.closest('.scroll-container')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Handle keyboard appearance on iOS
  window.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      document.body.classList.add('keyboard-open');
    }
  });

  window.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      document.body.classList.remove('keyboard-open');
    }
  });
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
