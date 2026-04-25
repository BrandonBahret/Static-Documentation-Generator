---
tag: Concepts
title: How Atlas Works
lead: |
  The Atlas workflow is a pipeline: source files define site structure, the loader resolves them into a typed site model, the Markdown renderer expands Atlas directives, and the renderer emits a themed HTML document.
---

## Pipeline

The build path is straightforward:

1. Resolve the source root from the path you pass to the CLI.
2. Read `metadata.md`, `navigation.md`, and `assets.md`.
3. Convert navigation entries into section labels and slugs.
4. Load each `content/*.md` file referenced by the nav.
5. Render prose, cross-section links, inline code refs, directives, headings, and code blocks.
6. Render a Jinja template with the site payload, theme CSS, and bundled JavaScript.

:::table
| Stage | Module | Responsibility |
|-------|--------|----------------|
| Source discovery | `loader.py` | Validates the Atlas directory and maps nav labels to slugs |
| Markdown rendering | `markdown.py` | Expands custom syntax such as `[doc:slug]` and `:::method` |
| HTML output | `renderer.py` | Builds final HTML, CSS, JavaScript, and serialized site config |
| Theme resolution | `theme.py` | Loads the active theme, applies metadata overrides, and computes alternate scheme support |
:::

## Source files and their roles

The source format deliberately splits identity, navigation, assets, and content into separate files. That keeps docs maintainable:

- `metadata.md` controls branding, fonts, theme accents, and search copy.
- `navigation.md` defines the sidebar groups and determines the order of all sections.
- `assets.md` names SVGs and images so content pages can refer to them indirectly.
- `content/*.md` contains the actual prose and Atlas directive blocks.

Readers in a lookup mode care most about `navigation.md` and the section pages. Authors care most about a predictable structure. Atlas uses the same split for both.

## Why it stays single-page

The generated output includes all sections in the DOM at once. Navigation and cross-section links switch the active section client-side instead of issuing page loads. That gives Atlas its reference-manual feel while still letting content stay split across source files.

:::callout info
Search works against section metadata plus rendered section text. Atlas serializes a site configuration payload into the page so the JavaScript can drive navigation and local search.
:::
