const sections = {
    overview:         { label: 'introduction',    crumb: 'overview' },
    'tutorial-jsonplaceholder': { label: 'JSONPlaceholder walkthrough', crumb: 'tutorials' },
    'cache-basics':   { label: 'store & retrieve', crumb: 'cache-users' },
    'storage-backends': { label: 'storage backends', crumb: 'cache-users' },
    'api-wrapper':    { label: 'ApiWrapper',       crumb: 'api-clients' },
    'building-blocks':{ label: 'building blocks',  crumb: 'api-clients' },
    'typed-models':   { label: 'typed models',     crumb: 'api-clients' },
    'json-injester':  { label: 'JsonInjester',     crumb: 'query-layer' },
    'selector-guide': { label: 'selectors',        crumb: 'query-layer' },
    'ref-cache':      { label: 'Cache',            crumb: 'reference' },
    'ref-apiwrapper': { label: 'ApiWrapper',       crumb: 'reference' },
    'ref-apimodel':   { label: '@apimodel',        crumb: 'reference' },
    'ref-storage':    { label: 'storage & logging',crumb: 'reference' },
  };

  const codeReferenceTargets = {
    cache:            { sectionId: 'ref-cache', targetSelector: '#ref-cache-cache' },
    cacherecord:      { sectionId: 'ref-cache', targetSelector: '#ref-cache-cacherecord' },
    '@cache.cached':  { sectionId: 'ref-cache', targetSelector: 'h4' },
    apiwrapper:       { sectionId: 'ref-apiwrapper', targetSelector: '#ref-apiwrapper-constructor' },
    apihttperror:     { sectionId: 'ref-apiwrapper', targetSelector: '#ref-apiwrapper-apihttperror' },
    apiwrappererror:  { sectionId: 'ref-apiwrapper', targetSelector: '.page-title' },
    sseevent:         { sectionId: 'ref-apiwrapper', targetSelector: '#ref-apiwrapper-stream-sse' },
    '@apimodel':      { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-decorator' },
    alias:            { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-alias' },
    'alias()':        { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-alias' },
    'alias(...)':     { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-alias' },
    columns:          { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-columns' },
    'columns()':      { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-columns' },
    'columns(...)':   { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-columns' },
    timestamp:        { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-timestamp' },
    'timestamp()':    { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-timestamp' },
    'timestamp(...)': { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-timestamp' },
    lazy:             { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-lazy' },
    'lazy()':         { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-lazy' },
    'lazy(...)':      { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-lazy' },
    apimodelvalidationerror: { sectionId: 'ref-apimodel', targetSelector: '#ref-apimodel-validation' },
    jsoninjester:     { sectionId: 'json-injester', targetSelector: '.page-title' },
    'q.get()':        { sectionId: 'selector-guide', targetSelector: '#selector-guide-get-options' },
    '.query':         { sectionId: 'cache-basics', targetSelector: '#cache-basics-querying-the-payload-inline' },
    unset:            { sectionId: 'json-injester', targetSelector: '#json-injester-when-selectors-resolve-to-nothing' },
    storagemechanism: { sectionId: 'ref-storage', targetSelector: '#ref-storage-storagemechanism' },
    picklestorage:    { sectionId: 'ref-storage', targetSelector: '#ref-storage-backend-selection' },
    jsonstorage:      { sectionId: 'ref-storage', targetSelector: '#ref-storage-backend-selection' },
    chunkedstorage:   { sectionId: 'ref-storage', targetSelector: '#ref-storage-backend-selection' },
    sqlitestorage:    { sectionId: 'ref-storage', targetSelector: '#ref-storage-sqlitestorage' },
    requestlogger:    { sectionId: 'ref-storage', targetSelector: '#ref-storage-requestlogger' },
    get_storage_mechanism: { sectionId: 'ref-storage', targetSelector: '#ref-storage-backend-selection' },
  };

  const semanticAliases = {
    hydration: ['hydrate', 'hydrated', 'hydrating', 'typed', 'model', 'models', 'cast', 'apimodel', 'get_object'],
    hydrate: ['hydration', 'hydrated', 'typed', 'cast', 'apimodel'],
    typed: ['hydration', 'hydrate', 'apimodel', 'model', 'models', 'cast'],
    model: ['models', 'typed', 'hydration', 'apimodel', 'cast'],
    models: ['model', 'typed', 'hydration', 'apimodel', 'cast'],
    apimodel: ['typed', 'hydration', 'model', 'models', 'cast', 'alias', 'timestamp', 'lazy'],
    cast: ['typed', 'hydration', 'apimodel', 'model'],
    ttl: ['expiry', 'freshness', 'stale', 'cache'],
    expiry: ['ttl', 'stale', 'freshness'],
    stale: ['ttl', 'expiry', 'freshness'],
    selectors: ['selector', 'query', 'jsoninjester', 'path'],
    selector: ['selectors', 'query', 'jsoninjester', 'path'],
    query: ['selector', 'selectors', 'jsoninjester', 'path'],
    jsoninjester: ['query', 'selector', 'selectors', 'path'],
    tutorial: ['jsonplaceholder', 'example', 'walkthrough', 'apiwrapper'],
    tutorials: ['tutorial', 'jsonplaceholder', 'example', 'walkthrough'],
    jsonplaceholder: ['tutorial', 'example', 'apiwrapper', 'alias', 'cast'],
    example: ['tutorial', 'jsonplaceholder', 'walkthrough'],
  };

  const searchState = {
    chunks: [],
    activeIndex: -1,
    results: [],
    
    lastRequestId: null,
    query: '',
  };
  const copyIconSvg = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2"></rect>
      <path d="M5 15V7a2 2 0 0 1 2-2h8"></path>
    </svg>
  `;
  const copiedIconSvg = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"></path>
    </svg>
  `;

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  function initializeCopyCodeButtons() {
    document.querySelectorAll('pre[data-lang]').forEach(pre => {
      if (pre.querySelector('.copy-code-button')) return;

      const code = pre.querySelector('code');
      if (!code) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code-button';
      button.title = 'Copy code';
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = copyIconSvg + '<span class="copy-code-button-label">copy</span>';

      button.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();

        try {
          await copyTextToClipboard(code.textContent.replace(/\n$/, ''));
          button.classList.add('copied');
          button.title = 'Copied';
          button.setAttribute('aria-label', 'Copied');
          button.innerHTML = copiedIconSvg + '<span class="copy-code-button-label">copied!</span>';

          window.setTimeout(() => {
            button.classList.remove('copied');
            button.title = 'Copy code';
            button.setAttribute('aria-label', 'Copy code');
            button.innerHTML = copyIconSvg + '<span class="copy-code-button-label">copy</span>';
          }, 1400);
        } catch (error) {
          console.error('Copy failed', error);
          button.title = 'Copy failed';
          button.setAttribute('aria-label', 'Copy failed');
        }
      });

      pre.appendChild(button);
    });
  }

  const DEFAULT_SECTION_ID = 'overview';
  const SEARCH_STORAGE_KEY = 'pypercache-docs-ragexp-search-v1';
  const SEARCH_STORAGE_RESULT_LIMIT = 6;
  let activeSearchTarget = null;
  let activeSearchTargetTimer = null;
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
  }

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9_@.\- ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(text) {
    return normalize(text)
      .split(' ')
      .map(token => token.trim())
      .filter(token => token.length > 1);
  }

  function unique(items) {
    return Array.from(new Set(items));
  }

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function trimStoredQuery(query) {
    return typeof query === 'string' ? query.slice(0, 240) : '';
  }

  function persistSearchSnapshot() {
    const storage = getStorage();
    if (!storage) return;
    const query = trimStoredQuery(searchState.query);
    const snapshot = {
      query,
      activeIndex: Math.max(searchState.activeIndex, -1),
      resultIds: searchState.results
        .slice(0, SEARCH_STORAGE_RESULT_LIMIT)
        .map(result => result.id)
        .filter(Boolean),
    };

    if (!snapshot.query && !snapshot.resultIds.length) {
      storage.removeItem(SEARCH_STORAGE_KEY);
      return;
    }

    try {
      storage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      storage.removeItem(SEARCH_STORAGE_KEY);
    }
  }

  function restoreSearchSnapshot() {
    const storage = getStorage();
    if (!storage) return;

    let snapshot = null;
    try {
      snapshot = JSON.parse(storage.getItem(SEARCH_STORAGE_KEY) || 'null');
    } catch (error) {
      storage.removeItem(SEARCH_STORAGE_KEY);
      return;
    }

    if (!snapshot || typeof snapshot !== 'object') return;
    searchState.query = trimStoredQuery(snapshot.query);

    const chunkById = new Map(searchState.chunks.map(chunk => [chunk.id, chunk]));
    const resultIds = Array.isArray(snapshot.resultIds) ? snapshot.resultIds : [];
    searchState.results = resultIds
      .map(id => chunkById.get(id))
      .filter(Boolean)
      .map((chunk, index) => ({
        ...chunk,
        score: SEARCH_STORAGE_RESULT_LIMIT - index,
        matchedTerms: [],
        
      }));

    searchState.activeIndex = searchState.results.length
      ? Math.min(Math.max(snapshot.activeIndex || 0, 0), searchState.results.length - 1)
      : -1;
  }

  function buildTrigrams(value) {
    const text = `  ${normalize(value)}  `;
    const grams = new Set();
    for (let i = 0; i < text.length - 2; i += 1) {
      grams.add(text.slice(i, i + 3));
    }
    return grams;
  }

  function jaccard(setA, setB) {
    if (!setA.size || !setB.size) return 0;
    let intersection = 0;
    setA.forEach(item => {
      if (setB.has(item)) intersection += 1;
    });
    return intersection / (setA.size + setB.size - intersection);
  }

  function escapeHtml(text) {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function expandQueryTokens(query) {
    const tokens = tokenize(query);
    const expanded = [...tokens];
    tokens.forEach(token => {
      const aliases = semanticAliases[token];
      if (aliases) expanded.push(...aliases);
      if (token.endsWith('s')) expanded.push(token.slice(0, -1));
      else expanded.push(`${token}s`);
    });
    return unique(expanded.filter(token => token.length > 1));
  }

  function buildSearchIndex() {
    const chunks = [];
    document.querySelectorAll('.section').forEach(section => {
      const sectionId = section.id.replace('section-', '');
      const heroTitle = section.querySelector('.page-title')?.textContent?.trim() || sections[sectionId]?.label || sectionId;
      let currentHeading = heroTitle;
      let currentAnchor = sectionId;
      let chunkCounter = 0;

      const heroLead = section.querySelector('.page-lead')?.textContent?.trim();
      if (heroLead) {
        const heroChunkId = `${sectionId}-hero`;
        chunks.push(makeChunk({
          id: heroChunkId,
          sectionId,
          sectionTitle: heroTitle,
          heading: 'Overview',
          anchorId: ensureAnchor(section.querySelector('.page-hero'), heroChunkId),
          targetId: ensureAnchor(section.querySelector('.page-lead') || section.querySelector('.page-hero'), `${heroChunkId}-target`),
          text: heroLead,
          sourceType: 'hero',
          ordinal: chunkCounter++,
        }));
      }

      section.querySelectorAll('h2, h3, p, li, pre, .callout, .method, td, .card').forEach(node => {
        if (node.matches('h2, h3')) {
          currentHeading = node.textContent.trim();
          currentAnchor = ensureAnchor(node, `${sectionId}-${slugify(currentHeading) || chunkCounter}`);
          return;
        }

        const text = node.innerText ? node.innerText.trim() : node.textContent.trim();
        if (!text || text.length < 20) return;

        chunks.push(makeChunk({
          id: `${sectionId}-${chunkCounter}`,
          sectionId,
          sectionTitle: heroTitle,
          heading: currentHeading,
          anchorId: currentAnchor,
          targetId: ensureAnchor(node, `${sectionId}-${chunkCounter}-target`),
          text,
          sourceType: node.tagName.toLowerCase(),
          ordinal: chunkCounter++,
        }));
      });
    });

    searchState.chunks = chunks;
    document.getElementById('search-status').textContent = `Indexed ${chunks.length} local chunks`;
  }

  function ensureAnchor(node, fallbackId) {
    if (!node) return fallbackId;
    if (!node.id) node.id = fallbackId;
    return node.id;
  }

  function clearActiveSearchTarget() {
    if (activeSearchTarget) {
      activeSearchTarget.classList.remove('search-target-glow');
      activeSearchTarget = null;
    }
    if (activeSearchTargetTimer) {
      clearTimeout(activeSearchTargetTimer);
      activeSearchTargetTimer = null;
    }
  }

  function scrollAndGlowTarget(target, options = {}) {
    if (!target) return;
    const { glow = true, behavior = 'smooth' } = options;
    clearActiveSearchTarget();

    const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 0;
    const extraOffset = 24;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - topbarHeight - extraOffset;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior });
    window.getSelection()?.removeAllRanges();

    if (!glow) return;
    target.classList.remove('search-target-glow');
    void target.offsetWidth;
    target.classList.add('search-target-glow');

    activeSearchTarget = target;
    activeSearchTargetTimer = setTimeout(() => {
      target.classList.remove('search-target-glow');
      if (activeSearchTarget === target) activeSearchTarget = null;
      activeSearchTargetTimer = null;
    }, 1800);
  }

  function normalizeCodeReference(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\(\s*\)/g, '__EMPTY_CALL__')
      .replace(/\(\s*\.\.\.\s*\)/g, '(...)')
      .replace(/\([^)]*\)/g, '(...)')
      .replace(/__EMPTY_CALL__/g, '()')
      .toLowerCase();
  }

  function resolveCodeReferenceTarget(text) {
    const key = normalizeCodeReference(text);
    if (!key) return null;
    const entry = codeReferenceTargets[key];
    if (!entry) return null;

    const section = document.getElementById(`section-${entry.sectionId}`);
    if (!section) return null;

    const target = entry.targetSelector
      ? section.querySelector(entry.targetSelector)
      : section.querySelector('.page-title, h2, h3');

    return target ? { ...entry, target } : null;
  }

  function isInlineCodeReferenceCandidate(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.closest('pre, .method')) return false;
    if (!node.matches('p code, li code, td code, .callout code, .card-desc code, .page-lead code')) return false;

    const text = normalizeQueryText(node.textContent);
    if (!text || text.length > 40) return false;
    if (text.includes('\n')) return false;
    if ((text.match(/\s+/g) || []).length > 2) return false;

    return Boolean(resolveCodeReferenceTarget(text));
  }

  function syncModifierNavigationState(event) {
    document.body.classList.toggle('mod-nav-active', Boolean(event?.ctrlKey || event?.metaKey));
  }

  function activateInlineCodeReferences() {
    document.querySelectorAll('code').forEach(node => {
      if (!isInlineCodeReferenceCandidate(node)) return;

      const targetInfo = resolveCodeReferenceTarget(node.textContent);
      if (!targetInfo) return;

      node.classList.add('inline-code-ref');
      node.dataset.sectionId = targetInfo.sectionId;
      node.dataset.targetId = ensureAnchor(
        targetInfo.target,
        `${targetInfo.sectionId}-${slugify(normalizeQueryText(node.textContent)) || 'code-ref'}`
      );
      node.title = 'Ctrl/Cmd+Click to open docs section';

      node.addEventListener('click', event => {
        if (!(event.ctrlKey || event.metaKey)) return;
        if (event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        const sectionId = node.dataset.sectionId;
        const target = document.getElementById(node.dataset.targetId);
        if (!sectionId || !target) return;

        show(sectionId, { scrollTop: false, targetId: node.dataset.targetId, glowTarget: true });
      });
    });
  }

  function buildLocationHash(sectionId, targetId = null) {
    const params = new URLSearchParams();
    params.set('section', sectionId);
    if (targetId) params.set('target', targetId);
    return `#${params.toString()}`;
  }

  function normalizeSectionId(sectionId) {
    return sections[sectionId] ? sectionId : DEFAULT_SECTION_ID;
  }

  function parseLocationState() {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash) {
      return { sectionId: DEFAULT_SECTION_ID, targetId: null };
    }

    if (!hash.includes('=')) {
      const legacySectionId = hash.replace(/^section-/, '');
      return { sectionId: normalizeSectionId(legacySectionId), targetId: null };
    }

    const params = new URLSearchParams(hash);
    return {
      sectionId: normalizeSectionId(params.get('section') || DEFAULT_SECTION_ID),
      targetId: params.get('target') || null,
    };
  }

  function getNavigationState(overrides = {}) {
    const parsed = parseLocationState();
    return {
      sectionId: normalizeSectionId(overrides.sectionId ?? history.state?.sectionId ?? parsed.sectionId),
      targetId: overrides.targetId ?? history.state?.targetId ?? parsed.targetId ?? null,
      scrollY: overrides.scrollY ?? window.scrollY,
    };
  }

  function replaceCurrentHistoryEntry(overrides = {}) {
    const state = getNavigationState(overrides);
    history.replaceState(state, '', buildLocationHash(state.sectionId, state.targetId));
    return state;
  }

  function isSameLocation(sectionId, targetId) {
    const state = getNavigationState();
    return state.sectionId === sectionId && (state.targetId || null) === (targetId || null);
  }

  function renderSection(id, options = {}) {
    const { scrollTop = true } = options;

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const section = document.getElementById('section-' + id);
    if (section) section.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => {
      if (l.getAttribute('onclick') === `show('${id}')`) {
        l.classList.add('active');
      }
    });

    const meta = sections[id];
    if (meta) {
      document.getElementById('breadcrumb').innerHTML =
        `pypercache <span>/</span> ${meta.crumb} <span>/</span> ${meta.label}`;
    }

    document.getElementById('sidebar').classList.remove('open');

    if (scrollTop) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function finalizeNavigationTarget(targetId, options = {}) {
    if (!targetId) return;
    const { glow = true, behavior = 'smooth' } = options;
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      scrollAndGlowTarget(target, { glow, behavior });
    }, 30);
  }

  function navigateTo(id, options = {}) {
    const {
      scrollTop = true,
      targetId = null,
      glowTarget = false,
      historyMode = 'push',
      restoreScrollY = null,
    } = options;

    const sectionId = normalizeSectionId(id);
    const normalizedTargetId = targetId || null;

    renderSection(sectionId, { scrollTop: scrollTop && !normalizedTargetId && restoreScrollY == null });

    if (historyMode === 'push') {
      if (!isSameLocation(sectionId, normalizedTargetId)) {
        replaceCurrentHistoryEntry();
        history.pushState({
          sectionId,
          targetId: normalizedTargetId,
          scrollY: normalizedTargetId ? null : 0,
        }, '', buildLocationHash(sectionId, normalizedTargetId));
      } else {
        replaceCurrentHistoryEntry({
          sectionId,
          targetId: normalizedTargetId,
          scrollY: restoreScrollY ?? (normalizedTargetId ? null : window.scrollY),
        });
      }
    } else if (historyMode === 'replace') {
      replaceCurrentHistoryEntry({
        sectionId,
        targetId: normalizedTargetId,
        scrollY: restoreScrollY ?? (normalizedTargetId ? null : 0),
      });
    }

    if (normalizedTargetId) {
      finalizeNavigationTarget(normalizedTargetId, {
        glow: glowTarget,
        behavior: historyMode === 'pop' ? 'auto' : 'smooth',
      });
      return;
    }

    if (restoreScrollY != null) {
      window.scrollTo({ top: Math.max(restoreScrollY, 0), behavior: 'auto' });
      return;
    }

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function resultTitle(result) {
    if (!result) return '';
    if (result.heading === 'Overview' || result.heading === result.sectionTitle) {
      return result.sectionTitle;
    }
    return `${result.sectionTitle} — ${result.heading}`;
  }

  function resultPath(result) {
    if (!result) return '';
    if (result.heading === 'Overview' || result.heading === result.sectionTitle) {
      return result.sectionTitle;
    }
    return `${result.sectionTitle} / ${result.heading}`;
  }

  function makeChunk({ id, sectionId, sectionTitle, heading, anchorId, targetId, text, sourceType, ordinal }) {
    const normalizedText = normalize(text);
    const tokenSet = new Set(tokenize(text));
    const trigramSet = buildTrigrams(text);
    return {
      id,
      sectionId,
      sectionTitle,
      heading,
      anchorId,
      targetId,
      text,
      normalizedText,
      tokenSet,
      trigramSet,
      sourceType,
      ordinal,
      path: resultPath({ sectionTitle, heading }),
    };
  }

  function scoreClassicQuery(query) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const rawTokens = tokenize(trimmed);
    const expandedTokens = expandQueryTokens(trimmed);
    const queryTrigrams = buildTrigrams(trimmed);

    return searchState.chunks
      .map(chunk => {
        let exactScore = 0;
        let fuzzyScore = 0;
        let semanticScore = 0;
        let headingScore = 0;
        let titleScore = 0;
        let matchedTerms = [];

        rawTokens.forEach(token => {
          if (chunk.normalizedText.includes(token)) {
            exactScore += 12;
            matchedTerms.push(token);
          }
          if (chunk.heading.toLowerCase().includes(token)) headingScore += 14;
          if (chunk.sectionTitle.toLowerCase().includes(token)) titleScore += 8;
        });

        expandedTokens.forEach(token => {
          if (chunk.tokenSet.has(token)) {
            semanticScore += rawTokens.includes(token) ? 8 : 3.5;
            matchedTerms.push(token);
          } else if (chunk.normalizedText.includes(token)) {
            semanticScore += rawTokens.includes(token) ? 6 : 2.5;
            matchedTerms.push(token);
          }
        });

        fuzzyScore = jaccard(queryTrigrams, chunk.trigramSet) * 30;

        if (chunk.sourceType === 'hero') semanticScore += 4;
        if (chunk.sourceType === 'pre' && rawTokens.some(token => chunk.normalizedText.includes(token))) semanticScore += 2;

        const total = exactScore + fuzzyScore + semanticScore + headingScore + titleScore;
        return {
          ...chunk,
          score: total,
          matchedTerms: unique(matchedTerms).slice(0, 6),
        };
      })
      .filter(result => result.score >= 8)
      .sort((a, b) => b.score - a.score || a.ordinal - b.ordinal)
      .slice(0, 12);
  }
  function searchDocs(query) {
    return Promise.resolve(scoreClassicQuery(query));
  }

  function escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeQueryText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function collectSearchRanges(text, query) {
    const raw = normalizeQueryText(text);
    const queryText = normalizeQueryText(query);
    if (!raw || !queryText) return [];

    const phraseTokens = tokenize(queryText);
    if (phraseTokens.length) {
      const phrasePattern = phraseTokens.map(token => escapeRegex(token)).join('[^a-z0-9_@.\\-]+');
      const phraseRegex = new RegExp(phrasePattern, 'i');
      const phraseMatch = phraseRegex.exec(raw);
      if (phraseMatch) {
        return [{
          start: phraseMatch.index,
          end: phraseMatch.index + phraseMatch[0].length,
          weight: phraseMatch[0].length + 200,
        }];
      }
    }

    const terms = unique([
      ...tokenize(queryText),
      ...expandQueryTokens(queryText),
    ])
      .filter(term => term.length > 2)
      .sort((a, b) => b.length - a.length);

    const lower = raw.toLowerCase();
    const hits = [];

    terms.forEach(term => {
      const needle = term.toLowerCase();
      let offset = 0;
      while (offset < lower.length) {
        const index = lower.indexOf(needle, offset);
        if (index === -1) break;
        hits.push({ start: index, end: index + needle.length, weight: needle.length });
        offset = index + needle.length;
      }
    });

    if (!hits.length) return [];

    hits.sort((a, b) => a.start - b.start || b.end - a.end);
    const merged = [];

    hits.forEach(hit => {
      const previous = merged[merged.length - 1];
      if (!previous) {
        merged.push({ ...hit });
        return;
      }

      if (hit.start <= previous.end + 18) {
        previous.end = Math.max(previous.end, hit.end);
        previous.weight += hit.weight;
        return;
      }

      merged.push({ ...hit });
    });

    return merged;
  }

  function bestSearchRange(text, query) {
    const ranges = collectSearchRanges(text, query);
    if (!ranges.length) return null;
    return ranges.slice().sort((a, b) => b.weight - a.weight || a.start - b.start)[0];
  }

  function renderSearchHighlight(text, query) {
    const raw = normalizeQueryText(text);
    const ranges = collectSearchRanges(raw, query);
    if (!ranges.length) return escapeHtml(raw);

    let cursor = 0;
    let html = '';
    ranges.forEach(range => {
      if (range.start > cursor) {
        html += escapeHtml(raw.slice(cursor, range.start));
      }
      html += `<mark class="search-hit">${escapeHtml(raw.slice(range.start, range.end))}</mark>`;
      cursor = range.end;
    });
    if (cursor < raw.length) {
      html += escapeHtml(raw.slice(cursor));
    }
    return html;
  }

  function snippetFor(result, query) {
    const raw = normalizeQueryText(result.text);
    const bestRange = bestSearchRange(raw, query);
    const startIndex = bestRange ? bestRange.start : 0;
    const hitLength = bestRange ? Math.max(bestRange.end - bestRange.start, 0) : 0;
    const start = Math.max(0, startIndex - 70);
    const end = Math.min(raw.length, startIndex + hitLength + 140);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < raw.length ? '…' : '';
    return `${prefix}${raw.slice(start, end).trim()}${suffix}`;
  }

  function highlightTerms(text, query) {
    return renderSearchHighlight(text, query);
  }

  function renderResultList(query, results, restored = false) {
    if (!results.length) {
      return `
        <div class="search-empty">
          <strong>No direct match.</strong>
          Try a broader term like <code>typed</code>, <code>cache</code>, or <code>query</code>.
        </div>
      `;
    }

    return `
      ${restored ? `
        <div class="search-empty" style="margin-bottom:16px;">
          <strong>Restored last search.</strong>
          Run it again to refresh scores and snippets.
        </div>
      ` : ''}
      ${results.map((result, index) => `
      <article class="search-result ${index === searchState.activeIndex ? 'active' : ''}" data-result-index="${index}" onclick="activateSearchResult(${index}, true)">
        <div class="search-result-top">
          <div class="search-result-path">${escapeHtml(result.path)}</div>
          <div class="search-result-score">score ${Math.round(result.score)}</div>
        </div>
        <div class="search-result-title">${highlightTerms(resultTitle(result), query)}</div>
        <div class="search-result-preview">${highlightTerms(snippetFor(result, query), query)}</div>
      </article>
    `).join('')}
    `;
  }

  async function renderSearchResults(query) {
    const container = document.getElementById('search-results');
    if (!query.trim()) {
      searchState.results = [];
      searchState.activeIndex = -1;
      container.innerHTML = `
        <div class="search-empty">
          <strong>Search the local docs.</strong>
          Try <code>hydration</code>, <code>ttl</code>, <code>ApiWrapper</code>, or <code>selector</code>.
        </div>
      `;
      document.getElementById('search-status').textContent = `Indexed ${searchState.chunks.length} local chunks`;
      persistSearchSnapshot();
      return;
    }

    const requestId = Symbol('search-request');
    searchState.lastRequestId = requestId;
    document.getElementById('search-status').textContent = `Searching "${query}"...`;

    let results = [];
    try {
      results = await searchDocs(query);
    } catch (error) {
      console.error('Search failed', error);
      if (searchState.lastRequestId !== requestId) return;
      searchState.results = [];
      searchState.activeIndex = -1;
      document.getElementById('search-status').textContent = 'Search failed to load.';
      container.innerHTML = `
        <div class="search-empty">
          <strong>Search is temporarily unavailable.</strong>
          Reload the page and try again.
        </div>
      `;
      persistSearchSnapshot();
      return;
    }

    if (searchState.lastRequestId !== requestId) return;

    searchState.results = results;
    searchState.activeIndex = results.length ? 0 : -1;

    document.getElementById('search-status').textContent = results.length
      ? `${results.length} matches for "${query}"`
      : `No matches for "${query}"`;
    container.innerHTML = renderResultList(query, results);
    persistSearchSnapshot();
  }

  function handleSearchInput(value) {
    searchState.query = value;
    persistSearchSnapshot();
    renderSearchResults(value);
  }

  function renderRestoredSearch() {
    const query = searchState.query;
    const container = document.getElementById('search-results');

    if (!query.trim() || !searchState.results.length) {
      renderSearchResults(query);
      return;
    }

    searchState.activeIndex = Math.min(Math.max(searchState.activeIndex, 0), searchState.results.length - 1);
    document.getElementById('search-status').textContent = `Restored ${searchState.results.length} cached matches for "${query}"`;
    container.innerHTML = renderResultList(query, searchState.results, true);
  }
  function activateSearchResult(index, navigate) {
    if (index < 0 || index >= searchState.results.length) return;
    searchState.activeIndex = index;
    document.querySelectorAll('.search-result').forEach((node, nodeIndex) => {
      node.classList.toggle('active', nodeIndex === index);
    });

    if (!navigate) return;

    const result = searchState.results[index];
    const targetId = result.targetId || result.anchorId || null;
    show(result.sectionId, {
      scrollTop: !targetId,
      targetId,
      glowTarget: Boolean(targetId),
    });
    closeSearchModal();
  }

  function openSearchModal() {
    const modal = document.getElementById('search-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const input = document.getElementById('search-input');
    input.value = searchState.query;
    input.focus();
    input.select();
    renderRestoredSearch();
  }

  function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function show(id, options = {}) {
    navigateTo(id, options);
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  document.getElementById('search-modal').addEventListener('click', (event) => {
    if (event.target.id === 'search-modal') closeSearchModal();
  });

  document.getElementById('search-input').addEventListener('input', (event) => {
    handleSearchInput(event.target.value);
  });

  document.addEventListener('keydown', (event) => {
    syncModifierNavigationState(event);
    const modalOpen = document.getElementById('search-modal').classList.contains('open');

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (modalOpen) closeSearchModal();
      else openSearchModal();
      return;
    }

    if (!modalOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearchModal();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activateSearchResult(Math.min(searchState.activeIndex + 1, searchState.results.length - 1), false);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      activateSearchResult(Math.max(searchState.activeIndex - 1, 0), false);
      return;
    }

    if (event.key === 'Enter' && searchState.activeIndex >= 0) {
      event.preventDefault();
      activateSearchResult(searchState.activeIndex, true);
    }
  });

  document.addEventListener('keyup', syncModifierNavigationState);
  window.addEventListener('blur', () => {
    document.body.classList.remove('mod-nav-active');
  });

  window.addEventListener('popstate', event => {
    const fallback = parseLocationState();
    const state = event.state || {
      sectionId: fallback.sectionId,
      targetId: fallback.targetId,
      scrollY: fallback.targetId ? null : 0,
    };

    navigateTo(state.sectionId, {
      scrollTop: !state.targetId && state.scrollY == null,
      targetId: state.targetId || null,
      glowTarget: Boolean(state.targetId),
      historyMode: 'pop',
      restoreScrollY: typeof state.scrollY === 'number' ? state.scrollY : null,
    });
  });

  buildSearchIndex();
  activateInlineCodeReferences();
  initializeCopyCodeButtons();
  restoreSearchSnapshot();
  document.getElementById('search-input').value = searchState.query;
  renderRestoredSearch();
  const initialNavigation = parseLocationState();
  navigateTo(initialNavigation.sectionId, {
    scrollTop: !initialNavigation.targetId,
    targetId: initialNavigation.targetId,
    glowTarget: Boolean(initialNavigation.targetId),
    historyMode: 'replace',
  });
