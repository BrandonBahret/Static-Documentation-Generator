---
name: create-documentation
description: Create Atlas-format documentation for a software project or repository, then build the static HTML with the bundled Atlas generator in this skill. Use when Codex should infer a target project from the user prompt, document the current local project or another local repo, research a non-local project online before writing docs, write Atlas source files to `atlas_sources/[project]/`, choose accent colors from the project's branding, and build `docs_site/[project]/index.html`.
---

# Create Documentation

Generate Atlas documentation source for a project, then compile it into a browsable static HTML file with the bundled generator shipped inside this skill.

---

## Inputs

Infer the target from the user prompt:

- If the user refers to "this project", "current project", or gives no separate target, document the current workspace.
- If the user names a local path or repo in the workspace, inspect that local project directly.
- If the user names a non-local project, package, library, company, or GitHub repo that is not available locally, research it online before drafting documentation.

If the prompt is ambiguous, prefer the current project when that is a reasonable reading.

---

## Required Workflow

1. Identify the project and normalize a display/build slug.
2. Gather source material.
3. **Classify the domain** — determine what kind of thing is being documented (see below).
4. **Design the navigation** — let the domain classification drive the nav shape before writing any content.
5. Infer branding cues and choose Atlas metadata values.
6. Create or refresh the Atlas source directory at `atlas_sources/[project]/`.
7. Build the static site to `docs_site/[project]/index.html`.
8. Tell the user where the HTML file lives and how to rebuild it.

---

## Gather Source Material

For a local project:

- Read the repository files first: README, package metadata, config files, source tree, examples, tests, and any existing docs.
- Infer the project's purpose, major features, setup flow, API surface, architecture, and operational details from source rather than inventing them.

For a non-local project:

- Search online for official and primary sources before writing the docs.
- Prefer the project's official docs, README, package registry page, and source repository.
- Use recent sources when facts may change.
- Make it clear when a detail is inferred rather than directly documented.

---

## Step 3 — Classify the Domain

Before designing navigation or writing content, ask: **what kind of thing is this?**

The answer determines the natural unit of navigation — what gets its own page. Imposing the wrong shape is the most common documentation failure. Each domain type has a different atomic unit and a different structural logic.

### Domain Types and Their Navigation Units

**HTTP / REST API**
The atomic unit is the **endpoint**. Every route gets its own page — do not collapse multiple endpoints onto one page. Group by resource, not by HTTP method.

```
# Wrong: all endpoints on one "API Reference" page
# Right:
- Reference
  - GET /users
  - POST /users
  - GET /users/{id}
  - DELETE /users/{id}
  - GET /posts
  - POST /posts
```

Name nav entries as `METHOD /path` so readers can scan and land directly. A single "API Reference" page with a long list of methods is a navigation failure — it forces the reader to scroll through material that isn't theirs.

**SDK / Library**
The atomic unit is the **class or module**. Each major class, namespace, or logical grouping gets its own page. Methods belong within their class page, not scattered across top-level nav entries.

```
- Reference
  - CacheClient
  - ApiWrapper
  - StorageBackend
  - QuerySelector
```

Prose pages (concepts, guides) live in separate groups from the reference section. Don't mix narrative and reference on the same page.

**CLI Tool**
The atomic unit is the **command or subcommand**. Each command with its own flags, behavior, and examples gets its own page. A flat "Commands" page is acceptable only for tools with fewer than five commands.

```
- Commands
  - init
  - build
  - deploy
  - deploy rollback
  - config set
```

**Configuration / Schema**
The atomic unit is the **top-level config key or section**. Each major config block gets its own page or dedicated heading group. Reference tables (key / type / default / description) are the right format here — not prose.

**Conceptual / Architecture**
The atomic unit is the **concept**. There is no single reference surface; instead, navigation follows the logical dependency order of ideas. A reader who doesn't yet understand concept A cannot understand concept B.

```
- Concepts
  - How requests flow
  - Authentication model
  - Data lifecycle
  - Caching behavior
```

**Tutorials / Guides**
The atomic unit is the **task or user goal**. Each page answers "how do I do X?" for a specific X. Navigation groups by theme or complexity level, not by feature area.

**Mixed projects** (most real projects) combine types. Apply each type's logic within its own nav group. Never flatten a reference section into a concepts section — they serve different reader states.

---

## Step 4 — Design the Navigation First

Navigation is not an index of what exists. It is a **map of what the reader needs**. Design it before writing content.

### The Two Reader States

Every documentation reader is in one of two states:

- **Lost** — they don't know what they don't know. They need a guided path: orientation first, then operation.
- **Searching** — they have a specific question. They need to find their target in one or two clicks.

Good navigation serves both. It should be scannable enough that a searching reader can find their entry in under five seconds. It should also have a logical progression that a lost reader can follow from top to bottom.

### Navigation Design Rules

**1. Name entries after what the reader wants, not what the feature is called.**
The reader is not looking for "CacheManager Constructor Initialization." They are looking for "Getting started" or "Create a cache."

**2. Match granularity to domain type.**
If you are documenting a REST API and your navigation has fewer entries than the API has endpoints, you have under-segmented. If you are documenting a single concept and your navigation has twelve sub-entries, you have over-segmented.

**3. Separate orientation from operation from reference.**
These three serve different reader states and should never be merged into a single section:
- *Orientation* (introduction, concepts, architecture) — builds mental models
- *Operation* (guides, tutorials, quickstart) — supports tasks
- *Reference* (API, CLI commands, config schema) — supports lookup

A reader who wants to look up a method signature should not have to read conceptual prose to get there.

**4. Reference sections must be granular.**
When in doubt about whether a reference entry deserves its own page: it does. The cost of granularity is low (one more nav entry). The cost of under-segmentation is high (the reader can't find what they need).

**5. Navigation order implies learning order.**
Sequence groups and entries so that reading top-to-bottom makes sense for a first-time reader. The reader who proceeds in order should arrive at reference material after they already have the concepts they need to use it.

### Navigation Template by Domain

Use this as a starting shape, then adjust to what evidence supports.

**REST API:**
```
- Overview
  - Introduction
  - Authentication
  - Errors & status codes
  - Rate limits
- [Resource Group 1]
  - GET /resource
  - POST /resource
  - GET /resource/{id}
  - PATCH /resource/{id}
  - DELETE /resource/{id}
- [Resource Group 2]
  - ...
- Guides
  - Quickstart
  - [Common workflow]
```

**SDK / Library:**
```
- Overview
  - Introduction
  - Installation
  - Quickstart
- Concepts
  - [Core concept 1]
  - [Core concept 2]
- Guides
  - [Task-oriented guide]
- Reference
  - [ClassName]
  - [ClassName]
  - [Module or namespace]
```

**CLI Tool:**
```
- Getting Started
  - Installation
  - Your first command
- Commands
  - [command]
  - [command subcommand]
- Configuration
  - Config file reference
```

---

## Step 5 — Infer Branding

Choose Atlas branding values from the project's actual presentation:

- Inspect the project's website, docs site, README badges, logos, screenshots, favicon, social preview, CSS tokens, theme files, or design system files.
- Derive `accent`, `accent_dark`, and `accent_light` from the dominant brand accent rather than picking arbitrary colors.
- When the project clearly has different dark/light accents, preserve both. Otherwise derive a reasonable paired variant from the main accent.
- Choose `display_font`, `body_font`, and `mono_font` to match the project's tone if the branding strongly suggests a direction. Otherwise use a clean, legible set that suits technical docs.
- Keep the palette and typography defensible. Do not fabricate elaborate branding if the project has none.

---

## Step 6 — Build The Atlas Source

Create a source directory at `atlas_sources/[project]/` in the working directory. Replace `[project]` with the normalized lowercase project slug.

The generated source must follow the Atlas format in [references/atlas-workflow.md](references/atlas-workflow.md). Always create:

- `metadata.md`
- `navigation.md`
- `assets.md`
- `content/`

The navigation you designed in Step 4 maps directly to `navigation.md` groups and entries. Each leaf entry in the nav corresponds to exactly one file in `content/`.

### Content Shape Checklist

Confirm the structure covers:

- [ ] Orientation: what this is, what problem it solves, who it's for
- [ ] A working quickstart that produces a visible result in under ten minutes
- [ ] Concept pages for every term that reference pages assume the reader knows
- [ ] One page per atomic unit appropriate to the domain type (endpoint / class / command / etc.)
- [ ] Explicit gaps: when something is inferred rather than confirmed from source, say so inline

### Content Writing Principles

**Transfer the mental model, not just the facts.** Each concept page should leave the reader able to make correct predictions about behavior they haven't seen yet — not just recall a definition.

**Match depth to reader state.** Orientation pages move slowly and build from first principles. Reference pages are dense and assume the reader arrived with a specific question. Do not write reference pages in narrative style or orientation pages in lookup style.

**Write as if the reader is already there.** Content is addressed to the reader, not about the document. Never explain authoring choices, describe what a section is about to do, or leave reasoning about structure visible in the output. "This section covers..." and "The hero visual works well here because..." are both failures — the first is throat-clearing, the second is the agent talking to itself. Start sentences where the reader's attention already is.

**Use the Atlas block types purposefully:**
- `:::method` for every API signature — never embed signatures in prose
- `:::table` for parameter reference tables — never list params as bullet points
- `:::callout warn` for error conditions, common mistakes, and gotchas
- `:::callout info` for tips that interrupt the happy path
- `:::cards` on orientation pages to give the reader branching paths forward
- `:::tabs` when showing the same operation in multiple languages or backends

---

## Bundled Resources

This skill is standalone. It includes:

- `references/ATLAS_DOCS_FORMAT.md` for the Atlas source format.
- `references/atlas-workflow.md` for the workflow summary.
- `scripts/atlas_docs/` for the local Atlas generator package.

---

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

---

## Final User Response

Always report:

- The Atlas source directory path.
- The built HTML path, specifically `docs_site/[project]/index.html`.
- The exact rebuild command to run again.

Prefer the bundled `PYTHONPATH=<skill-dir>\scripts` command in the final response so the workflow remains portable and standalone.