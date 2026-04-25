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

The current implementation handles `feature_grid`, `cards`, `callout`, `method`, `selector_list`, `table`, `quick_links`, `reference_list`, and `example_pair`.

## Heading IDs

Atlas strips explicit `{id=...}` suffixes from the rendered heading text, but preserves them for the resulting DOM ID. If no explicit anchor is present, it slugifies the heading text.

## Syntax highlighting

Python code fences are tokenized with repository-defined regex rules for comments, strings, decorators, classes, functions, keywords, and numbers. That means highlighting is deterministic and local to the project; it is not delegated to an external highlighter.

## Examples in Markdown and browser output

Use `example_pair` when you want a single block that shows Atlas source on one side and the rendered browser result on the other.

Think of the examples below as a progression. Start with the smallest inline syntax, confirm what the browser output looks like, and then move on to the larger directives once the basics feel familiar.

We will start with links, because they are usually the first Atlas-specific syntax you add to a page.

:::example_pair title="Internal doc link" lang=md
See [doc:format-assets] for the asset catalog format.
:::

This syntax creates a link to another section by slug. Atlas looks up the navigation label for that slug, so the browser output shows a reader-friendly title instead of the raw slug.

:::example_pair title="Internal doc link with custom text" lang=md
Open [the assets registry docs | doc:format-assets] for naming rules.
:::

Use this version when the default nav label is not quite the wording you want in a sentence. The destination stays the same, but you control the text that appears in the paragraph.

:::example_pair title="Inline code reference" lang=md
The loader builds the `Site{ref=architecture-loader}` model before rendering.
:::

Inline code references are useful when you want code-like formatting and a connection to another section at the same time. This works well for class names, functions, and important types that readers may want to explore next.

:::example_pair title="Asset reference" lang=md
@asset[pipeline-figure]
:::

An asset reference pulls a named image or SVG from `assets.md` into the page. This keeps prose cleaner, because authors can reuse short asset names instead of repeating file paths everywhere.

:::example_pair title="Heading ID override" lang=md
### Stable heading target {id=stable-heading-target}
:::

Explicit heading IDs are helpful when you want a stable anchor that will not change if the visible heading text gets rewritten later. That is especially useful for deep links from other docs or saved bookmarks.

:::example_pair title="Python code highlighting" lang=md
```python
from atlas_docs.loader import load_site

site = load_site(source_dir)
return site
```
:::

Code fences still behave like normal Markdown, but Atlas adds local Python highlighting on top. That means you can mix standard Markdown habits with Atlas-specific syntax instead of learning a completely different authoring model.

Once the inline pieces make sense, the bigger directives are easier to read. Each directive starts with `:::name`, accepts its own structured body, and renders to a more polished UI block in the finished site.

:::example_pair title="feature_grid directive" lang=md
:::feature_grid
### Cross-section links {icon=->}
Jump between sections with `[doc:slug]` syntax.

### Inline references {icon=#}
Attach interactive refs to code tokens with `` `name{ref=slug}` ``.
:::
:::

`feature_grid` is a good first directive to study because the source stays very close to the final layout. Each mini-heading becomes one feature item, and the optional icon gives the card a small visual marker.

:::example_pair title="cards directive" lang=md
:::cards
### Source files {link=format-content}
See how section files map to navigation entries and frontmatter.

### Theme rendering {link=architecture-renderer}
Follow the last stage of the pipeline into HTML and CSS output.
:::
:::

Cards are similar to a feature grid, but they are designed to feel more clickable and navigational. Use them when you want readers to branch into a few important follow-up sections.

:::example_pair title="callout directive" lang=md
:::callout info
Atlas transforms custom syntax before standard Markdown rendering runs.
:::
:::

Callouts are the simplest way to emphasize a note without inventing custom HTML. They work well for warnings, tips, and short explanations that should stand apart from the surrounding body text.

:::example_pair title="method directive" lang=md
:::method
load_site(source_dir, *, strict=False) -> Site
:::
:::

The `method` directive is more specialized. It turns a function or API-style signature into a compact reference block, which makes architecture pages and API docs easier to scan.

:::example_pair title="selector_list directive" lang=md
:::selector_list
### `[doc:slug]`
Link to another Atlas section.

### `[label | doc:slug]`
Link to a section with author-defined text.
:::
:::

`selector_list` works well when you need a small syntax reference. The left side shows the token or pattern, and the right side explains what that syntax means in plain language.

:::example_pair title="table directive" lang=md
:::table
| Syntax | Purpose |
|--------|---------|
| `[doc:slug]` | Navigate to another section |
| `@asset[name]` | Render a named asset |
:::
:::

Use a table when readers need to compare several patterns at once. This is a better fit than prose when the information is naturally organized into columns like syntax, purpose, and result.

:::example_pair title="quick_links directive" lang=md
:::quick_links
- [doc:architecture-loader]
- [doc:architecture-renderer]
- [Atlas repository](https://github.com/BrandonBahret/Static-Documentation-Generator)
:::
:::

`quick_links` turns a short list of destinations into a cleaner navigation block. It is a good choice near the top or bottom of a section when you want to guide readers toward the next useful pages.

:::example_pair title="reference_list directive" lang=md
:::reference_list
- [doc:format-content] for section frontmatter and headings
- [doc:format-assets] for asset registration
- [doc:architecture-renderer] for final HTML output
:::
:::

`reference_list` is similar, but it reads more like supporting material than navigation. Use it when you want a small "read this next" list tied to the current topic.

After working through these pairs, you can usually predict how a new block will render just by reading the Markdown. That is the main goal of `example_pair`: it turns the page into a side-by-side sandbox instead of a purely textual specification.
