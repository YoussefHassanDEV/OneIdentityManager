/**
 * UI Module
 * Handles user interface interactions
 */

const UI = {
  init() {
    this.setupSmoothScroll();
    this.setupQuizHandlers();
  },
  
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  },
  
  setupQuizHandlers() {
    // Quiz functionality setup
  },
  
  selectQuizAnswer(questionId, optionIndex) {
    const options = document.querySelectorAll(`#${questionId} .quiz-opt`);
    options.forEach(opt => opt.classList.remove('correct', 'wrong'));
    
    if (options[optionIndex]) {
      options[optionIndex].classList.add('correct');
    }
    
    const explanation = document.querySelector(`#${questionId} .quiz-explanation`);
    if (explanation) {
      explanation.style.display = 'block';
    }
  }
};

export default UI;
