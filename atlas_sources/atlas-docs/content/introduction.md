---
tag: Overview
title: Atlas Docs
title_em: "."
lead: |
  Atlas Docs is a Python package and CLI for compiling a structured Markdown source tree into a single-page documentation site with sidebar navigation, search, themed typography, and interactive reference blocks.
---

## What it is

@asset[hero-atlas-visual]

Atlas Docs has two layers:

- The reusable package in `src/atlas_docs/`, which loads Atlas source files, renders Markdown and directives, and emits a static HTML document.
- The higher-level authoring workflow defined in `ATLAS_DOCS_FORMAT.md` and the `create-documentation` Codex skill, which generates that source tree from a project.

:::feature_grid
### Single-page output {icon=HTML}
Compile one source directory into a standalone `index.html` that contains all sections and client-side navigation.

### Structured authoring {icon=MD}
Keep project identity, navigation, assets, and section content in separate files instead of mixing them together.

### Reference-friendly blocks {icon=API}
Use `:::method`, `:::table`, `:::cards`, `:::callout`, and other Atlas directives to make technical docs denser and easier to scan.
:::

## What Atlas builds

The generator expects a source directory with `metadata.md`, `navigation.md`, `assets.md`, and `content/*.md`. The CLI then parses those files, resolves section order from the navigation file, renders each content page to HTML, and injects CSS and JavaScript from the selected theme.

:::cards
### Understand the workflow {link=how-atlas-works}
Start with the mental model for how source files become sections, search text, and navigation state.

### Build a site quickly {link=build-your-first-site}
Follow the shortest path from an empty folder to a generated HTML file.

### Jump to command reference {link=command-build}
Look up the exact `atlas-docs` command signatures and output behavior.
:::

## Repository scope

This repository currently exposes three CLI commands through Typer: `init`, `build`, and `serve`. It also bundles two related themes, `atlas_dark` and `atlas_light`, and switches between them based on the site metadata plus theme family rules in [doc:architecture-renderer].

:::callout info
The documentation here describes the current repository state at version `0.1.0` from [`pyproject.toml`](https://github.com/BrandonBahret/Static-Documentation-Generator/blob/main/pyproject.toml).
:::
