/**
 * Navigation Module
 * Handles section switching, saved progress, and the section pager.
 */

import CONFIG, { Store } from './config.js';
import Progress from './progress.js';
import UI from './ui.js';

// Restore the visited set from previous visits (defaults to the first section)
const visited = new Set(Store.load(CONFIG.storeKeys.visited, ['overview']));

const Navigation = {
  init() {
    this.updateVisitedMarks();

    // Resume where the user left off (defaults to overview)
    const last = Store.load(CONFIG.storeKeys.last, 'overview');
    if (CONFIG.sections.includes(last)) {
      this.show(last);
    } else {
      this.show('overview');
    }
  },

  show(sectionId) {
    // Hide all sections, clear active nav state
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));

    const section = document.getElementById(sectionId);
    if (!section) return false;

    section.classList.add('active');

    const navLink = document.getElementById(`nav-${sectionId}`);
    if (navLink) navLink.classList.add('active');

    // Persist visited + last section
    visited.add(sectionId);
    Store.save(CONFIG.storeKeys.visited, [...visited]);
    Store.save(CONFIG.storeKeys.last, sectionId);

    Progress.update(visited);
    this.updateVisitedMarks();
    this.buildPager(sectionId);
    UI.closeMobileMenu();

    const mt = document.querySelector('.mobile-title');
    if (mt) mt.textContent = CONFIG.sectionNames[sectionId] || 'OneIM';

    window.scrollTo({ top: 0, behavior: CONFIG.ui.scrollBehavior });
    return false;
  },

  // Tick the sidebar checkmark for every visited section
  updateVisitedMarks() {
    CONFIG.sections.forEach(id => {
      const navEl = document.getElementById(`nav-${id}`);
      if (!navEl) return;
      navEl.classList.toggle('done', visited.has(id));
    });
  },

  // Build the prev / next buttons at the bottom of a section
  buildPager(sectionId) {
    const host = document.getElementById(`pager-${sectionId}`);
    if (!host) return;
    const { sections, sectionNames } = CONFIG;
    const i = sections.indexOf(sectionId);
    const prevId = i > 0 ? sections[i - 1] : null;
    const nextId = i < sections.length - 1 ? sections[i + 1] : null;

    const prev = prevId
      ? `<button class="pager-btn prev" onclick="show('${prevId}')"><div class="pager-dir">‹ Previous</div><div class="pager-name">${sectionNames[prevId]}</div></button>`
      : `<button class="pager-btn prev" disabled><div class="pager-dir">‹ Previous</div><div class="pager-name">Start of guide</div></button>`;

    const next = nextId
      ? `<button class="pager-btn next" onclick="show('${nextId}')"><div class="pager-dir">Next ›</div><div class="pager-name">${sectionNames[nextId]}</div></button>`
      : `<button class="pager-btn next" disabled><div class="pager-dir">Next ›</div><div class="pager-name">End of guide</div></button>`;

    host.innerHTML = prev + next;
  },

  resetProgress() {
    Store.remove(CONFIG.storeKeys.visited);
    Store.remove(CONFIG.storeKeys.quiz);
    Store.remove(CONFIG.storeKeys.last);
    location.reload();
  },

  getVisited() {
    return visited;
  }
};

// Expose globally for inline onclick handlers in the HTML
window.show = (sectionId) => Navigation.show(sectionId);
window.resetProgress = () => Navigation.resetProgress();

export default Navigation;
