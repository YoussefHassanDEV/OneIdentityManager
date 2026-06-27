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
    this.initSearch();   // ← ADDED
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
  },

  // ── Full-content search ──────────────────────────────────
  _matchEls: [],
  _matchIdx: 0,

  _escRx(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  _clearHighlights() {
    document.querySelectorAll('mark.sh').forEach(m => {
      m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
    });
    document.querySelectorAll('.section').forEach(s => s.normalize());
    this._matchEls = [];
    this._matchIdx = 0;
  },

  _highlightSection(root, rx) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement?.tagName;
        if (!tag || ['SCRIPT','STYLE','MARK'].includes(tag)) return NodeFilter.FILTER_REJECT;
        rx.lastIndex = 0;
        return rx.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(textNode => {
      rx.lastIndex = 0;
      const text = textNode.textContent;
      const frag = document.createDocumentFragment();
      let last = 0, match;
      while ((match = rx.exec(text)) !== null) {
        if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        const mark = document.createElement('mark');
        mark.className = 'sh';
        mark.textContent = match[0];
        frag.appendChild(mark);
        last = rx.lastIndex;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
  },

  doSearch(query) {
    this._clearHighlights();
    const meta  = document.getElementById('search-meta');
    const count = document.getElementById('search-count');
    const clear = document.getElementById('search-clear');
    if (!query.trim()) {
      meta.style.display  = 'none';
      clear.style.display = 'none';
      count.textContent   = '';
      return;
    }
    clear.style.display = 'inline-flex';
    const rx = new RegExp(`(${this._escRx(query)})`, 'gi');
    document.querySelectorAll('.section').forEach(sec => this._highlightSection(sec, rx));
    this._matchEls = [...document.querySelectorAll('mark.sh')];
    if (!this._matchEls.length) {
      meta.style.display = 'flex';
      count.textContent  = 'No results';
      count.style.color  = '#ef4444';
      return;
    }
    count.style.color  = '';
    meta.style.display = 'flex';
    this._matchIdx = 0;
    this._jumpTo(0);
  },

_jumpTo(idx) {
    this._matchEls.forEach(el => el.classList.remove('sh-active'));
    if (!this._matchEls.length) return;
    const el  = this._matchEls[idx];
    const sec = el.closest('.section');

    const activate = () => {
      el.classList.add('sh-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('search-count').textContent = `${idx + 1} of ${this._matchEls.length}`;
    };

    if (sec && !sec.classList.contains('active')) {
      window.show(sec.id);
      setTimeout(activate, 120); // wait for section switch + scroll reset
    } else {
      activate();
    }
  },

  nextMatch() {
    if (!this._matchEls.length) return;
    this._matchIdx = (this._matchIdx + 1) % this._matchEls.length;
    this._jumpTo(this._matchIdx);
  },

  prevMatch() {
    if (!this._matchEls.length) return;
    this._matchIdx = (this._matchIdx - 1 + this._matchEls.length) % this._matchEls.length;
    this._jumpTo(this._matchIdx);
  },

  initSearch() {
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    if (!input) return;
    input.addEventListener('input', () => this.doSearch(input.value));
    clear.addEventListener('click', () => { input.value = ''; this.doSearch(''); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); input.focus(); input.select();
      }
      if (e.key === 'Enter' && document.activeElement === input) this.nextMatch();
      if (e.key === 'Escape' && document.activeElement === input) input.blur();
    });
  }

};

// Expose globally for inline handlers in the HTML
window.filterNav        = (q)           => UI.filterNav(q);
window.copyCode         = (btn)         => UI.copyCode(btn);
window.answer           = (el, c, qid) => UI.answer(el, c, qid);
window.resetQuiz        = ()            => UI.resetQuiz();
window.toggleMobileMenu = ()            => UI.toggleMobileMenu();
window.closeMobileMenu  = ()            => UI.closeMobileMenu();
window.nextMatch        = ()            => UI.nextMatch();
window.prevMatch        = ()            => UI.prevMatch();

export default UI;
