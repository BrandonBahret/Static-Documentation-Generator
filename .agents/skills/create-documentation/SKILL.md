---
name: create-documentation
description: Create Atlas-format documentation for a software project or repository, then build the static HTML with the bundled Atlas generator in this skill. Use when Codex should infer a target project from the user prompt, document the current local project or another local repo, research a non-local project online before writing docs, write Atlas source files to `atlas_sources/[project]/`, choose accent colors from the project's branding, and build `docs_site/[project]/index.html`.
---

# Create Documentation

Generate Atlas documentation source for a project, then compile it into a browsable static HTML file with the bundled generator shipped inside this skill.

## Inputs

Infer the target from the user prompt:

- If the user refers to "this project", "current project", or gives no separate target, document the current workspace.
- If the user names a local path or repo in the workspace, inspect that local project directly.
- If the user names a non-local project, package, library, company, or GitHub repo that is not available locally, research it online before drafting documentation.

If the prompt is ambiguous, prefer the current project when that is a reasonable reading.

## Required Workflow

1. Identify the project and normalize a display/build slug.
2. Gather source material.
3. Infer branding cues and choose Atlas metadata values.
4. Create or refresh the Atlas source directory at `atlas_sources/[project]/`.
5. Build the static site to `docs_site/[project]/index.html`.
6. Tell the user where the HTML file lives and how to rebuild it.

## Gather Source Material

For a local project:

- Read the repository files first: README, package metadata, config files, source tree, examples, tests, and any existing docs.
- Infer the project's purpose, major features, setup flow, API surface, architecture, and operational details from source rather than inventing them.

For a non-local project:

- Search online for official and primary sources before writing the docs.
- Prefer the project's official docs, README, package registry page, and source repository.
- Use recent sources when facts may change.
- Make it clear when a detail is inferred rather than directly documented.

## Infer Branding

Choose Atlas branding values from the project's actual presentation:

- Inspect the project's website, docs site, README badges, logos, screenshots, favicon, social preview, CSS tokens, theme files, or design system files.
- Derive `accent`, `accent_dark`, and `accent_light` from the dominant brand accent rather than picking arbitrary colors.
- When the project clearly has different dark/light accents, preserve both. Otherwise derive a reasonable paired variant from the main accent.
- Choose `display_font`, `body_font`, and `mono_font` to match the project's tone if the branding strongly suggests a direction. Otherwise use a clean, legible set that suits technical docs.
- Keep the palette and typography defensible. Do not fabricate elaborate branding if the project has none.

## Build The Atlas Source

Create a source directory at `atlas_sources/[project]/` in the working directory. Replace `[project]` with the normalized lowercase project slug. Use the same slug for `docs_site/[project]/`.

The generated source must follow the Atlas format in [references/atlas-workflow.md](references/atlas-workflow.md). Always create:

- `metadata.md`
- `navigation.md`
- `assets.md`
- `content/`

Recommended content shape:

- Overview or introduction
- Quickstart or installation
- Core concepts or architecture
- Usage guides
- API or CLI reference when applicable
- Links to upstream repo, package registry, and official docs in the footer

Write the docs from the gathered evidence. Keep gaps explicit instead of guessing.

## Bundled Resources

This skill is standalone. It includes:

- `references/ATLAS_DOCS_FORMAT.md` for the Atlas source format.
- `references/atlas-workflow.md` for the workflow summary.
- `scripts/atlas_docs/` for the local Atlas generator package.

## Build Command

Run the bundled generator from this skill:

```powershell
$env:PYTHONPATH = "<skill-dir>\\scripts"
py -m atlas_docs.cli build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```

Replace `<skill-dir>` with the absolute path to this `create-documentation` skill directory.

If the environment already has `atlas-docs` installed and the user prefers that, it is acceptable to use:

```powershell
atlas-docs build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```

## Final User Response

Always report:

- The Atlas source directory path.
- The built HTML path, specifically `docs_site/[project]/index.html`.
- The exact rebuild command to run again.

Prefer the bundled `PYTHONPATH=<skill-dir>\scripts` command in the final response so the workflow remains portable and standalone.
