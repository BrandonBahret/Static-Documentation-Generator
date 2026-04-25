---
tag: Architecture
title: Markdown and directives
lead: |
  `markdown.py` is where Atlas becomes more than plain CommonMark. It adds internal document links, inline code references, asset expansion, custom blocks, heading IDs, and Python code highlighting.
---

## Extensions over plain Markdown

:::table
| Feature | Input syntax | Result |
|---------|--------------|--------|
| Internal doc link | `[doc:slug]` | Client-side section link using the nav label |
| Custom internal link text | `[label | doc:slug]` | Same link target with author-supplied label |
| Inline code ref | `` `token{ref=slug}` `` | Clickable code token tied to a section |
| Asset reference | `@asset[name]` | Inline SVG placeholder or image tag |
| Directive block | `:::kind` | Structured HTML component |
:::

## Directive coverage

The current implementation handles `feature_grid`, `cards`, `callout`, `method`, `selector_list`, `table`, `quick_links`, and `reference_list`.

## Heading IDs

Atlas strips explicit `{id=...}` suffixes from the rendered heading text, but preserves them for the resulting DOM ID. If no explicit anchor is present, it slugifies the heading text.

## Syntax highlighting

Python code fences are tokenized with repository-defined regex rules for comments, strings, decorators, classes, functions, keywords, and numbers. That means highlighting is deterministic and local to the project; it is not delegated to an external highlighter.
