---
tag: Commands
title: serve
lead: |
  `atlas-docs serve` builds a preview into a directory, serves it locally, and live-reloads the browser after local edits and successful rebuilds.
---

## Signature

:::method
atlas-docs serve SOURCE --out-dir .atlas-preview --theme atlas_dark --port 8000
:::

## Parameters

:::table
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `SOURCE` | `Path` | — | Atlas source directory |
| `--out-dir` | `Path` | `.atlas-preview` | Directory where preview files are written |
| `--theme`, `-t` | `str` | `atlas_dark` | Theme name or theme directory |
| `--port`, `-p` | `int` | `8000` | Local port for the HTTP server |
:::

## Behavior

The command builds `index.html` into the selected output directory, starts a threaded local preview server, watches the Atlas source plus bundled theme/template assets, and streams reload notifications to the browser after each successful rebuild.

If a rebuild fails, the server keeps the last successful preview running and prints the build error to the terminal instead of replacing the output with a broken page.
