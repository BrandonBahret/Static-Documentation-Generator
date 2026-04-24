---
tag: Workflow
title: Using the Codex skill
lead: |
  Package the `create_documentation` skill at the root of the repository, then
  use Codex to author Atlas source, expand thin sections, and rebuild the docs
  as the project evolves.
breadcrumb: "atlas docs / using the codex skill"
---

## Install the skill into the target repository

For those that want to generate docs with Codex, place the
skill bundle at your repository root:

```text
your-project/
  .agents/
    skills/
      create_documentation/
        SKILL.md
        references/
        scripts/
```

That keeps the workflow local to the project instead of depending on a global
Codex setup. Once that folder exists at the root, Codex can expose the skill as
`/create documentation`. If Codex cannot find the skill, then restart the instance.

:::callout info
Teams that prefer writing Atlas files directly can still use the same
repository-local layout. The skill does not replace the source format; it helps
author and maintain it.
:::

## Two supported authoring modes

:::cards
### Write Atlas source yourself {link=atlas-source-format}
Use `metadata.md`, `navigation.md`, `assets.md`, and `content/*.md` directly
when you want exact control over the structure and wording.

### Use Codex to build and maintain it
Ask Codex to inspect the repository, draft or revise `atlas_sources/`, and then
compile the static HTML build for review.
:::

## Good prompts for the skill

The skill performs best when the prompt names both the output location and the
evidence it should rely on.

:::selector_list
### Bootstrap docs from a repo
`/create documentation document this repository into atlas_sources and build docs_site/index.html`

### Expand package documentation while coding examples
`/create documentation update atlas_sources for this package and, whenever you add an example, read the implementation first and document the feature from source`

### Tighten API docs
`/create documentation refresh the API sections from the current handlers, types, and tests, then rebuild the docs`
:::

## How to get more from Codex

If the repository already has some documentation, treat `atlas_sources/` as a
working knowledge base instead of a one-time export.

:::feature_grid
### Ask for source-backed examples {icon=01}
When documenting a package or library, tell Codex to read the implementation,
tests, and existing examples before it writes new examples. That reduces drift
between docs and the actual feature behavior.

### Grow `atlas_sources/` alongside the product {icon=02}
If you are building a package or API, ask Codex to update the relevant
`atlas_sources/content/*.md` files in the same pass where it adds routes,
modules, CLI commands, or examples. The docs stay closer to the code because
the authoring happens during the feature change.

### Add context when the docs feel thin {icon=03}
If the first pass is too light, tell Codex to enrich the Atlas source with
architecture notes, constraints, tradeoffs, request flows, glossary material,
and links between related sections before rebuilding.
:::

## Useful prompting patterns

:::table
| Goal | Prompt pattern |
|------|----------------|
| Build initial package docs | `Create atlas_sources for this package, include installation, concepts, examples, and API reference, and cite behavior from the source files you inspect.` |
| Improve examples | `Revise the examples in atlas_sources so each one matches the current implementation and test coverage.` |
| Deepen sparse docs | `The docs are too light. Add missing context to atlas_sources, especially architecture, edge cases, and operational guidance, then rebuild.` |
| Keep docs current during feature work | `As you implement this feature, also update atlas_sources for any new commands, config, or API behavior and rebuild the site.` |
:::

## Recommended workflow for GitHub repositories

1. Commit the skill bundle to `.agents/skills/create_documentation/` at the
   root of the project.
2. Keep authored Atlas files in `atlas_sources/` so both humans and Codex have
   a stable place to improve the docs.
3. Ask Codex to refresh the affected source files whenever code, APIs, or
   examples change.
4. Rebuild the static output and review the generated HTML before publishing.

:::quick_links
- [doc:quickstart] - Build Atlas docs from source or via the CLI
- [doc:atlas-source-format] - Review the Atlas file contract Codex writes
- [doc:cli-reference] - See build and preview commands
:::
