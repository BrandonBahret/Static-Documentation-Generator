---
tag: Architecture
title: Renderer and themes
lead: |
  `renderer.py` and `theme.py` turn a loaded site into the final document by choosing the active theme, layering metadata overrides, serializing search/navigation state, and rendering the Jinja base template.
---

## Build path

`build_site()` does four main things:

1. Loads the site model from source files.
2. Resolves the active theme and optional alternate color-scheme variant.
3. Concatenates CSS and bundled JavaScript modules.
4. Renders `templates/base.html.j2` with the site payload and serialized config.

## Theme family behavior

Atlas currently ships one theme family with two variants:

:::table
| Theme | Color scheme | Notes |
|-------|--------------|-------|
| `atlas_dark` | `dark` | Default theme for CLI build output |
| `atlas_light` | `light` | Alternate variant in the same family |
:::

If the chosen theme belongs to a known family, Atlas can resolve an alternate theme name and expose a color-scheme toggle in the generated site configuration.

## Metadata overrides

The theme loader lets site metadata override:

- accent color for the active scheme
- display, body, and mono fonts
- font source URL
- default color scheme

## Search and navigation payload

The renderer serializes a JSON config object with section metadata, theme metadata, search copy, and feature flags. The client-side JavaScript uses that payload to drive section routing, search indexing, and user settings.
