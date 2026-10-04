// Small, idempotent DOM annotations; all Antigravity controls stay native.
(() => {
  if (globalThis.__antigravityGeminiStyleV3) return;
  globalThis.__antigravityGeminiStyleV3 = true;
  const css = __GEMINI_CSS__;
  const GREETINGS = [
    "¿Qué rompemos hoy con estilo? (¬‿¬)",
    "Tranqui, esta vez compila a la primera (˶ᵔ ᵕ ᵔ˶)",
    "Tú pon la idea, yo la lógica (੭ˊᵕˋ)੭",
    "Prometo no meter bugs sin avisar (｡•́‿•̀｡)",
    "¿Listo para otro día de fe en el código? (๑•̀ㅂ•́)و",
    "Todo bajo control... creo (・_・;)",
    "Un refactor chiquito y nos vamos ( ˘͈ ᵕ ˘͈ )",
    "Dime qué inventamos hoy (｡•̀ᴗ-)✧",
    "En mi máquina funcionaba, lo juro ¯\\_(ツ)_/¯",
    "A ver qué magia linda sale hoy (ﾉ◕ヮ◕)ﾉ",
    "No toques nada que ya está funcionando (；・∀・)",
    "Hoy programamos en modo pro ( •_•)>⌐■-■",
    "¿Hacemos algo épico o solo un parche? (¬_¬ )",
    "Respira hondo, el linter no muerde ( ˘⊖˘ )",
    "Llegó la hora de crear cosas geniales ( ˶• ֊ •˶ )",
    "Si no hay bugs raros, no hay emoción ( ﾟДﾟ)",
    "¿Qué arquitectura improvisamos hoy? ( ˘o˘ )",
    "El código está limpio, créeme ( ˘‿˘ )",
    "Un commit más y cerramos el día (*¯︶¯*)",
    "Dale, cuéntame el plan maestro (・_・ )"
  ];
  const workspace = { open: false, plus: null, project: null, environment: null, panel: null };
  function closeWorkspace(restoreFocus = false) {
    // Dismiss child popups through their native handler before hiding the anchor.
    // Otherwise Base UI can leave an invisible modal backdrop over the editor.
    for (const root of [workspace.project, workspace.environment]) {
      const trigger = root?.querySelector('[aria-expanded="true"][aria-controls]');
      const popup = trigger && document.getElementById(trigger.getAttribute('aria-controls'));
      popup?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true, cancelable: true}));
    }
    workspace.open = false;
    workspace.panel?.remove();
    workspace.panel = null;
    document.documentElement.removeAttribute('data-gemini-workspace-open');
    if (restoreFocus) workspace.plus?.focus();
  }
  function positionWorkspace() {
    if (!workspace.open || !workspace.plus?.isConnected) return;
    const rect = workspace.plus.getBoundingClientRect();
    const height = workspace.project ? 164 : 112;
    const width = Math.min(320, innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left - 8, innerWidth - width - 12));
    const top = rect.bottom + height + 16 <= innerHeight ? rect.bottom + 16 : Math.max(12, rect.top - height - 16);
    const root = document.documentElement;
    for (const [key, value] of Object.entries({left, top, width, height})) root.style.setProperty('--gemini-workspace-' + key, value + 'px');
  }
  function openWorkspace() {
    if (workspace.plus?.getAttribute('aria-expanded') === 'true') {
      document.getElementById(workspace.plus.getAttribute('aria-controls'))?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true, cancelable: true}));
    }
    closeWorkspace();
    workspace.open = true;
    const panel = document.createElement('div');
    panel.className = 'gemini-workspace-panel';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Workspace');
    panel.setAttribute('aria-owns', [workspace.project?.id, workspace.environment?.id].filter(Boolean).join(' '));
    const heading = document.createElement('span');
    heading.textContent = 'Workspace';
    panel.append(heading);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'gemini-workspace-close';
    close.setAttribute('aria-label', 'Close workspace');
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    close.addEventListener('click', () => closeWorkspace(true));
    panel.append(close);
    workspace.panel = panel;
    let mount = workspace.project || workspace.environment;
    const other = workspace.environment || workspace.project;
    while (mount && (!mount.contains(other) || mount === other)) mount = mount.parentElement;
    (mount || document.body).append(panel);
    mark(document.documentElement, 'data-gemini-workspace-open', workspace.project ? 'project-and-environment' : 'environment');
    positionWorkspace();
    (workspace.project?.querySelector('button') || workspace.environment?.querySelector('button') || close).focus();
  }
  function annotateWorkspace(plus, project, environment) {
    if (workspace.open && (workspace.plus !== plus || workspace.project !== project || workspace.environment !== environment)) closeWorkspace();
    workspace.plus = plus;
    workspace.project = project;
    workspace.environment = environment;
    // Native focus restoration can reopen a popup after its anchor is hidden.
    // Keep the native modal state in sync with Workspace visibility.
    if (!document.documentElement.hasAttribute('data-gemini-workspace-open') &&
        (project?.querySelector('[aria-expanded="true"]') || environment?.querySelector('[aria-expanded="true"]'))) {
      closeWorkspace();
    }
    if (project) {
      mark(project, 'data-gemini-workspace-project');
      if (!project.id) project.id = 'gemini-workspace-project';
    }
    if (environment) {
      mark(environment, 'data-gemini-workspace-environment');
      if (!environment.id) environment.id = 'gemini-workspace-environment';
      mark(environment.closest('.h-fit'), 'data-gemini-runtime-footer');
    }
    const menu = plus?.getAttribute('aria-expanded') === 'true' ? document.getElementById(plus.getAttribute('aria-controls')) : null;
    if (!menu || (!project && !environment)) return;
    mark(menu, 'data-gemini-context-menu');
    const existing = menu.querySelector('.gemini-workspace-menu-item');
    if (existing) { existing.removeAttribute('aria-haspopup'); return; }
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'gemini-workspace-menu-item';
    row.setAttribute('role', 'menuitem');
    row.setAttribute('tabindex', '-1');
    row.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h7l2 2h9v11H3V7Z"/></svg><span>Workspace</span><svg class="gemini-workspace-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
    menu.append(row);
  }
  function mark(element, attribute, value = '') {
    if (element && element.getAttribute(attribute) !== value) element.setAttribute(attribute, value);
  }
  function annotate() {
    let sheet = document.getElementById('antigravity-gemini-theme');
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.id = 'antigravity-gemini-theme';
      sheet.textContent = css;
      (document.head || document.documentElement).append(sheet);
    }
    if (sheet.textContent !== css) sheet.textContent = css;
    const sidebar = document.querySelector('[role="navigation"][aria-label="Sidebar"]');
    if (sidebar) {
      const inner = sidebar.parentElement;
      const frame = inner?.parentElement;
      const shell = sidebar.closest('[style*="--sidebar-width"]');
      const expanded = !!frame && parseFloat(frame.style.width) > 0 && frame.style.visibility !== 'hidden';
      for (const [element, marker] of [[inner,'data-gemini-sidebar-inner'], [frame,'data-gemini-sidebar-frame'], [shell,'data-gemini-shell']]) {
        if (!element) continue;
        if (!element.hasAttribute(marker)) element.setAttribute(marker, '');
        const flag = String(expanded);
        if (element.getAttribute('data-gemini-expanded') !== flag) element.setAttribute('data-gemini-expanded', flag);
      }
      const top = sidebar.firstElementChild;
      if (top) {
        top.querySelector('.gemini-antigravity-brand')?.remove();
      }

      function setupActionBtn(btn, titleText, iconSvg) {
        if (!btn) return;
        btn.setAttribute('title', titleText);
        btn.setAttribute('aria-label', titleText);
        let svg = btn.querySelector('svg');
        if (!svg) {
          btn.insertAdjacentHTML('afterbegin', iconSvg);
          svg = btn.querySelector('svg');
        }
        if (svg) {
          svg.classList.add('gemini-action-icon');
          svg.setAttribute('aria-hidden', 'true');
        }
        for (const node of [...btn.childNodes]) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const span = document.createElement('span');
            span.className = 'gemini-hidden-text';
            span.textContent = node.textContent;
            node.replaceWith(span);
          } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'svg' && !node.contains(svg)) {
            node.classList.add('gemini-hidden-text');
          }
        }
      }

      const newBtn = sidebar.querySelector('[data-testid="new-conversation-button"]');
      const histBtn = sidebar.querySelector('[data-testid="history-button"]');
      const autoBtn = sidebar.querySelector('[data-testid="automations-button"]');

      setupActionBtn(newBtn, 'Nueva conversación', '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>');
      setupActionBtn(histBtn, 'Historial de conversaciones', '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>');
      setupActionBtn(autoBtn, 'Tareas programadas', '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3" ry="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>');

      if (newBtn && (histBtn || autoBtn)) {
        let row = sidebar.querySelector('.gemini-sidebar-actions-row');
        if (!row) {
          row = document.createElement('div');
          row.className = 'gemini-sidebar-actions-row';
          const parent = newBtn.parentElement;
          if (parent) parent.insertBefore(row, newBtn);
        }
        if (row) {
          if (!row.contains(newBtn)) row.append(newBtn);
          if (histBtn && !row.contains(histBtn)) row.append(histBtn);
          if (autoBtn && !row.contains(autoBtn)) row.append(autoBtn);
        }
      }
    }
    const toggle = [...document.querySelectorAll('[data-testid="sidebar-toggle"]')].find(element => !element.closest('[data-aux-pane-open]'));
    mark(toggle?.parentElement, 'data-gemini-nav-controls');
    mark(toggle?.parentElement?.parentElement, 'data-gemini-nav-tools');
    let breadcrumbRow = document.querySelector('[data-testid="breadcrumb-segment"]');
    while (breadcrumbRow && !breadcrumbRow.style.paddingLeft.includes('--static-cluster-width')) breadcrumbRow = breadcrumbRow.parentElement;
    mark(breadcrumbRow, 'data-gemini-breadcrumb-row');
    for (const pane of document.querySelectorAll('[data-aux-pane-open]')) {
      const tabs = pane.querySelector('[data-active-tab-id]');
      for (const tab of tabs?.querySelectorAll('[data-tab-id]') || []) {
        mark(tab, 'data-gemini-tab-selected', String(tab.getAttribute('data-tab-id') === tabs.getAttribute('data-active-tab-id')));
      }
    }
    const picker = document.querySelector('[data-testid="model-selector-trigger"]');
    const selected = picker?.getAttribute('aria-label')?.replace(/^Select model, current:\s*/, '') || '';
    const shortModel = selected.includes('Flash') ? 'Flash' : selected.includes('Pro') ? 'Pro' : selected.includes('Sonnet') ? 'Sonnet' : selected.includes('Opus') ? 'Opus' : selected.includes('GPT-OSS') ? 'GPT-OSS' : selected;
    mark(picker, 'data-gemini-model-short', shortModel);
    mark(picker, 'title', selected);
    for (const panel of document.querySelectorAll('[data-testid="model-selector-panel"]')) {
      mark(panel.closest('[role="menu"]'), 'data-gemini-model-menu');
      const header = panel.querySelector('[data-testid="model-selector-header"]');
      if (header && header.textContent !== 'Modelos disponibles ( ˘͈ ᵕ ˘͈ )') {
        header.textContent = 'Modelos disponibles ( ˘͈ ᵕ ˘͈ )';
      }
      for (const row of panel.querySelectorAll('[role="menuitem"]')) {
        const label = row.querySelector('[data-model-base]')?.getAttribute('data-model-base') || row.getAttribute('data-model-label');
        if (!label) continue;
        const content = row.firstElementChild;
        const effort = content?.querySelector('span:nth-child(2)')?.textContent?.trim();
        const badge = content?.querySelector('[data-tooltip-id]');
        const fast = badge?.textContent?.trim() === 'Fast';
        if (fast) {
          mark(badge, 'data-gemini-fast');
          badge.textContent = 'Turbo ( ﾟヮﾟ)';
        }
        let description = row.querySelector('.gemini-model-description');
        if (!description) {
          description = document.createElement('span');
          description.className = 'gemini-model-description';
          row.append(description);
        }
        let detail = '';
        if (effort) {
          const effortLower = effort.toLowerCase();
          if (effortLower.includes('high') || effortLower.includes('max')) {
            detail = `Razonamiento nivel galaxia ( ˘ω˘ )${fast ? ' · Turbo' : ''}`;
          } else if (effortLower.includes('medium')) {
            detail = `Razonamiento equilibrado (・ω・)${fast ? ' · Turbo' : ''}`;
          } else if (effortLower.includes('low')) {
            detail = `Razonamiento ágil (｡•̀ᴗ-)✧${fast ? ' · Turbo' : ''}`;
          } else {
            detail = `${effort} pensando ( ˘͈ ᵕ ˘͈ )${fast ? ' · Turbo' : ''}`;
          }
        } else if (label.includes('Thinking')) {
          detail = 'Modo pensativo profundo ( ˘ω˘ )';
        } else if (label.includes('Medium')) {
          detail = 'Razonamiento equilibrado (・ω・)';
        } else if (label.includes('Flash')) {
          detail = 'Rápido y ligero (｡•̀ᴗ-)✧';
        } else if (label.includes('Pro')) {
          detail = 'Potente para tareas complejas (๑•̀ㅂ•́)و';
        } else {
          detail = 'Modelo de desarrollo ( ˶• ֊ •˶ )';
        }
        if (description.textContent !== detail) description.textContent = detail;
        mark(row, 'data-gemini-model-row');
        mark(row, 'data-gemini-selected', String(selected === label || selected.startsWith(label + ' ')));
      }
    }
    mark(document.querySelector('[role="dialog"][aria-label="Settings"]'), 'data-gemini-settings');
    mark(document.querySelector('input[placeholder*="Search conversations"]')?.parentElement, 'data-gemini-history-search');
    for (const toolbar of document.querySelectorAll('[data-testid="cascade-system-message-toolbar"]')) {
      mark(toolbar.parentElement?.parentElement, 'data-gemini-response-actions-wrap');
      const goodBtn = toolbar.querySelector('[aria-label*="Good response"], [aria-label*="buena"]');
      if (goodBtn && goodBtn.getAttribute('title') !== 'Quedó de diez (•̀ᴗ•́)و') {
        goodBtn.setAttribute('title', 'Quedó de diez (•̀ᴗ•́)و');
        goodBtn.setAttribute('aria-label', 'Quedó de diez (•̀ᴗ•́)و');
      }
      const badBtn = toolbar.querySelector('[aria-label*="Bad response"], [aria-label*="mala"]');
      if (badBtn && badBtn.getAttribute('title') !== 'Casi, pero necesita ajuste (¬_¬ )') {
        badBtn.setAttribute('title', 'Casi, pero necesita ajuste (¬_¬ )');
        badBtn.setAttribute('aria-label', 'Casi, pero necesita ajuste (¬_¬ )');
      }
      const copyBtn = toolbar.querySelector('[aria-label*="Copy"], [aria-label*="copiar"]');
      if (copyBtn && copyBtn.getAttribute('title') !== 'Copiar respuesta (*¯︶¯*)') {
        copyBtn.setAttribute('title', 'Copiar respuesta (*¯︶¯*)');
        copyBtn.setAttribute('aria-label', 'Copiar respuesta (*¯︶¯*)');
      }
    }
    const settingsBtn = document.querySelector('[data-testid="settings-button"]');
    if (settingsBtn && settingsBtn.getAttribute('title') !== 'Ajustes ( ˶• ֊ •˶ )') {
      settingsBtn.setAttribute('title', 'Ajustes ( ˶• ֊ •˶ )');
      settingsBtn.setAttribute('aria-label', 'Ajustes ( ˶• ֊ •˶ )');
    }
    for (const inputEl of document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])')) {
      const ph = inputEl.placeholder;
      if (!ph) continue;
      if (/search conversation/i.test(ph) && ph !== 'Buscar charlas ( ˶• ֊ •˶ )') {
        inputEl.placeholder = 'Buscar charlas ( ˶• ֊ •˶ )';
      } else if (/search|filter/i.test(ph) && !ph.includes('(')) {
        inputEl.placeholder = 'Buscar... ( ˶• ֊ •˶ )';
      }
    }
    for (const body of document.querySelectorAll('[role="article"][aria-label="Agent response"] .md-divider-spacing')) {
      mark(body, 'data-gemini-response-body');
    }
    for (const panel of document.querySelectorAll('[data-testid="running-items-panel"]')) {
      const summary = panel.querySelector('button[aria-expanded]');
      if (summary && !panel.hasAttribute('data-gemini-running-prepared')) {
        mark(panel, 'data-gemini-running-prepared');
        if (summary.getAttribute('aria-expanded') === 'true') summary.click();
      }
    }
    const input = document.querySelector('[aria-label="Message input"]');
    if (!input) return;
    const box = input.closest('[data-testid="agent-input-box"]');
    const container = input.closest('[id="antigravity.agentSidePanelInputBox"]');
    const surface = [...(container?.children || [])].find(element => element.contains(input));
    mark(surface, 'data-gemini-composer-surface');
    const navigation = [...document.querySelectorAll('[data-gemini-nav-tools]')].find(element => !element.closest('[data-aux-pane-open]'));
    const titleBar = document.querySelector('[data-testid="title-menu-bar"]');
    const boundary = Math.max(navigation?.getBoundingClientRect().bottom || 0, titleBar?.getBoundingClientRect().bottom || 0);
    const available = Math.max(96, Math.min(360, Math.floor((surface?.getBoundingClientRect().top || 0) - boundary - 12)));
    for (const menu of document.querySelectorAll('[data-mention-menu], [data-command-menu]')) {
      if (menu.style.getPropertyValue('--gemini-typeahead-height') !== available + 'px') menu.style.setProperty('--gemini-typeahead-height', available + 'px');
    }
    mark([...(surface?.children || [])].find(element => element.contains(input)), 'data-gemini-composer-editor');
    const controls = [...(surface?.children || [])].find(element => element.querySelector('[aria-label="Add context"]'));
    mark(controls, 'data-gemini-composer-controls');
    mark(controls?.querySelector('[aria-label="Add context"]')?.parentElement, 'data-gemini-context-cluster');
    const contextBtn = controls?.querySelector('[aria-label="Add context"]');
    if (contextBtn && contextBtn.getAttribute('title') !== 'Añadir contexto (｡•̀ᴗ-)✧') {
      contextBtn.setAttribute('title', 'Añadir contexto (｡•̀ᴗ-)✧');
      contextBtn.setAttribute('aria-label', 'Añadir contexto (｡•̀ᴗ-)✧');
    }
    const voiceBtn = controls?.querySelector('[aria-label="Record voice memo"]');
    if (voiceBtn && voiceBtn.getAttribute('title') !== 'Grabar nota de voz ( ˘͈ ᵕ ˘͈ )') {
      voiceBtn.setAttribute('title', 'Grabar nota de voz ( ˘͈ ᵕ ˘͈ )');
      voiceBtn.setAttribute('aria-label', 'Grabar nota de voz ( ˘͈ ᵕ ˘͈ )');
    }
    const sendBtn = document.querySelector('[data-testid="send-button"]');
    if (sendBtn && sendBtn.getAttribute('title') !== 'Enviar mensaje (੭ˊᵕˋ)੭') {
      sendBtn.setAttribute('title', 'Enviar mensaje (੭ˊᵕˋ)੭');
      sendBtn.setAttribute('aria-label', 'Enviar mensaje (੭ˊᵕˋ)੭');
    }
    const project = document.querySelector('[data-testid="project-selector-trigger"]')?.closest('.relative.w-full');
    const environment = document.querySelector('[aria-label="Select Environment"]')?.parentElement?.parentElement;
    annotateWorkspace(controls?.querySelector('[aria-label="Add context"]'), project, environment);
    const searchInput = document.querySelector('input[placeholder*="Search conversations"]');
    if (searchInput && searchInput.placeholder !== 'Buscar charlas ( ˶• ֊ •˶ )') {
      searchInput.placeholder = 'Buscar charlas ( ˶• ֊ •˶ )';
    }
    const placeholder = input.nextElementSibling;
    if (placeholder?.tagName === 'P' && placeholder.textContent !== 'Escribe una idea... (˶ᵔ ᵕ ᵔ˶)') {
      mark(input, 'title', 'Escribe una idea... (˶ᵔ ᵕ ᵔ˶). Usa @ para contexto o / para acciones.');
      placeholder.textContent = 'Escribe una idea... (˶ᵔ ᵕ ᵔ˶)';
    }
    for (const btn of document.querySelectorAll('[data-testid="worked-for-collapsible"], [data-testid="tool-group-collapsible"], [data-testid="thinking-collapsible-trigger"]')) {
      const span = btn.querySelector('span:not(:empty)') || btn;
      if (span && span.textContent) {
        if (/^Worked for\s*(.+)/i.test(span.textContent)) {
          span.textContent = span.textContent.replace(/^Worked for\s*(.+)/i, 'Listo en $1 (˶ᵔ ᵕ ᵔ˶)');
        } else if (/^Thinking/i.test(span.textContent)) {
          span.textContent = 'Pensando... ( ˘͈ ᵕ ˘͈ )';
        }
      }
    }
    for (const step of document.querySelectorAll('[data-testid="run-command-step"]')) {
      const title = step.querySelector('.text-sm');
      if (title && /^Run command/i.test(title.textContent)) {
        title.textContent = title.textContent.replace(/^Run command/i, 'Ejecutando (๑•̀ㅂ•́)و');
      }
    }
    for (const step of document.querySelectorAll('[data-testid="view-file-step"]')) {
      const title = step.querySelector('.text-sm');
      if (title && /^View file/i.test(title.textContent)) {
        title.textContent = title.textContent.replace(/^View file/i, 'Revisando ( ˶˘꒳˘)');
      }
    }
    const conversation = input.closest('[data-testid="conversation-view"]');
    if (conversation) {
      const dock = [...conversation.children].find(element => element.contains(box));
      mark(dock, 'data-gemini-conversation-dock');
      mark([...(dock?.children || [])].find(element => element.contains(box)), 'data-gemini-conversation-composer-column');
      const note = dock?.querySelector('.gemini-conversation-note');
      if (note) note.style.display = 'none';
      for (const step of conversation.querySelectorAll('[data-testid="user-input-step"]')) {
        const bubble = [...step.querySelectorAll('[data-testid="lifted-context-menu-trigger"]')].find(element => element.querySelector('[data-quotable="true"]'));
        mark(bubble, 'data-gemini-user-bubble');
      }
    }
    let home = input;
    while (home && !home.className?.includes?.('pt-[30vh]')) home = home.parentElement;
    if (home) {
      home.setAttribute('data-gemini-home', '');
      const body = home.parentElement?.parentElement?.parentElement;
      if (body) body.setAttribute('data-gemini-main', '');
      if (!home.querySelector('.gemini-antigravity-greeting')) {
        const heading = document.createElement('h1');
        heading.className = 'gemini-antigravity-greeting';
        heading.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        home.prepend(heading);
      }
      const column = box?.parentElement?.parentElement?.parentElement;
      if (column) column.setAttribute('data-gemini-composer-column', '');
    }
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; annotate(); });
  }
  function start() {
    annotate();
    new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'aria-expanded', 'aria-controls', 'aria-label', 'data-active-tab-id']});
    const handleWorkspaceClick = event => {
      if (!event.target.closest('.gemini-workspace-menu-item')) return;
      event.preventDefault(); event.stopPropagation(); openWorkspace();
    };
    // Register at the document boundary so the native menu retains its own handlers.
    const handleWorkspaceKeys = event => {
      const menu = document.querySelector('[data-gemini-context-menu]');
      const row = menu?.querySelector('.gemini-workspace-menu-item');
      if (!row || !menu.contains(document.activeElement)) return;
      const items = [...menu.querySelectorAll('[role="menuitem"]')].filter(item => item !== row && !item.hasAttribute('data-disabled'));
      const active = document.activeElement;
      if (event.key === 'End' || event.key === 'ArrowDown' && active === items.at(-1) || event.key === 'ArrowUp' && active === items[0]) {
        event.preventDefault(); event.stopPropagation(); row.focus();
      } else if (active === row && ['ArrowUp', 'ArrowDown', 'Home', 'Enter', ' '].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Enter' || event.key === ' ') openWorkspace();
        else (event.key === 'ArrowUp' ? items.at(-1) : items[0])?.focus();
      }
    };
    globalThis.__geminiWorkspaceEvents = {click: handleWorkspaceClick, keydown: handleWorkspaceKeys};
    if (!globalThis.__geminiWorkspaceEventsBound) {
      globalThis.__geminiWorkspaceEventsBound = true;
      addEventListener('click', event => globalThis.__geminiWorkspaceEvents.click(event), true);
      addEventListener('keydown', event => globalThis.__geminiWorkspaceEvents.keydown(event), true);
    }
    document.addEventListener('pointerdown', event => {
      if (!workspace.open || event.target.closest('.gemini-workspace-panel, [data-gemini-workspace-project], [data-gemini-workspace-environment], [role="menu"], [role="dialog"]')) return;
      closeWorkspace();
    }, true);
    document.addEventListener('keydown', event => {
      if (!workspace.open || event.key !== 'Escape') return;
      if (workspace.project?.querySelector('[aria-expanded="true"]') || workspace.environment?.querySelector('[aria-expanded="true"]')) return;
      event.preventDefault(); closeWorkspace(true);
    });
    addEventListener('resize', () => { positionWorkspace(); schedule(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
