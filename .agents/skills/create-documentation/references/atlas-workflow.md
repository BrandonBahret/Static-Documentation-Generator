# Atlas Workflow

Use the Atlas source format defined in the local bundled file [ATLAS_DOCS_FORMAT.md](ATLAS_DOCS_FORMAT.md).

---

## Required files

Create all four of these — no exceptions:

- `metadata.md` — project identity, theme, typography, branding
- `navigation.md` — sidebar structure; every content file must have an entry here
- `assets.md` — SVG icons and images; leave empty if none
- `content/*.md` — one file per sidebar entry, named to match its nav slug.

---

## Before writing any content: classify and design

**1. Classify the domain.** The domain type determines what the atomic nav unit is:

| Domain | Atomic nav unit | Never do this |
|--------|----------------|---------------|
| REST API | One page per endpoint (`GET /users`, `POST /users`, …) | Collapse all endpoints onto one "API Reference" page |
| SDK / Library | One page per class or module | Scatter methods across top-level nav entries |
| CLI Tool | One page per command / subcommand | List all commands in a single "Commands" page (unless fewer than five) |
| Config / Schema | One page per top-level config section | Embed config reference inside prose guides |
| Concepts / Architecture | One page per concept, ordered by dependency | Mix conceptual narrative with reference lookup |

**2. Separate orientation, operation, and reference.** These serve different reader states and must never be merged into the same group:

- *Orientation* (introduction, concepts, architecture) — builds mental models
- *Operation* (guides, tutorials, quickstart) — supports tasks
- *Reference* (API endpoints, class docs, CLI commands, config schema) — supports lookup

**3. Name nav entries after what the reader is looking for**, not after what the feature is called internally. A reader scans nav entries to find their target in under five seconds.

**4. Reference sections default to granular.** When uncertain whether something deserves its own page: it does. Under-segmentation makes reference material unfindable.

---

## Branding

- Set `accent`, `accent_dark`, and `accent_light` from the project's actual brand color — inspect the site, README, logo, or design tokens. Do not invent colors.
- Add footer links to the upstream repository, package registry page, and official docs when available.

---

## Content quality checks

Before building, verify:

- [ ] Every nav entry has a matching file in `content/`
- [ ] No reference section is a single page containing multiple endpoints, classes, or commands that each warrant their own page
- [ ] Orientation, operation, and reference content live in separate nav groups
- [ ] Every API signature uses `:::method`, not inline prose or plain code fences
- [ ] Every parameter table uses `:::table`, not bullet lists
- [ ] Inferred details are marked inline — do not present guesses as facts
- [ ] Inline code references use `{ref=slug}` only where a reader
      would genuinely benefit from jumping to the definition —
      method calls in usage examples, type names in parameter tables.
      Do not add {ref=} to every code token or use it decoratively.

---

## Build commands

From the repo root:

```powershell
$env:PYTHONPATH = "<skill-dir>\\scripts"
py -m atlas_docs.cli build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```

If `atlas-docs` is already installed in the environment:

```powershell
atlas-docs build .\atlas_sources\[project] --out .\docs_site\[project]\index.html
```
