from __future__ import annotations

import json
import shutil
from pathlib import Path

from .loader import load_site
from .theme import (
    alternate_theme_name,
    load_theme,
    render_css,
    resolve_theme_variant,
    template_env,
    package_path,
)


def copy_local_assets(site, out_file: Path) -> None:
    asset_dir = out_file.parent / "assets"
    copied_any = False

    for key in ("svgs", "images"):
        for row in site.assets.get(key, []) or []:
            if not isinstance(row, str):
                continue
            parts = [part.strip() for part in row.split("|")]
            if len(parts) < 2:
                continue
            asset_path = parts[1]
            if asset_path.startswith(("http://", "https://")):
                continue
            if Path(asset_path).is_absolute():
                source_path = Path(asset_path)
            else:
                source_path = site.source / asset_path
            if not source_path.exists() or not source_path.is_file():
                continue
            if not copied_any:
                asset_dir.mkdir(parents=True, exist_ok=True)
                copied_any = True
            shutil.copy2(source_path, asset_dir / source_path.name)


def init_site(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    (path / "content").mkdir(exist_ok=True)
    (path / "metadata.md").write_text(
        """---
name: MyProject
version: v0.1.0
tagline: Does one thing well
accent: "#c8f060"
accent_light: "#7d9f20"
color_scheme: dark
display_font: Fraunces
body_font: DM Sans
mono_font: IBM Plex Mono
font_source: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap"
search_trigger_label: docs, guides, examples...
search_placeholder: Search local docs...
search_secondary_hint: Search the local docs. Try docs, guides, examples.
features:
  search: true
---
""",
        encoding="utf-8",
    )
    (path / "navigation.md").write_text(
        """---
groups:
  - label: Overview
    entries:
      - Introduction | introduction
---
""",
        encoding="utf-8",
    )
    (path / "assets.md").write_text("---\nsvgs: []\nimages: []\nremote_images: []\n---\n", encoding="utf-8")
    (path / "content" / "introduction.md").write_text(
        """---
tag: Getting started
title: MyProject
title_em: "."
lead: |
  A minimal Atlas Docs site generated from Markdown, templates, theme tokens, and JavaScript modules.
---

## Overview

Plain Markdown goes here.

:::callout info
**Tip:** Edit `metadata.md`, `navigation.md`, and `content/*.md`, then rebuild.
:::
""",
        encoding="utf-8",
    )


def compact_html(value: str) -> str:
    return value


def build_site(source: Path, out_file: Path, theme_name: str = "atlas_dark", minify: bool = True) -> Path:
    site = load_site(source)

    default_scheme = (site.metadata.get("color_scheme") or "dark").strip().lower()
    active_theme_name = resolve_theme_variant(theme_name, default_scheme)
    theme = load_theme(active_theme_name, site.metadata)
    alternate_name = alternate_theme_name(active_theme_name)
    alternate_theme = load_theme(alternate_name, site.metadata, apply_metadata_color_scheme=False) if alternate_name else None
    css = render_css(theme, alternate_theme=alternate_theme).rstrip("\n")
    js = ("\n\n".join(
        (package_path("static", "js", filename)).read_text(encoding="utf-8")
        for filename in ["state.js", "settings.js", "navigation.js", "copy-code.js", "search.js", "app.js"]
    )).rstrip("\n")

    sections_payload = {
        section.slug: {
            "label": section.label,
            "breadcrumb": section.breadcrumb,
            "metadata": section.metadata,
        }
        for section in site.sections
    }
    atlas_config = {
        "defaultSection": site.default_section,
        "sections": sections_payload,
        "features": site.metadata.get("features", {}),
        "metadata": site.metadata,
        "siteName": site.metadata.get("name", "docs"),
        "theme": {
            "name": theme.get("name", active_theme_name),
            "defaultColorScheme": theme.get("color_scheme", default_scheme),
            "supportsToggle": alternate_theme is not None,
            "supportedColorSchemes": [scheme for scheme in ["dark", "light"] if scheme in {theme.get("color_scheme"), alternate_theme.get("color_scheme") if alternate_theme else None}],
        },
        "search": {
            "placeholder": site.metadata.get("search_placeholder", "Search local docs..."),
            "triggerLabel": site.metadata.get("search_trigger_label", "docs, guides, examples..."),
            "secondaryHint": site.metadata.get(
                "search_secondary_hint",
                "Search the local docs. Try docs, guides, examples.",
            ),
        },
    }

    html = template_env().get_template("base.html.j2").render(
        site=site,
        theme=theme,
        css=css,
        js=js,
        atlas_config=atlas_config,
        atlas_config_json=json.dumps(atlas_config, ensure_ascii=False),
    )
    if minify:
        html = compact_html(html)
    if not html.endswith("\n"):
        html += "\n"

    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(html, encoding="utf-8")
    copy_local_assets(site, out_file)
    return out_file
