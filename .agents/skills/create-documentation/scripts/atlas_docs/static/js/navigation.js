function updateHistory(slug, targetId = "", mode = "push") {
  const hash = targetId ? `#section-${slug}:${targetId}` : `#section-${slug}`;
  const state = { slug, targetId };

  if (mode === "replace") {
    history.replaceState(state, "", hash);
    return;
  }

  if (location.hash === hash) {
    history.replaceState(state, "", hash);
    return;
  }

  history.pushState(state, "", hash);
}

function clearActiveSectionTarget() {
  if (Atlas.state.activeTarget) {
    Atlas.state.activeTarget.classList.remove("search-target-glow");
    Atlas.state.activeTarget = null;
  }

  if (Atlas.state.activeTargetTimer) {
    clearTimeout(Atlas.state.activeTargetTimer);
    Atlas.state.activeTargetTimer = null;
  }
}

function scrollAndGlowTarget(target, options = {}) {
  if (!target) return;

  const { glow = true, behavior = "smooth" } = options;
  clearActiveSectionTarget();

  const topbarHeight = document.querySelector(".topbar")?.offsetHeight || 0;
  const extraOffset = 24;
  const targetTop = window.scrollY + target.getBoundingClientRect().top - topbarHeight - extraOffset;

  window.scrollTo({ top: Math.max(targetTop, 0), behavior });
  window.getSelection?.()?.removeAllRanges?.();

  if (!glow) return;

  target.classList.remove("search-target-glow");
  void target.offsetWidth;
  target.classList.add("search-target-glow");

  Atlas.state.activeTarget = target;
  Atlas.state.activeTargetTimer = window.setTimeout(() => {
    target.classList.remove("search-target-glow");
    if (Atlas.state.activeTarget === target) Atlas.state.activeTarget = null;
    Atlas.state.activeTargetTimer = null;
  }, 1800);
}

function finalizeSectionTarget(targetId, options = {}) {
  if (!targetId) return;

  const { glow = true, behavior = "smooth" } = options;
  window.setTimeout(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    scrollAndGlowTarget(target, { glow, behavior });
  }, 30);
}

function setSidebarOpen(open) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("open", open);
  document.body.classList.toggle("sidebar-open", open);
}

function closeSidebar() {
  setSidebarOpen(false);
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  setSidebarOpen(!sidebar.classList.contains("open"));
}

function showSection(slug, push = true, targetId = "", historyMode = "push") {
  const target = document.getElementById(`section-${slug}`);
  if (!target) return;

  document.querySelectorAll(".section").forEach(section => section.classList.toggle("active", section === target));
  document.querySelectorAll("[data-section-link]").forEach(link => {
    link.classList.toggle("active", link.dataset.sectionLink === slug);
  });

  const meta = Atlas.config.sections[slug] || {};
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb && meta.breadcrumb) {
    const parts = meta.breadcrumb.split("/");
    breadcrumb.innerHTML = parts.map((part, index) => index ? `<span>/</span> ${atlasEscapeHtml(part.trim())}` : atlasEscapeHtml(part.trim())).join(" ");
  }

  Atlas.state.activeSection = slug;
  closeSidebar();

  if (push) updateHistory(slug, targetId, historyMode);
  if (targetId) {
    finalizeSectionTarget(targetId, {
      glow: push,
      behavior: historyMode === "replace" ? "auto" : "smooth",
    });
    return;
  }

  clearActiveSectionTarget();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function bindInlineReferences() {
  document.querySelectorAll("code.inline-code-ref[data-section-id]").forEach(node => {
    const match = { sectionId: node.dataset.sectionId, targetId: node.dataset.targetId || "" };
    node.title = match.targetId ? "Ctrl/Cmd+Click to open exact docs reference" : "Ctrl/Cmd+Click to open docs section";
    node.addEventListener("click", event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      event.stopPropagation();
      showSection(match.sectionId || Atlas.config.defaultSection, true, match.targetId || "");
    });
  });
}

function parseHash() {
  const hash = location.hash.replace(/^#/, "");
  if (!hash.startsWith("section-")) {
    return { slug: Atlas.config.defaultSection, targetId: "" };
  }

  const raw = hash.slice("section-".length);
  const separator = raw.indexOf(":");
  if (separator === -1) {
    return { slug: raw || Atlas.config.defaultSection, targetId: "" };
  }

  return {
    slug: raw.slice(0, separator) || Atlas.config.defaultSection,
    targetId: raw.slice(separator + 1),
  };
}

function syncModifierNavigationState(event) {
  document.body.classList.toggle("mod-nav-active", Boolean(event?.ctrlKey || event?.metaKey));
}

function bindNavigation() {
  document.querySelectorAll("[data-section-link], [data-doc-link]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showSection(link.dataset.sectionLink || link.dataset.docLink, true, link.dataset.targetId || "");
    });
  });

  document.querySelectorAll("[data-card-link]").forEach(card => {
    card.addEventListener("click", () => showSection(card.dataset.cardLink, true));
  });

  document.querySelector("[data-toggle-sidebar]")?.addEventListener("click", () => {
    toggleSidebar();
  });
  document.querySelector("[data-sidebar-scrim]")?.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", syncModifierNavigationState);
  document.addEventListener("keyup", syncModifierNavigationState);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSidebar();
  });
  window.addEventListener("blur", () => {
    document.body.classList.remove("mod-nav-active");
  });

  window.addEventListener("popstate", event => {
    const state = event.state || parseHash();
    showSection(state.slug || Atlas.config.defaultSection, false, state.targetId || "", "replace");
  });

  const initial = parseHash();
  showSection(initial.slug || Atlas.config.defaultSection, false, initial.targetId || "", "replace");
  bindInlineReferences();
}
