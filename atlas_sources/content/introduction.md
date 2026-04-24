---
tag: Overview
title: Atlas Docs
lead: |
  Atlas Docs is a Python static-site generator for Atlas-style single-page
  documentation sites, paired with a Codex workflow that can turn repository
  context into a finished docs build.
breadcrumb: "atlas docs / introduction"
---

## What lives in this repository

This repository has two closely related deliverables:

:::feature_grid
### Python package {icon=PY}
`src/atlas_docs/` contains the reusable generator, CLI entry points, templates,
theme definitions, and browser-side JavaScript.

### Source format {icon=MD}
`ATLAS_DOCS_FORMAT.md` defines the directory contract that Atlas consumes:
`metadata.md`, `navigation.md`, `assets.md`, and `content/*.md`.

### Codex workflow {icon=AI}
The `create-documentation` skill sits above the package and writes Atlas source
for a target project before compiling the final static HTML.
:::

## Core workflow

Atlas expects a structured source directory, then compiles it into one
self-contained HTML file with a left-rail navigation model and section-based
routing.

:::cards
### Start with the source format {link=atlas-source-format}
Use the four control files plus one markdown file per section.

### Build with the CLI {link=cli-reference}
Create a skeleton, compile HTML, or run a local preview server.

### Understand the renderer {link=render-pipeline}
The loader, markdown compiler, theme system, templates, and static JS each own
a distinct stage of the build.
:::

## What the generated site includes

:::table
| Area | Implementation |
|------|----------------|
| Navigation | `navigation.md` drives groups, section order, default section, and footer links. |
| Identity | `metadata.md` supplies project naming, version, typography, accent colors, and search copy. |
| Content | `content/*.md` provides frontmatter-driven heroes plus Markdown and Atlas directive blocks. |
| Presentation | Jinja templates and bundled themes render CSS, layout, and light/dark palette variants. |
| Runtime UI | Bundled JavaScript handles section routing, search, settings, copy-code behavior, and color-scheme persistence. |
:::

:::callout info
The repository currently exposes the generator as a Python package and CLI. The
Codex skill is described in the README and packaged separately when distributed
as a standalone skill bundle.
:::

## Repository layout

```text
src/atlas_docs/
  cli.py
  loader.py
  markdown.py
  models.py
  renderer.py
  theme.py
  templates/
  themes/
  static/

ATLAS_DOCS_FORMAT.md
README.md
pyproject.toml
```

:::quick_links
- [doc:quickstart] - Build or preview the docs generator locally
- [doc:atlas-source-format] - Learn the Atlas directory contract
- [doc:render-pipeline] - See how Atlas turns markdown into a single-page site
- [doc:cli-reference] - Review command behavior and options
:::
