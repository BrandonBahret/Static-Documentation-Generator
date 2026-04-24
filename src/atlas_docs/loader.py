from __future__ import annotations

import re
import json
from pathlib import Path
from typing import Any

import yaml

from .models import NavEntry, NavGroup, Section, SidebarFooter, Site
from .markdown import render_markdown, render_markdown_inline


FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?", re.DOTALL)


def repair_mojibake(text: str) -> str:
    if not any(marker in text for marker in ("Ã", "â", "ð", "Â")):
        return text
    try:
        repaired = text.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text
    original_score = sum(text.count(marker) for marker in ("Ã", "â", "ð", "Â"))
    repaired_score = sum(repaired.count(marker) for marker in ("Ã", "â", "ð", "Â"))
    return repaired if repaired_score < original_score else text


def split_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    text = repair_mojibake(text)
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    frontmatter = match.group(1)
    try:
        data = yaml.safe_load(frontmatter) or {}
    except yaml.YAMLError:
        data = yaml.safe_load(quote_pipe_list_items(frontmatter)) or {}
    return data, text[match.end():]


def quote_pipe_list_items(frontmatter: str) -> str:
    """Tolerate Atlas pipe entries that are not valid YAML scalars."""
    fixed_lines: list[str] = []
    for line in frontmatter.splitlines():
        match = re.match(r"^(\s*-\s+)(.+\|.+?)\s*$", line)
        if match:
            fixed_lines.append(f"{match.group(1)}{json.dumps(match.group(2))}")
            continue
        match = re.match(r"^(\s*[A-Za-z_][\w-]*:\s+)(@[^\n#]*?)\s*$", line)
        if match:
            fixed_lines.append(f"{match.group(1)}{json.dumps(match.group(2))}")
        else:
            fixed_lines.append(line)
    return "\n".join(fixed_lines)


def read_frontmatter_file(path: Path) -> tuple[dict[str, Any], str]:
    return split_frontmatter(path.read_text(encoding="utf-8"))


def resolve_source_root(source: Path) -> Path:
    """Accept either the Atlas source root or its generated workspace parent."""
    source = source.resolve()
    if (source / "metadata.md").exists() and (source / "navigation.md").exists():
        return source

    nested = source / "atlas_docs"
    if (nested / "metadata.md").exists() and (nested / "navigation.md").exists():
        return nested.resolve()

    return source


def parse_pipe_entry(value: str) -> NavEntry:
    parts = [part.strip() for part in value.split("|")]
    if len(parts) < 2:
        raise ValueError(f"Navigation entry must be 'Label | target': {value!r}")
    external = len(parts) >= 3 and parts[2].lower() == "external"
    return NavEntry(label=parts[0].strip('"'), target=parts[1], external=external)


def load_navigation(source: Path) -> tuple[list[NavGroup], SidebarFooter | None]:
    meta, _ = read_frontmatter_file(source / "navigation.md")
    groups: list[NavGroup] = []
    for group in meta.get("groups", []):
        entries = [parse_pipe_entry(item) for item in group.get("entries", [])]
        groups.append(NavGroup(label=group["label"], entries=entries))

    footer_meta = meta.get("footer")
    footer: SidebarFooter | None = None
    if isinstance(footer_meta, dict):
        footer_entries = [parse_pipe_entry(item) for item in footer_meta.get("entries", [])]
        footer = SidebarFooter(label=footer_meta.get("label", "Links"), entries=footer_entries)

    return groups, footer


def nav_label_map(groups: list[NavGroup]) -> dict[str, str]:
    labels: dict[str, str] = {}
    for group in groups:
        for entry in group.entries:
            if not entry.external:
                labels[entry.slug] = entry.label
    return labels


def load_site(source: Path) -> Site:
    source = resolve_source_root(source)
    metadata, _ = read_frontmatter_file(source / "metadata.md")
    nav_groups, footer = load_navigation(source)
    labels = nav_label_map(nav_groups)

    assets: dict[str, Any] = {}
    assets_file = source / "assets.md"
    if assets_file.exists():
        assets, _ = read_frontmatter_file(assets_file)

    sections: list[Section] = []
    for slug, label in labels.items():
        content_file = source / "content" / f"{slug}.md"
        if not content_file.exists():
            raise FileNotFoundError(f"Navigation references missing content file: {content_file}")
        frontmatter, body = read_frontmatter_file(content_file)
        body_html = render_markdown(body, nav_labels=labels, assets=assets, section_slug=slug)
        sections.append(
            Section(
                slug=slug,
                label=label,
                tag=frontmatter.get("tag", ""),
                title=frontmatter.get("title", label),
                title_em=frontmatter.get("title_em", ""),
                lead=frontmatter.get("lead", ""),
                lead_html=render_markdown_inline(frontmatter.get("lead", ""), nav_labels=labels, assets=assets),
                breadcrumb=frontmatter.get("breadcrumb", f"{metadata.get('name', 'docs')} / {label}"),
                body_html=body_html,
                search_text=re.sub(r"<[^>]+>", " ", body_html),
                html_comment=frontmatter.get("comment", ""),
                frontmatter=frontmatter,
            )
        )

    return Site(source=source, metadata=metadata, nav_groups=nav_groups, sections=sections, footer=footer, assets=assets)
