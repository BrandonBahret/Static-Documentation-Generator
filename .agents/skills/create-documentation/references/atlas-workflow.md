# Atlas Workflow

Use the Atlas source format defined in the local bundled file [ATLAS_DOCS_FORMAT.md](ATLAS_DOCS_FORMAT.md).

Minimum expectations for this skill:

- Create `metadata.md`, `navigation.md`, `assets.md`, and `content/*.md`.
- Set `accent`, `accent_dark`, and `accent_light` from the project's branding.
- Add footer links for the upstream repository, package page, or official docs when available.
- Keep `assets.md` empty if there are no project assets worth embedding.
- Match every content file to an entry in `navigation.md`.

Build outputs with one of these commands from the repo root:

```powershell
$env:PYTHONPATH = "<skill-dir>\\scripts"
py -m atlas_docs.cli build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```

If `atlas-docs` is already installed in the environment, this also works:

```powershell
atlas-docs build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```
