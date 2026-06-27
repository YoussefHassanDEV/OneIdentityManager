/**
 * OneIM - Main Entry Point
 * Initializes all modules (ES module build under src/).
 */

import CONFIG from './config.js';
import Navigation from './navigation.js';
import UI from './ui.js';
import Progress from './progress.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log(`🚀 ${CONFIG.app.name} v${CONFIG.app.version} initialized`);

  UI.init();          // copy buttons, back-to-top, keyboard nav, quiz restore
  Progress.init();
  Navigation.init();  // resumes last section, builds pager, marks visited
});
