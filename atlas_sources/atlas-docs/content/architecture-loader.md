---
tag: Architecture
title: Loader and site model
lead: |
  The loader is responsible for turning an Atlas source directory into a typed `Site` object composed of metadata, nav groups, assets, and rendered sections.
---

## Core types

`models.py` defines the repository's structural dataclasses:

:::selector_list
### `NavEntry`
Sidebar entry with a label, target slug or URL, and `external` flag.

### `NavGroup`
Named collection of sidebar entries.

### `SidebarFooter`
Optional footer nav group rendered separately from the main sidebar.

### `Section`
Rendered documentation section with frontmatter-derived metadata and HTML body.

### `Site`
Top-level container holding metadata, nav groups, sections, footer, and assets.
:::

## Loader behavior

`load_site()` performs several normalization steps:

- repairs common mojibake patterns before YAML parsing
- tolerates pipe-style nav entries that are not valid YAML scalars by quoting them
- supports both a direct source root and a nested `atlas_docs/` directory
- computes fallback breadcrumbs and label maps from navigation

:::callout info
The default section is the first non-external nav entry in the first nav group.
:::
