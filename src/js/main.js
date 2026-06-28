/**
 * OneIM - Main Entry Point
 */
import CONFIG from './config.js';
import Navigation from './navigation.js';
import UI from './ui.js';
import Progress from './progress.js';
import Chatbot from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log(`🚀 ${CONFIG.app.name} v${CONFIG.app.version} initialized`);
  UI.init();
  Progress.init();
  Navigation.init();
  Chatbot.init();
});
