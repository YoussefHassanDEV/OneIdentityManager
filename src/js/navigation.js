/**
 * Navigation Module
 * Handles section switching and navigation state
 */

const Navigation = {
  init() {
    this.setupEventListeners();
    this.setDefaultSection();
  },
  
  setupEventListeners() {
    // Event listeners are set via inline onclick in HTML
  },
  
  show(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Remove active from all nav links
    document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
      
      // Activate nav link
      const navLink = document.getElementById(`nav-${sectionId}`);
      if (navLink) navLink.classList.add('active');
      
      // Update progress
      Progress.update();
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  },
  
  setDefaultSection() {
    const firstSection = document.querySelector('.section');
    if (firstSection) {
      firstSection.classList.add('active');
    }
  }
};

// Make show function globally available
window.show = (sectionId) => Navigation.show(sectionId);

export default Navigation;
