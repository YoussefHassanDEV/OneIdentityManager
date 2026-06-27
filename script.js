// Navigation section toggle
function show(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(s => s.classList.remove('active'));
  
  // Remove active state from all nav links
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => link.classList.remove('active'));
  
  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    
    // Activate corresponding nav link
    const navLink = document.getElementById(`nav-${sectionId}`);
    if (navLink) {
      navLink.classList.add('active');
    }
    
    // Update progress
    updateProgress();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
}

// Calculate and update learning progress
function updateProgress() {
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set first section as active
  const firstSection = document.querySelector('.section');
  if (firstSection) {
    firstSection.classList.add('active');
  }
  
  updateProgress();
});

// Quiz functionality (if needed in future)
function selectAnswer(questionId, optionIndex) {
  const options = document.querySelectorAll(`#${questionId} .quiz-opt`);
  options.forEach(opt => opt.classList.remove('correct', 'wrong'));
  
  // Mark selected option
  if (options[optionIndex]) {
    options[optionIndex].classList.add('correct');
  }
  
  // Show explanation
  const explanation = document.querySelector(`#${questionId} .quiz-explanation`);
  if (explanation) {
    explanation.style.display = 'block';
  }
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
