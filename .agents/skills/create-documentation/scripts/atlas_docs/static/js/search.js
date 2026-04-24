const ATLAS_SEARCH_STORAGE_RESULT_LIMIT = 6;

const atlasSemanticAliases = {
  hydration: ["hydrate", "hydrated", "hydrating", "typed", "model", "models", "cast", "apimodel", "get_object"],
  hydrate: ["hydration", "hydrated", "typed", "cast", "apimodel"],
  typed: ["hydration", "hydrate", "apimodel", "model", "models", "cast"],
  model: ["models", "typed", "hydration", "apimodel", "cast"],
  models: ["model", "typed", "hydration", "apimodel", "cast"],
  apimodel: ["typed", "hydration", "model", "models", "cast", "alias", "timestamp", "lazy"],
  cast: ["typed", "hydration", "apimodel", "model"],
  ttl: ["expiry", "freshness", "stale", "cache"],
  expiry: ["ttl", "stale", "freshness"],
  stale: ["ttl", "expiry", "freshness"],
  selectors: ["selector", "query", "jsoninjester", "path"],
  selector: ["selectors", "query", "jsoninjester", "path"],
  query: ["selector", "selectors", "jsoninjester", "path"],
  jsoninjester: ["query", "selector", "selectors", "path"],
  tutorial: ["jsonplaceholder", "example", "walkthrough", "apiwrapper"],
  tutorials: ["tutorial", "jsonplaceholder", "example", "walkthrough"],
  jsonplaceholder: ["tutorial", "example", "apiwrapper", "alias", "cast"],
  example: ["tutorial", "jsonplaceholder", "walkthrough"],
};

function normalizeSearchText(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9_@.\- ]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeSearch(text) {
  return normalizeSearchText(text).split(" ").map(token => token.trim()).filter(token => token.length > 1);
}

function splitSearchToken(token) {
  const raw = normalizeSearchText(token).replace(/^[._-]+|[._-]+$/g, "");
  if (!raw) return [];

  const parts = raw
    .split(/[._-]+/)
    .map(part => part.trim())
    .filter(part => part.length > 1);

  const dottedParts = raw
    .replace(/\.+$/g, "")
    .split(".")
    .map(part => part.trim())
    .filter(Boolean);

  const dottedPrefixes = [];
  for (let i = 1; i <= dottedParts.length; i += 1) {
    const prefix = dottedParts.slice(0, i).join(".");
    if (prefix.length > 1) dottedPrefixes.push(prefix);
  }

  return uniqueSearchItems([raw, ...parts, ...dottedPrefixes]);
}

function tokenizeStructuredSearch(text) {
  return uniqueSearchItems(
    tokenizeSearch(text)
      .flatMap(token => splitSearchToken(token))
      .filter(token => token.length > 1)
  );
}

function uniqueSearchItems(items) {
  return Array.from(new Set(items));
}

function getSearchStorageKey() {
  const siteName = Atlas.config.siteName || Atlas.config.metadata?.name || "atlas-docs";
  return `atlas-docs-search-v2:${atlasSlugify(siteName) || "docs"}`;
}

function getSearchStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function trimStoredSearchQuery(query) {
  return typeof query === "string" ? query.slice(0, 240) : "";
}

function persistSearchSnapshot() {
  const storage = getSearchStorage();
  if (!storage) return;

  const snapshot = {
    query: trimStoredSearchQuery(Atlas.state.searchQuery || ""),
    activeIndex: Math.max(Atlas.state.activeResult || -1, -1),
    resultIds: (Atlas.state.results || [])
      .slice(0, ATLAS_SEARCH_STORAGE_RESULT_LIMIT)
      .map(result => result.id)
      .filter(Boolean),
  };

  if (!snapshot.query && !snapshot.resultIds.length) {
    storage.removeItem(getSearchStorageKey());
    return;
  }

  try {
    storage.setItem(getSearchStorageKey(), JSON.stringify(snapshot));
  } catch {
    storage.removeItem(getSearchStorageKey());
  }
}

function restoreSearchSnapshot() {
  const storage = getSearchStorage();
  if (!storage) return;

  let snapshot = null;
  try {
    snapshot = JSON.parse(storage.getItem(getSearchStorageKey()) || "null");
  } catch {
    storage.removeItem(getSearchStorageKey());
    return;
  }

  if (!snapshot || typeof snapshot !== "object") return;

  Atlas.state.searchQuery = trimStoredSearchQuery(snapshot.query);
  const chunkById = new Map((Atlas.state.chunks || []).map(chunk => [chunk.id, chunk]));
  const resultIds = Array.isArray(snapshot.resultIds) ? snapshot.resultIds : [];

  Atlas.state.results = resultIds
    .map(id => chunkById.get(id))
    .filter(Boolean)
    .map((chunk, index) => ({
      ...chunk,
      score: ATLAS_SEARCH_STORAGE_RESULT_LIMIT - index,
      matchedTerms: [],
    }));

  Atlas.state.activeResult = Atlas.state.results.length
    ? Math.min(Math.max(snapshot.activeIndex || 0, 0), Atlas.state.results.length - 1)
    : -1;
}

function buildSearchTrigrams(value) {
  const text = `  ${normalizeSearchText(value)}  `;
  const grams = new Set();
  for (let i = 0; i < text.length - 2; i += 1) {
    grams.add(text.slice(i, i + 3));
  }
  return grams;
}

function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection += 1;
  });
  return intersection / (setA.size + setB.size - intersection);
}

function expandQueryTokens(query) {
  const tokens = tokenizeSearch(query);
  const expanded = [...tokens];
  tokens.forEach(token => {
    const aliases = atlasSemanticAliases[token];
    if (aliases) expanded.push(...aliases);
    if (token.endsWith("s")) expanded.push(token.slice(0, -1));
    else expanded.push(`${token}s`);
  });
  return uniqueSearchItems(expanded.filter(token => token.length > 1));
}

function isCodeLikeQuery(query) {
  return /\b(from|import|class|def)\b|[._()]/i.test(query || "");
}

function bestTokenSimilarity(token, candidateSet) {
  if (!token || !candidateSet?.size) return 0;
  const tokenTrigrams = buildSearchTrigrams(token);
  let best = 0;
  candidateSet.forEach(candidate => {
    if (Math.abs(candidate.length - token.length) > 3) return;
    const similarity = jaccardSimilarity(tokenTrigrams, buildSearchTrigrams(candidate));
    if (similarity > best) best = similarity;
  });
  return best;
}

function tokenWindowScore(text, tokens) {
  if (!text || !tokens.length) return 0;
  const hits = tokens
    .map(token => ({ token, index: text.indexOf(token) }))
    .filter(hit => hit.index >= 0)
    .sort((a, b) => a.index - b.index);

  if (!hits.length) return 0;
  if (hits.length === 1) return (1 / tokens.length) * 8;

  const first = hits[0];
  const last = hits[hits.length - 1];
  const span = Math.max((last.index + last.token.length) - first.index, 1);
  const coverage = hits.length / tokens.length;
  const compactness = Math.min(1, (hits.length * 18) / span);
  return (coverage * 24) + (compactness * 12);
}

function resultTitle(result) {
  if (!result) return "";
  if (result.heading === "Overview" || result.heading === result.sectionTitle) {
    return result.sectionTitle;
  }
  return `${result.sectionTitle} - ${result.heading}`;
}

function resultPath(sectionTitle, heading) {
  if (heading === "Overview" || heading === sectionTitle) return sectionTitle;
  return `${sectionTitle} / ${heading}`;
}

function makeSearchChunk({ id, sectionId, sectionTitle, heading, anchorId, targetId, text, sourceType, ordinal }) {
  const normalizedText = normalizeSearchText(text);
  return {
    id,
    sectionId,
    sectionTitle,
    heading,
    anchorId,
    targetId,
    text,
    normalizedText,
    tokenSet: new Set(tokenizeSearch(text)),
    structuredTokenSet: new Set(tokenizeStructuredSearch(text)),
    trigramSet: buildSearchTrigrams(text),
    sourceType,
    ordinal,
    path: resultPath(sectionTitle, heading),
  };
}

function buildSearchIndex() {
  const chunks = [];

  document.querySelectorAll(".section").forEach(section => {
    const sectionId = section.dataset.section;
    const sectionTitle = section.querySelector(".page-title")?.textContent?.trim() || Atlas.config.sections[sectionId]?.label || sectionId;
    let currentHeading = sectionTitle;
    let currentAnchor = section.id;
    let chunkCounter = 0;

    const heroLead = section.querySelector(".page-lead")?.textContent?.trim();
    if (heroLead) {
      const heroChunkId = `${sectionId}-hero`;
      const heroNode = section.querySelector(".page-hero");
      if (heroNode && !heroNode.id) heroNode.id = heroChunkId;
      const heroTarget = section.querySelector(".page-lead") || heroNode;
      if (heroTarget && !heroTarget.id) heroTarget.id = `${heroChunkId}-target`;

      chunks.push(makeSearchChunk({
        id: heroChunkId,
        sectionId,
        sectionTitle,
        heading: "Overview",
        anchorId: heroNode?.id || heroChunkId,
        targetId: heroTarget?.id || `${heroChunkId}-target`,
        text: heroLead,
        sourceType: "hero",
        ordinal: chunkCounter++,
      }));
    }

    section.querySelectorAll("h2, h3, p, li, pre, .callout, .method, td, .card").forEach(node => {
      if (node.matches("h2, h3")) {
        currentHeading = node.textContent.trim();
        if (!node.id) node.id = `${sectionId}-${atlasSlugify(currentHeading) || chunkCounter}`;
        currentAnchor = node.id;
        return;
      }

      const text = (node.innerText || node.textContent || "").trim();
      if (!text || text.length < 20) return;
      if (!node.id) node.id = `${sectionId}-${chunkCounter}-target`;

      chunks.push(makeSearchChunk({
        id: `${sectionId}-${chunkCounter}`,
        sectionId,
        sectionTitle,
        heading: currentHeading,
        anchorId: currentAnchor,
        targetId: node.id,
        text,
        sourceType: node.tagName.toLowerCase(),
        ordinal: chunkCounter++,
      }));
    });
  });

  Atlas.state.chunks = chunks;
  const status = document.getElementById("search-status");
  if (status) status.textContent = `Indexed ${chunks.length} local chunks`;
}

function scoreClassicQuery(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const rawTokens = tokenizeSearch(trimmed);
  const expandedTokens = expandQueryTokens(trimmed);
  const structuredTokens = tokenizeStructuredSearch(trimmed);
  const queryTrigrams = buildSearchTrigrams(trimmed);
  const codeLikeQuery = isCodeLikeQuery(trimmed);

  return (Atlas.state.chunks || [])
    .map(chunk => {
      let exactScore = 0;
      let fuzzyScore = 0;
      let semanticScore = 0;
      let structureScore = 0;
      let headingScore = 0;
      let titleScore = 0;
      const matchedTerms = [];
      const matchedRawTokens = new Set();
      const matchedStructuredTokens = new Set();

      rawTokens.forEach(token => {
        if (chunk.normalizedText.includes(token)) {
          exactScore += 12;
          matchedTerms.push(token);
          matchedRawTokens.add(token);
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

      structuredTokens.forEach(token => {
        if (chunk.structuredTokenSet.has(token)) {
          structureScore += rawTokens.includes(token) ? 8 : 4.5;
          matchedStructuredTokens.add(token);
          matchedTerms.push(token);
          return;
        }

        const similarity = token.length >= 4 ? bestTokenSimilarity(token, chunk.structuredTokenSet) : 0;
        if (similarity >= 0.45) {
          structureScore += similarity * (rawTokens.includes(token) ? 7 : 4);
          matchedStructuredTokens.add(token);
        }
      });

      fuzzyScore = jaccardSimilarity(queryTrigrams, chunk.trigramSet) * 30;

      if (chunk.sourceType === "hero") semanticScore += 4;
      if (chunk.sourceType === "pre" && rawTokens.some(token => chunk.normalizedText.includes(token))) semanticScore += 2;

      const rawCoverage = rawTokens.length ? (matchedRawTokens.size / rawTokens.length) : 0;
      const structuredCoverage = structuredTokens.length ? (matchedStructuredTokens.size / structuredTokens.length) : rawCoverage;
      const coverageScore = (rawCoverage * 26) + (structuredCoverage * 20);
      const proximityScore = tokenWindowScore(chunk.normalizedText, Array.from(matchedStructuredTokens));
      const missingPenalty = rawTokens.length >= 3 ? (rawTokens.length - matchedRawTokens.size) * 6.5 : 0;

      if (codeLikeQuery) {
        if (chunk.sourceType === "pre") structureScore += 14;
        if (chunk.sourceType === "td") structureScore += 5;
        if (chunk.sourceType === "hero") structureScore -= 6;
        if (chunk.sourceType === "p" || chunk.sourceType === "li") structureScore -= 1.5;
      }

      return {
        ...chunk,
        score: exactScore + fuzzyScore + semanticScore + structureScore + headingScore + titleScore + coverageScore + proximityScore - missingPenalty,
        matchedTerms: uniqueSearchItems(matchedTerms).slice(0, 6),
      };
    })
    .filter(result => result.score >= 8)
    .sort((a, b) => b.score - a.score || a.ordinal - b.ordinal)
    .slice(0, 24);
}

function dedupeSearchResults(results, limit = 12) {
  const deduped = [];
  const seenKeys = new Set();

  results.forEach(result => {
    if (deduped.length >= limit) return;
    const key = `${result.sectionId}::${result.heading}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    deduped.push(result);
  });

  return deduped;
}

function searchDocs(query) {
  return Promise.resolve(dedupeSearchResults(scoreClassicQuery(query)));
}

function escapeSearchRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectSearchRanges(text, query) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  const queryText = String(query || "").replace(/\s+/g, " ").trim();
  if (!raw || !queryText) return [];

  const phraseTokens = tokenizeSearch(queryText);
  if (phraseTokens.length) {
    const phrasePattern = phraseTokens.map(token => escapeSearchRegex(token)).join("[^a-z0-9_@.\\-]+");
    const phraseRegex = new RegExp(phrasePattern, "i");
    const phraseMatch = phraseRegex.exec(raw);
    if (phraseMatch) {
      return [{
        start: phraseMatch.index,
        end: phraseMatch.index + phraseMatch[0].length,
        weight: phraseMatch[0].length + 200,
      }];
    }
  }

  const terms = uniqueSearchItems([
    ...tokenizeSearch(queryText),
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
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  const ranges = collectSearchRanges(raw, query);
  if (!ranges.length) return atlasEscapeHtml(raw);

  let cursor = 0;
  let html = "";

  ranges.forEach(range => {
    if (range.start > cursor) html += atlasEscapeHtml(raw.slice(cursor, range.start));
    html += `<mark class="search-hit">${atlasEscapeHtml(raw.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  });

  if (cursor < raw.length) html += atlasEscapeHtml(raw.slice(cursor));
  return html;
}

function snippetFor(result, query) {
  const raw = String(result?.text || "").replace(/\s+/g, " ").trim();
  const bestRange = bestSearchRange(raw, query);
  const startIndex = bestRange ? bestRange.start : 0;
  const hitLength = bestRange ? Math.max(bestRange.end - bestRange.start, 0) : 0;
  const start = Math.max(0, startIndex - 70);
  const end = Math.min(raw.length, startIndex + hitLength + 140);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < raw.length ? "..." : "";
  return `${prefix}${raw.slice(start, end).trim()}${suffix}`;
}

function renderSearchResultsList(query, results, restored = false) {
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
    ` : ""}
    ${results.map((result, index) => `
      <article class="search-result${index === Atlas.state.activeResult ? " active" : ""}" data-search-index="${index}" data-search-section="${result.sectionId}" data-search-target="${result.targetId || result.anchorId || ""}" aria-selected="${index === Atlas.state.activeResult ? "true" : "false"}">
        <div class="search-result-top">
          <div class="search-result-path">${atlasEscapeHtml(result.path)}</div>
          <div class="search-result-score">score ${Math.round(result.score)}</div>
        </div>
        <div class="search-result-title">${renderSearchHighlight(resultTitle(result), query)}</div>
        <div class="search-result-preview">${renderSearchHighlight(snippetFor(result, query), query)}</div>
      </article>
    `).join("")}
  `;
}

function searchEmptyStateHtml() {
  const search = Atlas.config.search || {};
  const hint = atlasEscapeHtml(search.secondaryHint || "Search the local docs. Try docs, guides, examples.");
  return `<div class="search-empty"><strong>${hint}</strong></div>`;
}

function setActiveSearchResult(index) {
  const items = Array.from(document.querySelectorAll("#search-results [data-search-index]"));
  if (!items.length) {
    Atlas.state.activeResult = -1;
    return;
  }

  const nextIndex = Math.min(Math.max(index, 0), items.length - 1);
  Atlas.state.activeResult = nextIndex;

  items.forEach((item, itemIndex) => {
    const isActive = itemIndex === nextIndex;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  items[nextIndex]?.scrollIntoView({ block: "nearest" });
}

function openActiveSearchResult() {
  const activeResult = Atlas.state.results[Atlas.state.activeResult];
  if (!activeResult) return;
  closeSearch();
  showSection(activeResult.sectionId, true, activeResult.targetId || activeResult.anchorId || "");
}

function bindRenderedSearchResults() {
  document.querySelectorAll("#search-results [data-search-index]").forEach(item => {
    item.addEventListener("click", () => {
      setActiveSearchResult(Number(item.dataset.searchIndex || 0));
      openActiveSearchResult();
    });
  });
}

async function renderSearchResults(query) {
  const container = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  if (!container || !status) return;

  if (!query.trim()) {
    Atlas.state.results = [];
    Atlas.state.activeResult = -1;
    container.innerHTML = searchEmptyStateHtml();
    status.textContent = `Indexed ${Atlas.state.chunks.length} local chunks`;
    persistSearchSnapshot();
    return;
  }

  const requestId = Symbol("search-request");
  Atlas.state.searchLastRequestId = requestId;
  status.textContent = `Searching "${query}"...`;

  let results = [];
  try {
    results = await searchDocs(query);
  } catch (error) {
    console.error("Search failed", error);
    if (Atlas.state.searchLastRequestId !== requestId) return;
    Atlas.state.results = [];
    Atlas.state.activeResult = -1;
    status.textContent = "Search failed to load.";
    container.innerHTML = `
      <div class="search-empty">
        <strong>Search is temporarily unavailable.</strong>
        Reload the page and try again.
      </div>
    `;
    persistSearchSnapshot();
    return;
  }

  if (Atlas.state.searchLastRequestId !== requestId) return;

  Atlas.state.results = results;
  Atlas.state.activeResult = results.length ? 0 : -1;
  status.textContent = results.length ? `${results.length} matches for "${query}"` : `No matches for "${query}"`;
  container.innerHTML = renderSearchResultsList(query, results);
  bindRenderedSearchResults();
  persistSearchSnapshot();
}

function renderRestoredSearch() {
  const query = Atlas.state.searchQuery || "";
  const container = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  if (!container || !status) return;

  if (!query.trim() || !Atlas.state.results.length) {
    renderSearchResults(query);
    return;
  }

  Atlas.state.activeResult = Math.min(Math.max(Atlas.state.activeResult, 0), Atlas.state.results.length - 1);
  status.textContent = `Restored ${Atlas.state.results.length} cached matches for "${query}"`;
  container.innerHTML = renderSearchResultsList(query, Atlas.state.results, true);
  bindRenderedSearchResults();
}

function handleSearchInput(value) {
  Atlas.state.searchQuery = value;
  persistSearchSnapshot();
  renderSearchResults(value);
}

function openSearch() {
  if (typeof closeSettingsModal === "function") closeSettingsModal();
  const modal = document.getElementById("search-modal");
  const input = document.getElementById("search-input");
  if (!modal || !input) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  input.value = Atlas.state.searchQuery || "";
  input.focus();
  input.select();
  renderRestoredSearch();
}

function closeSearch() {
  const modal = document.getElementById("search-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function bindSearch() {
  if (Atlas.config.features && Atlas.config.features.search === false) return;

  Atlas.state.searchQuery ||= "";
  Atlas.state.searchLastRequestId ||= null;

  buildSearchIndex();
  restoreSearchSnapshot();

  const input = document.getElementById("search-input");
  if (input) input.value = Atlas.state.searchQuery || "";

  document.querySelector("[data-open-search]")?.addEventListener("click", openSearch);
  document.querySelector("[data-close-search]")?.addEventListener("click", closeSearch);
  document.getElementById("search-modal")?.addEventListener("click", event => {
    if (event.target?.id === "search-modal") closeSearch();
  });
  document.getElementById("search-input")?.addEventListener("input", event => handleSearchInput(event.target.value));

  renderRestoredSearch();

  document.addEventListener("keydown", event => {
    const modal = document.getElementById("search-modal");
    const modalOpen = modal?.classList.contains("open");

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (modalOpen) closeSearch();
      else openSearch();
      return;
    }

    if (!modalOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchResult(Math.min(Atlas.state.activeResult + 1, Atlas.state.results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchResult(Math.max(Atlas.state.activeResult - 1, 0));
      return;
    }

    if (event.key === "Enter" && Atlas.state.activeResult >= 0) {
      event.preventDefault();
      openActiveSearchResult();
    }
  });
}
