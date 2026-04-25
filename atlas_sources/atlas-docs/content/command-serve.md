---
tag: Commands
title: serve
lead: |
  `atlas-docs serve` builds a preview into a directory and serves it over Python's standard library HTTP server.
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

The command builds `index.html` into the selected output directory, changes the working directory to that output folder, and then starts `socketserver.TCPServer` with `http.server.SimpleHTTPRequestHandler`.

:::callout warn
The current implementation serves forever until interrupted and does not watch source files for changes, even though `watchfiles` is present as a dependency.
:::
