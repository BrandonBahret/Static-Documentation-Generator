---
tag: Source Format
title: assets.md
lead: |
  `assets.md` is an optional registry for SVGs and images. It keeps raw paths out of section prose by assigning each asset a short name.
---

## Supported catalogs

:::selector_list
### `svgs`
Inline SVG asset declarations using `name | path`.

### `images`
Image declarations using `name | path | alt text`.

### `remote_images`
External image URLs using `name | url | alt text`.
:::

## Referencing an asset

Use the `@asset[name]` syntax inside content files:

```md
@asset[logo-mark]
```

The Atlas Docs source in this repository uses that pattern for the introduction hero image and the pipeline diagram in [doc:how-atlas-works].

## Current implementation note

The renderer resolves asset declarations into inline placeholders or `<img>` tags during Markdown rendering. Local SVG and image assets are now copied into the built site's `assets/` directory during the build so `./assets/...` references stay portable.
