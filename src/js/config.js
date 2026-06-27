/**
 * Configuration & Constants
 */

export const CONFIG = {
  app: {
    name: 'OneIM - Zero to Hero',
    version: '2.0.0',
    environment: 'production'
  },

  sections: [
    'overview',
    'iga-concepts',
    'oneim-intro',
    'architecture',
    'components',
    'data-model',
    'prerequisites',
    'install-sql',
    'install-oneim',
    'post-install',
    'ad-sync',
    'identity-mgmt',
    'business-roles',
    'it-shop',
    'compliance',
    'scripting',
    'schema-ext',
    'processes',
    'security',
    'labs',
    'quiz',
    'troubleshoot',
    'resources'
  ],

  // Human-readable names used by the section pager
  sectionNames: {
    'overview': 'Introduction',
    'iga-concepts': 'IGA Fundamentals',
    'oneim-intro': 'What is OneIM?',
    'architecture': 'System Architecture',
    'components': 'Components Deep Dive',
    'data-model': 'Data Model',
    'prerequisites': 'Prerequisites',
    'install-sql': 'SQL Server Setup',
    'install-oneim': 'OneIM Installation',
    'post-install': 'Post-Install Config',
    'ad-sync': 'AD Synchronization',
    'identity-mgmt': 'Identity Management',
    'business-roles': 'Business Roles & RBAC',
    'it-shop': 'IT Shop & Workflows',
    'compliance': 'Compliance & Attestation',
    'scripting': 'Scripting & Customization',
    'schema-ext': 'Schema Extension',
    'processes': 'Processes & Events',
    'security': 'Security & Permissions',
    'labs': 'Lab Guide Order',
    'quiz': 'Knowledge Quiz',
    'troubleshoot': 'Troubleshooting',
    'resources': 'Resources'
  },

  // localStorage keys for saved progress (works on GitHub Pages)
  storeKeys: {
    visited: 'oneim_visited',
    quiz: 'oneim_quiz',
    last: 'oneim_last_section'
  },

  ui: {
    animationDuration: 200,
    scrollBehavior: 'smooth'
  }
};

// Small localStorage helpers, wrapped so a blocked store never breaks the page
export const Store = {
  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable — ignore */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

export default CONFIG;
