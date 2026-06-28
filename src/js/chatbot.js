/**
 * Chatbot Module
 * Gemini-powered AI tutor scoped to the OneIM study guide.
 */

const GEMINI_API_KEY = 'AQ.Ab8RN6KZ2yiorsEaPuidgTg4k3O8rbB2MV4ylbkeWSV-T9u1Ng';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT = `You are an expert OneIM (One Identity Manager) tutor assistant embedded inside a study guide called "OneIM Zero to Hero" by Youssef Hassan at SmplID.

Your job is to answer questions about One Identity Manager and Identity Governance & Administration (IGA) topics covered in this guide. Topics include:
- IGA fundamentals (identity lifecycle, provisioning, de-provisioning, attestation, SoD, RBAC, ABAC, Joiner/Mover/Leaver)
- OneIM platform overview and architecture (DBQueue, Job Server, Synchronization Engine, Application Server, Manager, Designer, Web Portal)
- Data model (Person, ADSAccount, Business Roles, IT Shop)
- Installation (SQL Server setup, OneIM installation, post-install config)
- AD Synchronization (sync projects, Synchronization Editor, mappings, workflows)
- Identity management, Business Roles, RBAC
- IT Shop and approval workflows
- Compliance and Attestation
- VB.NET scripting and customization
- Schema extensions, processes and events
- Troubleshooting

Rules:
- Answer ONLY questions related to OneIM, IGA, IAM, and identity management topics
- If asked something unrelated, politely say you are only able to help with OneIM and IGA topics
- Keep answers concise, clear, and practical — like a senior IAM consultant explaining to a junior
- Use bullet points for lists, short paragraphs for explanations
- If relevant, mention which section of the guide covers the topic
- Never make up features or behaviors that don't exist in OneIM
- You can use technical terms but always explain them briefly`;

const Chatbot = {
  history: [],
  isOpen: false,
  isLoading: false,

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const html = `
      <!-- ════════ CHATBOT ════════ -->
      <button id="chat-fab" aria-label="Open AI Tutor" onclick="Chatbot.toggle()">
        <span class="chat-fab-icon">🤖</span>
        <span class="chat-fab-label">Ask AI</span>
      </button>

      <div id="chat-panel" aria-hidden="true">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🤖</div>
            <div>
              <div class="chat-title">OneIM AI Tutor</div>
              <div class="chat-subtitle">Powered by Gemini · Ask anything about OneIM</div>
            </div>
          </div>
          <button class="chat-close-btn" onclick="Chatbot.toggle()" aria-label="Close">✕</button>
        </div>

        <div class="chat-messages" id="chat-messages">
          <div class="chat-msg assistant">
            <div class="chat-bubble">
              👋 Hi! I'm your OneIM study assistant. Ask me anything about Identity Governance, OneIM architecture, installation, scripting, or any topic in this guide.
            </div>
          </div>
        </div>

        <div class="chat-suggestions" id="chat-suggestions">
          <button onclick="Chatbot.ask('What is the DBQueue and how does it work?')">What is DBQueue?</button>
          <button onclick="Chatbot.ask('Explain Joiner Mover Leaver process')">Joiner Mover Leaver</button>
          <button onclick="Chatbot.ask('What is the difference between RBAC and ABAC?')">RBAC vs ABAC</button>
          <button onclick="Chatbot.ask('How does AD synchronization work in OneIM?')">AD Sync</button>
        </div>

        <div class="chat-input-row">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask about OneIM…"
            autocomplete="off"
            onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); Chatbot.send(); }"
          >
          <button class="chat-send-btn" id="chat-send" onclick="Chatbot.send()">
            <span>↑</span>
          </button>
        </div>
      </div>

      <div class="chat-backdrop" id="chat-backdrop" onclick="Chatbot.toggle()"></div>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
  },

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.toggle();
    });
  },

  toggle() {
    this.isOpen = !this.isOpen;
    const panel    = document.getElementById('chat-panel');
    const fab      = document.getElementById('chat-fab');
    const backdrop = document.getElementById('chat-backdrop');
    panel.classList.toggle('open', this.isOpen);
    fab.classList.toggle('open', this.isOpen);
    backdrop.classList.toggle('show', this.isOpen);
    panel.setAttribute('aria-hidden', String(!this.isOpen));
    if (this.isOpen) {
      setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
    }
  },

  ask(question) {
    document.getElementById('chat-input').value = question;
    // hide suggestions after first use
    document.getElementById('chat-suggestions').style.display = 'none';
    this.send();
  },

  async send() {
    if (this.isLoading) return;
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    document.getElementById('chat-suggestions').style.display = 'none';
    this.appendMsg('user', query);
    this.history.push({ role: 'user', parts: [{ text: query }] });

    this.setLoading(true);

    try {
      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: this.history,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      };

      const res  = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data   = await res.json();
      const reply  = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      this.history.push({ role: 'model', parts: [{ text: reply }] });
      this.appendMsg('assistant', reply);

    } catch (err) {
      this.appendMsg('assistant', `⚠️ Error: ${err.message}. Please try again.`);
    } finally {
      this.setLoading(false);
    }
  },

  appendMsg(role, text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;

    // Convert markdown-ish text to HTML
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^•\s/gm, '• ');

    div.innerHTML = `<div class="chat-bubble"><p>${formatted}</p></div>`;
    messages.appendChild(div);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  },

  setLoading(state) {
    this.isLoading = state;
    const btn  = document.getElementById('chat-send');
    const msgs = document.getElementById('chat-messages');

    if (state) {
      btn.disabled = true;
      btn.innerHTML = '<span class="chat-spinner"></span>';
      const typing = document.createElement('div');
      typing.className = 'chat-msg assistant typing-indicator';
      typing.id = 'typing';
      typing.innerHTML = `<div class="chat-bubble"><span></span><span></span><span></span></div>`;
      msgs.appendChild(typing);
      msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
    } else {
      btn.disabled = false;
      btn.innerHTML = '<span>↑</span>';
      document.getElementById('typing')?.remove();
    }
  },

  clearHistory() {
    this.history = [];
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML = `<div class="chat-msg assistant"><div class="chat-bubble">👋 Chat cleared! Ask me anything about OneIM.</div></div>`;
    document.getElementById('chat-suggestions').style.display = 'flex';
  }
};

window.Chatbot = Chatbot;
export default Chatbot;
