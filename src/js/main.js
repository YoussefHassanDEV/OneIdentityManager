/**
 * OneIM - Main Entry Point
 * Initializes all modules
 */

// Import modules
import Navigation from './navigation.js';
import UI from './ui.js';
import Progress from './progress.js';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 OneIM Learning Platform Initialized');
  
  Navigation.init();
  UI.init();
  Progress.init();
});
