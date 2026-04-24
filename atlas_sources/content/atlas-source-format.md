---
tag: Format
title: Atlas source format
lead: |
  Atlas reads a compact directory contract: site metadata, navigation wiring,
  asset declarations, and one content file per section.
breadcrumb: "atlas docs / atlas source format"
---

## Required layout

```text
my-docs/
  metadata.md
  navigation.md
  assets.md
  content/
    introduction.md
    quickstart.md
    api-reference.md
```

The generator processes the control files first, then compiles section files in
the order declared in `navigation.md`.

## Control files

:::selector_list
### `metadata.md`
Defines project identity, version, tagline, accent colors, typography, search
copy, feature flags, and the default color scheme.

### `navigation.md`
Defines sidebar groups, section labels, slug mapping, default section behavior,
and optional footer links.

### `assets.md`
Declares inline SVGs, bundled images, and remote images that content files can
reference by short name through `@asset[...]`.
:::

## Section files

Every navigable entry in `navigation.md` maps to one file in `content/`.
Frontmatter controls the hero region:

:::table
| Field | Purpose |
|-------|---------|
| `tag` | Small category label above the page title |
| `title` | Generated `<h1>` for the section |
| `title_em` | Optional emphasized suffix appended to the title |
| `lead` | Subtitle paragraph under the title |
| `breadcrumb` | Topbar breadcrumb override |
| `comment` | Optional HTML comment label injected above the section in the output |
:::

## Cross-section and asset syntax

Atlas adds a few authoring shortcuts on top of plain Markdown.

:::table
| Syntax | Effect |
|--------|--------|
| `[doc:slug]` | Link to another section using its nav label |
| `[Label | doc:slug#anchor]` | Link to a specific section heading with custom text |
| `` `token{ref=slug}` `` | Render inline code that can jump to another section |
| `@asset[name]` | Insert a declared SVG or image asset |
:::

## Structured directives

The markdown compiler also recognizes Atlas block directives. The format spec
documents blocks such as `:::feature_grid`, `:::cards`, `:::callout`,
`:::method`, `:::selector_list`, `:::table`, `:::quick_links`, and
`:::reference_list`.

:::callout info
The current implementation includes renderer logic for the directive set in
`src/atlas_docs/markdown.py`. The repository documentation should treat that
code as the implementation source of truth when behavior and examples need to
be reconciled.
:::

## Authoring guidance

:::feature_grid
### Keep navigation explicit {icon=01}
Every non-external nav entry must have a matching `content/<slug>.md` file or
the loader raises `FileNotFoundError`.

### Prefer evidence over invention {icon=02}
When Atlas source is generated for another project, derive setup, API, and
architecture details from repository files or official sources.

### Use assets sparingly {icon=03}
Leave `assets.md` empty when there is nothing worth bundling. The workflow
expects that to be a normal case.
:::

:::quick_links
- [doc:render-pipeline] - See how these source files are loaded and compiled
- [doc:cli-reference] - Build and preview an Atlas source tree
:::
