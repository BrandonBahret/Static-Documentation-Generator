---
tag: Source Format
title: metadata.md
lead: |
  `metadata.md` defines site identity, theme accents, typography, default color scheme, and search UI copy. It is a frontmatter-only file with no prose body.
---

## Purpose

Use `metadata.md` to set the values that affect the whole site rather than any one page.

:::selector_list
### `name`
Project name shown in the shell, breadcrumb defaults, and site identity.

### `version`
Version badge text rendered in the top shell.

### `tagline`
Short one-line description used in the chrome.

### `accent`, `accent_dark`, `accent_light`
Brand accent colors used by the active theme.

### `display_font`, `body_font`, `mono_font`
Typography choices applied across page titles, prose, and code surfaces.

### `features.search`
Enables the client-side search interface.
:::

## Minimal example

```yaml
---
name: Atlas Docs
version: v0.1.0
tagline: Build single-page documentation sites from Markdown
accent: "#c8f060"
accent_dark: "#c8f060"
accent_light: "#7d9f20"
color_scheme: dark
features:
  search: true
---
```

## Theme overrides

`theme.py` lets metadata override visual choices from the chosen theme family. In practice that means the theme can supply defaults, but project-specific docs can still replace accent colors and fonts without editing theme files directly.
