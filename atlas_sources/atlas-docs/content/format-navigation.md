---
tag: Source Format
title: navigation.md
lead: |
  `navigation.md` is the sidebar contract for the whole site. It defines group order, nav labels, section slugs, and optional footer links.
---

## Entry format

Atlas expects each nav entry in pipe syntax:

```yaml
- Introduction | introduction
- GitHub | https://example.com/repo | external
```

## Rules that matter

:::table
| Rule | Why it matters |
|------|----------------|
| Every non-external entry must map to a real `content/[slug].md` file | The loader raises an error otherwise |
| Group order controls sidebar order and first-read flow | Atlas uses the first non-external entry as the default visible section |
| Labels drive doc-link fallback text | `[doc:slug]` expands to the nav label when you do not provide custom link text |
| Footer links are optional and external-friendly | They render separately from the main nav stack |
:::

## Cross-section links

Content pages can link to a nav entry by slug:

```md
See [doc:command-build] for the main compilation command.
See [build command | doc:command-build] for a custom label.
See [build parameters | doc:command-build#parameters] for a subsection.
```

The Markdown renderer converts those links into client-side navigation anchors tied to the section slug and optional heading anchor.
