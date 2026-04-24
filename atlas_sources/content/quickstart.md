---
tag: Getting started
title: Quickstart
lead: |
  Install the package in editable mode or run the CLI from source, then build
  an Atlas source directory into a static HTML file.
breadcrumb: "atlas docs / quickstart"
---

## Install the CLI

From the repository root:

```bash
py -m pip install -e .
```

That installs the `atlas-docs` console script declared in `pyproject.toml`.

## Run from source

If you do not want to install the package, point `PYTHONPATH` at `src` and call
the module directly:

```bash
$env:PYTHONPATH = "src"
py -m atlas_docs.cli build .\my-docs --out .\dist\index.html
```

## Typical command flow

:::cards
### Create a starter tree {link=cli-reference}
Use `atlas-docs init my-docs` to scaffold the expected directory structure.

### Write Atlas content {link=atlas-source-format}
Fill in the control files and add one markdown file per navigable section.

### Compile HTML {link=cli-reference}
Run `build` to emit a static `index.html`, or `serve` to preview local changes.
:::

## Minimal example

```bash
atlas-docs init my-docs
atlas-docs build my-docs --out dist/index.html --theme atlas_dark
atlas-docs serve my-docs --port 8000
```

## Dependency profile

:::table
| Package | Role |
|---------|------|
| `typer` | CLI entry points and option parsing |
| `jinja2` | HTML templates and theme token rendering |
| `markdown-it-py` + `mdit-py-plugins` | Markdown parsing and directive-friendly rendering |
| `pyyaml` | Frontmatter and configuration loading |
| `watchfiles` | Local preview workflow support |
| `rapidfuzz` / `cydifflib` | Search and matching support for the generated docs UI |
:::

:::callout info
The project requires Python 3.11 or newer according to `pyproject.toml`.
:::

## When to use the skill instead

Use the Codex `create-documentation` workflow when the goal is not just to
render Atlas source, but to inspect a repository, author the Atlas files for
that target, and then build the finished static output. That workflow is
described in the README and mirrored in the standalone skill bundle.
