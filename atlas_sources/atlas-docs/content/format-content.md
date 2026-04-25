---
tag: Source Format
title: content/*.md
lead: |
  Each file in `content/` is one navigable section. The slug in `navigation.md` must match the filename, and the frontmatter supplies the page hero metadata.
---

## Frontmatter

Common frontmatter keys:

:::table
| Key | Description |
|-----|-------------|
| `tag` | Small category label above the title |
| `title` | Main page heading |
| `title_em` | Optional emphasized suffix rendered in accent color |
| `lead` | Subtitle paragraph under the title |
| `breadcrumb` | Optional breadcrumb override |
| `comment` | Optional HTML comment label carried into the section metadata |
:::

## Heading and anchor behavior

Atlas assigns DOM IDs to `##`, `###`, and `####` headings and supports explicit anchor overrides:

```md
## Request options {id=request}
### Theme family {id=theme-family}
```

Those anchors let you target subsections with `[doc:slug#anchor]`.

## Directive blocks

The current renderer supports these purpose-built blocks:

:::selector_list
### `:::feature_grid`
Summarize capabilities in a card grid.

### `:::cards`
Create clickable nav cards that jump to another section.

### `:::callout`
Highlight info, warnings, or side notes.

### `:::method`
Render API and command signatures in monospace.

### `:::selector_list`
Render syntax-description rows.

### `:::table`
Format reference tables.

### `:::quick_links`
Render a compact row of internal or external links.

### `:::reference_list`
Render a small "see also" link block.

### `:::example_pair`
Render a titled source-and-preview example block from one body.
:::

## Code blocks

Python code fences receive custom highlighting from `highlight_code()` in `markdown.py`. Other languages render without the Python-specific token styling.
