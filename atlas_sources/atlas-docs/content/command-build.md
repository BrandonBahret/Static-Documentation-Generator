---
tag: Commands
title: build
lead: |
  `atlas-docs build` compiles an Atlas source directory into a static HTML file. This is the main production command.
---

## Signature

:::method
atlas-docs build SOURCE --out dist/index.html --theme atlas_dark --pretty
:::

## Parameters

:::table
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `SOURCE` | `Path` | — | Atlas source directory |
| `--out`, `-o` | `Path` | `dist/index.html` | Output HTML path |
| `--theme`, `-t` | `str` | `atlas_dark` | Theme name or theme directory |
| `--pretty` | `bool` | `False` | Declared for debugging, though current CLI code always calls `build_site(..., minify=False)` |
:::

## What it does

`build` loads the site via `load_site()`, resolves the theme family and alternate color-scheme variant, concatenates theme CSS plus bundled JavaScript, renders the base Jinja template, and writes the resulting HTML to the requested path.

:::callout warn
`--pretty` is currently accepted by the CLI but does not change output formatting because the command hard-codes `minify=False`. That is a repository fact, not a docs convention.
:::

## Example

```bash
atlas-docs build my-docs --out dist/index.html --theme atlas_dark
```
