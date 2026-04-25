---
tag: Guides
title: Install the CLI
lead: |
  Atlas Docs can run as an installed command or directly from source. The repository currently targets Python 3.11+ and exposes the `atlas-docs` entry point through `pyproject.toml`.
---

## Editable install

From the repository root:

```bash
py -m pip install -e .
```

That installs the `atlas-docs` console script from the `[project.scripts]` entry in `pyproject.toml`.

## Run from source

If you do not want an editable install, set `PYTHONPATH` to `src` and invoke the module directly:

```powershell
$env:PYTHONPATH = "src"
py -m atlas_docs.cli build .\my-docs --out .\dist\index.html
```

## Runtime dependencies

Atlas Docs currently depends on Typer, Jinja2, `markdown-it-py`, `mdit-py-plugins`, PyYAML, RapidFuzz, `cydifflib`, and `watchfiles`.

:::callout info
Those dependencies come directly from `pyproject.toml`. There is no separate lockfile in this repository.
:::
