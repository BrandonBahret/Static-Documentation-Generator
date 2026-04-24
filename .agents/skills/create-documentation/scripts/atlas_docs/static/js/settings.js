const ATLAS_SETTINGS_KEY = "atlas-docs-settings";
const DEFAULT_LINE_WIDTH = 860;
const MIN_LINE_WIDTH = 640;
const MAX_LINE_WIDTH = 1300;

function settingsStorage() {
  try {
    return window.localStorage;
  } catch (_error) {
    return null;
  }
}

function systemPrefersMotion() {
  try {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (_error) {
    return true;
  }
}

function defaultSettings() {
  const defaultColorScheme = Atlas.config.theme?.defaultColorScheme === "light" ? "light" : "dark";
  return {
    colorScheme: defaultColorScheme,
    readableLineLength: false,
    lineWidth: DEFAULT_LINE_WIDTH,
    prefersMotion: systemPrefersMotion(),
  };
}

function normalizeLineWidth(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_LINE_WIDTH;
  return Math.min(MAX_LINE_WIDTH, Math.max(MIN_LINE_WIDTH, Math.round(numeric)));
}

function readSettings() {
  const fallback = defaultSettings();
  const storage = settingsStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(ATLAS_SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
  } catch (_error) {
    return fallback;
  }
}

function writeSettings(nextSettings) {
  Atlas.state.settings = nextSettings;
  const storage = settingsStorage();
  if (!storage) return;

  try {
    storage.setItem(ATLAS_SETTINGS_KEY, JSON.stringify(nextSettings));
  } catch (_error) {
    // Ignore storage failures and keep the in-memory value.
  }
}

function normalizeColorScheme(value) {
  return value === "light" ? "light" : "dark";
}

function applyColorSchemePreference(colorScheme) {
  const normalized = normalizeColorScheme(colorScheme);
  document.documentElement.dataset.colorScheme = normalized;
}

function applyMotionPreference(prefersMotion) {
  const value = prefersMotion ? "true" : "false";
  document.documentElement.dataset.prefersMotion = value;
  document.body.dataset.prefersMotion = value;
}

function applyReadableLineLengthPreference(enabled) {
  const value = enabled ? "true" : "false";
  document.documentElement.dataset.readableLineLength = value;
  document.body.dataset.readableLineLength = value;
}

function applyLineWidthPreference(lineWidth) {
  const normalized = normalizeLineWidth(lineWidth);
  document.documentElement.style.setProperty("--atlas-line-width", `${normalized}px`);
  document.body.style.setProperty("--atlas-line-width", `${normalized}px`);
}

function syncSettingsForm() {
  const colorSchemeInput = document.getElementById("setting-color-scheme");
  if (colorSchemeInput) colorSchemeInput.checked = Atlas.state.settings.colorScheme === "light";

  const readableLineLengthInput = document.getElementById("setting-readable-line-length");
  if (readableLineLengthInput) readableLineLengthInput.checked = !!Atlas.state.settings.readableLineLength;

  const lineWidthInput = document.getElementById("setting-line-width");
  const lineWidthValue = document.getElementById("setting-line-width-value");
  const normalizedLineWidth = normalizeLineWidth(Atlas.state.settings.lineWidth);
  if (lineWidthInput) {
    lineWidthInput.value = String(normalizedLineWidth);
    lineWidthInput.disabled = !Atlas.state.settings.readableLineLength;
  }
  if (lineWidthValue) lineWidthValue.textContent = `${normalizedLineWidth}px`;

  const prefersMotionInput = document.getElementById("setting-prefers-motion");
  if (prefersMotionInput) prefersMotionInput.checked = !!Atlas.state.settings.prefersMotion;
}

function openSettingsModal() {
  if (typeof closeSearch === "function") closeSearch();
  const modal = document.getElementById("settings-modal");
  const trigger = document.querySelector("[data-open-settings]");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
  syncSettingsForm();
  document.getElementById("setting-readable-line-length")?.focus();
}

function closeSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const trigger = document.querySelector("[data-open-settings]");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
}

function updateSetting(name, value) {
  const nextSettings = {
    ...Atlas.state.settings,
    [name]:
      name === "lineWidth"
        ? normalizeLineWidth(value)
        : name === "colorScheme"
          ? normalizeColorScheme(value)
          : value,
  };
  writeSettings(nextSettings);
  if (name === "colorScheme") applyColorSchemePreference(nextSettings.colorScheme);
  if (name === "readableLineLength") applyReadableLineLengthPreference(!!value);
  if (name === "lineWidth") applyLineWidthPreference(nextSettings.lineWidth);
  if (name === "prefersMotion") applyMotionPreference(!!value);
  syncSettingsForm();
}

function bindSettings() {
  const trigger = document.querySelector("[data-open-settings]");
  trigger?.addEventListener("click", () => {
    const modalOpen = document.getElementById("settings-modal")?.classList.contains("open");
    if (modalOpen) closeSettingsModal();
    else openSettingsModal();
  });

  document.querySelector("[data-close-settings]")?.addEventListener("click", closeSettingsModal);
  document.getElementById("settings-modal")?.addEventListener("click", event => {
    if (event.target?.id === "settings-modal") closeSettingsModal();
  });

  document.querySelectorAll("[data-setting]").forEach(input => {
    const applyInputValue = event => {
      const { setting } = event.target.dataset;
      if (!setting) return;
      const value =
        setting === "colorScheme"
          ? (event.target.checked ? "light" : "dark")
          : event.target.type === "checkbox"
            ? !!event.target.checked
            : event.target.value;
      updateSetting(setting, value);
    };

    input.addEventListener("change", applyInputValue);
    if (input.type === "range") input.addEventListener("input", applyInputValue);
  });

  document.addEventListener("keydown", event => {
    const modalOpen = document.getElementById("settings-modal")?.classList.contains("open");
    if (!modalOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeSettingsModal();
    }
  });
}

function initializeSettings() {
  Atlas.state.settings = readSettings();
  Atlas.state.settings.colorScheme = normalizeColorScheme(Atlas.state.settings.colorScheme);
  Atlas.state.settings.lineWidth = normalizeLineWidth(Atlas.state.settings.lineWidth);
  applyColorSchemePreference(Atlas.state.settings.colorScheme);
  applyReadableLineLengthPreference(!!Atlas.state.settings.readableLineLength);
  applyLineWidthPreference(Atlas.state.settings.lineWidth);
  applyMotionPreference(!!Atlas.state.settings.prefersMotion);
  syncSettingsForm();
  bindSettings();
}
