/**
 * Progress Module
 * Tracks and displays learning progress
 */

const Progress = {
  init() {
    this.update();
  },
  
  update() {
    const sections = document.querySelectorAll('.section');
    const activeSections = document.querySelectorAll('.section.active');
    
    if (sections.length === 0) return;
    
    const progress = Math.round((activeSections.length / sections.length) * 100);
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');
    
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
    if (progressLabel) {
      progressLabel.textContent = progress + '% Complete';
    }
  }
};

export default Progress;
