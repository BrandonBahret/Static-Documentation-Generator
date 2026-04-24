---
tag: Internals
title: Render pipeline
lead: |
  Atlas separates loading, markdown compilation, theme resolution, templating,
  and client-side behavior into distinct modules inside `src/atlas_docs/`.
breadcrumb: "atlas docs / render pipeline"
---

## Pipeline stages

:::table
| Stage | Module | Responsibility |
|-------|--------|----------------|
| 1 | `loader.py` | Reads frontmatter files, repairs mojibake when possible, validates navigation targets, and constructs the in-memory `Site` model. |
| 2 | `markdown.py` | Expands Atlas-specific link syntax, directives, assets, heading anchors, and Python code highlighting before returning section HTML. |
| 3 | `theme.py` | Resolves theme directories, applies metadata-driven accent and typography overrides, and renders CSS tokens for primary and alternate schemes. |
| 4 | `renderer.py` | Loads the site, bundles CSS and JavaScript, assembles `window.__ATLAS_DOCS__`, and renders the final HTML template. |
| 5 | `templates/` + `static/js/` | Deliver the shell, sidebar, modals, and browser behaviors for navigation, search, settings, and copy-code actions. |
:::

## Loader model

The data model is intentionally small:

:::selector_list
### `NavEntry`
Stores the visible label, target slug or external URL, and whether the link is
external.

### `NavGroup`
Represents one labeled sidebar group with ordered entries.

### `Section`
Carries the slug, label, hero metadata, compiled body HTML, search text, and
raw frontmatter.

### `Site`
Combines metadata, nav groups, sections, footer links, and assets while also
exposing the default section.
:::

## Theme behavior

The shipped theme family is `atlas`, with `atlas_dark` and `atlas_light`
variants. `theme.py` can choose the active variant from the requested theme name
and `metadata.md` color scheme, then optionally load the opposite variant so the
generated UI can support a light/dark toggle.

:::callout info
Metadata can override the accent color per scheme through `accent_dark` and
`accent_light`, while typography fields such as `display_font`, `body_font`, and
`mono_font` override the bundled theme defaults.
:::

## Output model

`renderer.py` emits one HTML file with all sections already present in the DOM.
The browser runtime swaps the active section client-side rather than loading
separate pages.

```text
Atlas source -> Site model -> themed HTML shell -> single static index.html
```

## Search and settings

The base template injects `window.__ATLAS_DOCS__` with:

:::table
| Key | Purpose |
|-----|---------|
| `defaultSection` | The first non-external navigation target |
| `sections` | Section labels, breadcrumbs, and frontmatter metadata |
| `features` | Runtime feature flags such as search |
| `metadata` | Site-level identity and UI copy |
| `theme` | Current scheme, toggle support, and supported palette variants |
| `search` | Placeholder text and empty-state labels |
:::

That payload is consumed by the bundled JavaScript modules that power the docs
UI.
