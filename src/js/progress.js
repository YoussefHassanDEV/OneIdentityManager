/**
 * Progress Module
 * Tracks and displays learning progress based on visited sections.
 */

import CONFIG from './config.js';

const Progress = {
  init() {
    this.update();
  },

  // Accepts the visited Set from Navigation; falls back to counting active section
  update(visited) {
    const total = CONFIG.sections.length;
    let count;

    if (visited && typeof visited.size === 'number') {
      count = visited.size;
    } else {
      count = document.querySelectorAll('.section.active').length;
    }

    if (total === 0) return;

    const pct = Math.round((count / total) * 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');

    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '% Complete';
  }
};

export default Progress;
