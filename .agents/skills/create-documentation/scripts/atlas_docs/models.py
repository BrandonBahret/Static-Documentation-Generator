from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class NavEntry:
    label: str
    target: str
    external: bool = False

    @property
    def slug(self) -> str:
        return self.target


@dataclass(frozen=True)
class NavGroup:
    label: str
    entries: list[NavEntry]


@dataclass(frozen=True)
class SidebarFooter:
    label: str
    entries: list[NavEntry]


@dataclass
class Section:
    slug: str
    label: str
    tag: str
    title: str
    title_em: str = ""
    lead: str = ""
    breadcrumb: str = ""
    body_html: str = ""
    search_text: str = ""
    lead_html: str = ""
    html_comment: str = ""
    frontmatter: dict[str, Any] = field(default_factory=dict)

    @property
    def comment_label(self) -> str:
        return self.html_comment

    @property
    def metadata(self) -> dict[str, Any]:
        return self.frontmatter


@dataclass
class Site:
    source: Path
    metadata: dict[str, Any]
    nav_groups: list[NavGroup]
    sections: list[Section]
    footer: SidebarFooter | None = None
    assets: dict[str, Any] = field(default_factory=dict)

    @property
    def default_section(self) -> str:
        for group in self.nav_groups:
            for entry in group.entries:
                if not entry.external:
                    return entry.slug
        return self.sections[0].slug if self.sections else ""
