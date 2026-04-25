---
tag: Guides
title: Use the Codex skill
lead: |
  The `create-documentation` skill sits above the CLI. It inspects a local or remote project, designs documentation navigation around the project domain, writes Atlas source files, and builds the resulting site.
---

## What the skill adds

The CLI expects you to author Atlas source manually. The Codex skill automates the authoring layer:

- It infers the project to document from the prompt.
- It classifies the project domain before writing nav entries.
- It separates orientation, guides, and reference pages so the site is easier to scan.
- It chooses metadata and branding from the project rather than using arbitrary values.
- It runs the bundled Atlas generator from the skill package.

## When to use it

Use the skill when you want Atlas docs for:

- the current repository
- another local repository
- a non-local project that first needs primary-source research

## Bundled build command

The skill keeps its own vendored `atlas_docs` package under `scripts/atlas_docs/`, so it does not depend on this repository being installed into the environment:

```powershell
$env:PYTHONPATH = "<skill-dir>\scripts"
py -m atlas_docs.cli build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```

:::callout info
This repository contains both the reusable package in `src/atlas_docs/` and the packaged skill bundle under `.agents/skills/create-documentation/`.
:::
