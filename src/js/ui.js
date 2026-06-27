/**
 * UI Module
 * Search, code copy buttons, quiz scoring, mobile menu, back-to-top,
 * keyboard navigation, and smooth scrolling.
 */

import CONFIG, { Store } from './config.js';

// Restore saved quiz answers from previous visits: { q1: true/false, ... }
const quizAnswers = Store.load(CONFIG.storeKeys.quiz, {});

const UI = {
  init() {
    this.injectCopyButtons();
    this.initBackTop();
    this.setupKeyboardNav();
    this.restoreQuiz();
  },

  // ── Sidebar search / filter ──────────────────────────────
  filterNav(query) {
    const q = (query || '').trim().toLowerCase();
    const items = document.querySelectorAll('.sidebar-nav li');
    const headers = document.querySelectorAll('.sidebar-section');

    if (!q) {
      items.forEach(li => li.classList.remove('hide-search'));
      headers.forEach(h => h.classList.remove('hide-search'));
      return;
    }

    items.forEach(li => {
      const match = li.textContent.toLowerCase().includes(q);
      li.classList.toggle('hide-search', !match);
    });

    headers.forEach(header => {
      const list = header.nextElementSibling;
      let anyVisible = false;
      if (list && list.classList.contains('sidebar-nav')) {
        list.querySelectorAll('li').forEach(li => {
          if (!li.classList.contains('hide-search')) anyVisible = true;
        });
      }
      header.classList.toggle('hide-search', !anyVisible);
    });
  },

  // ── Code copy buttons ────────────────────────────────────
  injectCopyButtons() {
    document.querySelectorAll('.code-wrap .code-header').forEach(header => {
      if (header.querySelector('.code-copy')) return;
      const btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.textContent = 'Copy';
      btn.setAttribute('onclick', 'copyCode(this)');
      header.appendChild(btn);
    });
  },

  copyCode(btn) {
    const wrap = btn.closest('.code-wrap');
    const block = wrap && wrap.querySelector('.code-block');
    if (!block) return;
    const text = block.innerText;
    const done = () => {
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => this._fallbackCopy(text, done));
    } else {
      this._fallbackCopy(text, done);
    }
  },

  _fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  },

  // ── Quiz ─────────────────────────────────────────────────
  answer(el, correct, qid) {
    const box = el.closest('.quiz-box');
    const opts = box.querySelectorAll('.quiz-opt');
    const expl = document.getElementById(qid);
    opts.forEach(o => { o.onclick = null; o.style.cursor = 'default'; });
    el.classList.add(correct ? 'correct' : 'wrong');
    if (!correct) {
      opts.forEach(o => {
        const oc = o.getAttribute('onclick') || '';
        if (oc.includes('true')) o.classList.add('correct');
      });
    }
    if (expl) expl.style.display = 'block';

    quizAnswers[qid] = correct;
    Store.save(CONFIG.storeKeys.quiz, quizAnswers);
    this.updateQuizScore();
  },

  restoreQuiz() {
    Object.keys(quizAnswers).forEach(qid => {
      const expl = document.getElementById(qid);
      if (!expl) return;
      const box = expl.closest('.quiz-box');
      if (!box) return;
      box.querySelectorAll('.quiz-opt').forEach(o => {
        o.onclick = null;
        o.style.cursor = 'default';
        const oc = o.getAttribute('onclick') || '';
        if (oc.includes('true')) o.classList.add('correct');
      });
      expl.style.display = 'block';
    });
    this.updateQuizScore();
  },

  updateQuizScore() {
    const total = document.querySelectorAll('.quiz-box').length;
    const answered = Object.keys(quizAnswers).length;
    const correct = Object.values(quizAnswers).filter(Boolean).length;
    const numEl = document.getElementById('quiz-score-num');
    const lblEl = document.getElementById('quiz-score-label');
    if (numEl) numEl.textContent = `${correct}/${total}`;
    if (!lblEl) return;
    if (answered === 0) {
      lblEl.textContent = 'Not started yet — click an answer to begin. Your score is saved automatically.';
    } else if (answered < total) {
      lblEl.textContent = `${answered} of ${total} answered · ${correct} correct so far. Keep going!`;
    } else if (correct === total) {
      lblEl.textContent = 'Perfect score — you are ready for the labs. 🏆';
    } else {
      lblEl.textContent = `All answered · ${correct} correct. Review the ones you missed and retry.`;
    }
  },

  resetQuiz() {
    Object.keys(quizAnswers).forEach(k => delete quizAnswers[k]);
    Store.save(CONFIG.storeKeys.quiz, quizAnswers);
    location.reload();
  },

  // ── Mobile menu ──────────────────────────────────────────
  toggleMobileMenu() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.querySelector('.mobile-backdrop')?.classList.toggle('show');
  },
  closeMobileMenu() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.querySelector('.mobile-backdrop')?.classList.remove('show');
  },

  // ── Back-to-top ──────────────────────────────────────────
  initBackTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  // ── Keyboard navigation (Alt + arrows) ───────────────────
  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;
      const active = document.querySelector('.section.active');
      const i = CONFIG.sections.indexOf(active ? active.id : 'overview');
      if (e.key === 'ArrowRight' && i < CONFIG.sections.length - 1) window.show(CONFIG.sections[i + 1]);
      if (e.key === 'ArrowLeft' && i > 0) window.show(CONFIG.sections[i - 1]);
    });
  }
};

// Expose globally for inline handlers in the HTML
window.filterNav = (q) => UI.filterNav(q);
window.copyCode = (btn) => UI.copyCode(btn);
window.answer = (el, correct, qid) => UI.answer(el, correct, qid);
window.resetQuiz = () => UI.resetQuiz();
window.toggleMobileMenu = () => UI.toggleMobileMenu();
window.closeMobileMenu = () => UI.closeMobileMenu();

export default UI;
