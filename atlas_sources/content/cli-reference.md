---
tag: Reference
title: CLI reference
lead: |
  Atlas Docs exposes a Typer-based CLI with three commands: `init`, `build`,
  and `serve`.
breadcrumb: "atlas docs / cli reference"
---

## Command summary

:::table
| Command | Purpose |
|---------|---------|
| `atlas-docs init <path>` | Create a minimal Atlas source tree with control files and an introduction page. |
| `atlas-docs build <source> --out <html>` | Compile an Atlas source directory into static HTML. |
| `atlas-docs serve <source> --out-dir <dir> --port <n>` | Build a preview copy and serve it over a simple local HTTP server. |
:::

## `init`

:::method
atlas-docs init PATH
:::

Creates:

```text
<path>/
  metadata.md
  navigation.md
  assets.md
  content/introduction.md
```

The starter metadata uses the bundled Atlas visual defaults and enables search.

## `build`

:::method
atlas-docs build SOURCE --out dist/index.html --theme atlas_dark --pretty False
:::

Behavior:

:::selector_list
### `source`
Atlas source directory to compile. The loader also accepts a parent directory
when it contains a nested `atlas_docs/` source root.

### `--out`, `-o`
Destination HTML file. Parent directories are created automatically.

### `--theme`, `-t`
Theme name or path to a theme directory.

### `--pretty`
Exposed as an option in the CLI, though the current implementation always calls
`build_site(..., minify=False)`.
:::

## `serve`

:::method
atlas-docs serve SOURCE --out-dir .atlas-preview --theme atlas_dark --port 8000
:::

`serve` builds an `index.html` into the preview directory, changes into that
directory, and starts `http.server.SimpleHTTPRequestHandler` through
`socketserver.TCPServer`.

:::callout warn
The current implementation serves the generated preview, but it does not yet
wire file watching or incremental rebuild behavior into the command loop.
:::

## Common usage

```bash
atlas-docs init my-docs
atlas-docs build my-docs --out dist/index.html
atlas-docs serve my-docs --port 8000
```

:::reference_list
- [doc:quickstart] - Installation and first-run commands
- [doc:render-pipeline] - How the CLI hands off to the loader and renderer
- [doc:atlas-source-format] - The expected source directory contract
:::
