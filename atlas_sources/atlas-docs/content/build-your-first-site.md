---
tag: Guides
title: Build your first site
lead: |
  The shortest end-to-end flow is: initialize a source tree, edit the generated Markdown files, and run the build command to produce a static `index.html`.
---

## Initialize the source tree

```bash
atlas-docs init my-docs
```

That creates:

```text
my-docs/
  metadata.md
  navigation.md
  assets.md
  content/
    introduction.md
```

## Edit the source

Update `metadata.md` with project identity and colors, define groups in `navigation.md`, then add matching `content/*.md` files for every nav entry.

:::callout warn
If a slug appears in `navigation.md` and the matching file is missing from `content/`, the loader raises `FileNotFoundError` during build.
:::

## Build the HTML

```bash
atlas-docs build my-docs --out dist/index.html
```

The generated file contains all sections, styles, and behavior in one HTML document.

## Preview locally

```bash
atlas-docs serve my-docs --port 8000
```

That command builds a preview into `.atlas-preview/index.html` by default, then serves the output directory over a local HTTP server.

:::quick_links
- [doc:command-init] - Create a starter Atlas tree
- [doc:command-build] - Compile a source tree into HTML
- [doc:format-content] - Write section files correctly
:::
