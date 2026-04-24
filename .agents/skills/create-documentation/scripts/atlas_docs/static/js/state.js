const Atlas = {
  config: window.__ATLAS_DOCS__ || { defaultSection: "introduction", sections: {}, features: { search: true } },
  state: {
    activeSection: null,
    chunks: [],
    results: [],
    activeResult: -1,
    refIndex: new Map(),
    activeTarget: null,
    activeTargetTimer: null,
    settings: {},
  },
};

function atlasSlugify(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

function atlasEscapeHtml(text) {
  return (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
