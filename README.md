# Atlas Docs CLI

A Python CLI static-site generator that compiles an Atlas docs source directory into a single-page documentation site.

## Commands

```bash
atlas-docs init my-docs
atlas-docs build my-docs --out dist/index.html --theme atlas_dark
atlas-docs serve my-docs --port 8000
```

## Architecture

Atlas separates content, templates, themes, and runtime behavior:

```text
source docs/              plain project input
  metadata.md             identity, typography, feature flags
  navigation.md           sidebar and section order
  assets.md               SVG/image registry
  content/*.md            one section per file

package templates/        Jinja2 HTML structure
package themes/<name>/    YAML design tokens + cohesive CSS layers
package static/js/        framework-free runtime modules

build output              generated index.html + assets/
```

## Theme format

Each theme is a directory:

```text
themes/atlas_dark/
  theme.yaml              tokens and high-level settings
  tokens.css.j2           CSS custom properties from tokens
  base.css                reset, document, typography
  layout.css              shell, sidebar, topbar, content layout
  components.css          cards, callouts, tables, methods, search
  code.css                code blocks and syntax token classes
```

A new theme can override any of these files while reusing the same Jinja templates and JavaScript.
