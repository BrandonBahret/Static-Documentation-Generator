---
tag: Commands
title: init
lead: |
  `atlas-docs init` creates a minimal Atlas source tree with starter metadata, navigation, assets, and one introduction page.
---

## Signature

:::method
atlas-docs init PATH
:::

## Behavior

The `init` command calls `renderer.init_site(path)`, creates the target directory if needed, creates a `content/` directory, and writes starter versions of:

- `metadata.md`
- `navigation.md`
- `assets.md`
- `content/introduction.md`

## Arguments

:::table
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `PATH` | `Path` | Yes | Directory where the starter Atlas source tree will be created |
:::

## Example

```bash
atlas-docs init docs-source
```

After running the command, edit the generated files and then continue with [doc:command-build].
