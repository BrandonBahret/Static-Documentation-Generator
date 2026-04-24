from __future__ import annotations

import re
from importlib.resources import files
from pathlib import Path
from typing import Any

import yaml
from jinja2 import Environment, FileSystemLoader, PackageLoader, select_autoescape


THEME_FAMILIES: dict[str, dict[str, str]] = {
    "atlas": {
        "dark": "atlas_dark",
        "light": "atlas_light",
    }
}


def package_path(*parts: str) -> Path:
    return Path(str(files("atlas_docs").joinpath(*parts)))


def resolve_theme(theme_name: str) -> Path:
    candidate = Path(theme_name)
    if candidate.exists():
        return candidate.resolve()
    bundled = package_path("themes", theme_name)
    if bundled.exists():
        return bundled
    raise FileNotFoundError(f"Theme not found: {theme_name}")


def theme_family_variants(theme_name: str) -> dict[str, str] | None:
    for variants in THEME_FAMILIES.values():
        if theme_name in variants.values():
            return variants
    return None


def resolve_theme_variant(theme_name: str, color_scheme: str | None) -> str:
    variants = theme_family_variants(theme_name)
    if not variants:
        return theme_name
    target_scheme = (color_scheme or "dark").strip().lower()
    return variants.get(target_scheme, theme_name)


def alternate_theme_name(theme_name: str) -> str | None:
    variants = theme_family_variants(theme_name)
    if not variants:
        return None
    if theme_name == variants.get("dark"):
        return variants.get("light")
    if theme_name == variants.get("light"):
        return variants.get("dark")
    return None


def hex_to_rgba(value: str, alpha: float) -> str | None:
    raw = value.strip()
    if not raw.startswith("#"):
        return None
    hex_value = raw[1:]
    if len(hex_value) == 3:
        hex_value = "".join(ch * 2 for ch in hex_value)
    if len(hex_value) != 6:
        return None
    try:
        red = int(hex_value[0:2], 16)
        green = int(hex_value[2:4], 16)
        blue = int(hex_value[4:6], 16)
    except ValueError:
        return None
    return f"rgba({red},{green},{blue},{alpha})"


def metadata_accent_for_scheme(metadata: dict[str, Any], color_scheme: str | None) -> str | None:
    scheme = (color_scheme or "dark").strip().lower()
    scheme_key = f"accent_{scheme}"
    accent = metadata.get(scheme_key)
    if accent:
        return accent
    accent = metadata.get("accent")
    return accent if accent else None


def load_theme(theme_name: str, metadata: dict[str, Any], apply_metadata_color_scheme: bool = True) -> dict[str, Any]:
    theme_dir = resolve_theme(theme_name)
    data = yaml.safe_load((theme_dir / "theme.yaml").read_text(encoding="utf-8")) or {}
    tokens = data.setdefault("tokens", {})
    # metadata can override identity-adjacent visual choices
    accent = metadata_accent_for_scheme(metadata, data.get("color_scheme"))
    if accent:
        tokens["accent"] = accent
        accent_glow = hex_to_rgba(accent, 0.12)
        if accent_glow:
            tokens["accent_glow"] = accent_glow
    for key in ("display_font", "body_font", "mono_font"):
        if metadata.get(key):
            data[key] = metadata[key]
    if apply_metadata_color_scheme and metadata.get("color_scheme"):
        data["color_scheme"] = metadata["color_scheme"]
    if metadata.get("font_source") and "css2?" in str(metadata["font_source"]):
        data["font_source"] = metadata["font_source"]
    data["name"] = data.get("name", theme_name)
    data["theme_dir"] = theme_dir
    return data


def theme_asset_dirs(theme: dict[str, Any]) -> list[Path]:
    dirs: list[Path] = []
    current = theme
    seen: set[str] = set()

    while True:
        theme_dir: Path = current["theme_dir"]
        dirs.append(theme_dir)
        parent_name = current.get("extends")
        if not parent_name:
            break
        if parent_name in seen:
            raise ValueError(f"Cyclic theme inheritance detected: {parent_name}")
        seen.add(parent_name)
        parent_theme = load_theme(parent_name, {}, apply_metadata_color_scheme=False)
        current = parent_theme

    return dirs


def render_tokens(theme: dict[str, Any], selector: str) -> str:
    theme_dirs = theme_asset_dirs(theme)
    env = Environment(loader=FileSystemLoader([str(path) for path in theme_dirs]), autoescape=False)
    return env.get_template("tokens.css.j2").render(
        theme=theme,
        tokens=theme.get("tokens", {}),
        selector=selector,
    )


def render_css(theme: dict[str, Any], alternate_theme: dict[str, Any] | None = None) -> str:
    theme_dirs = theme_asset_dirs(theme)
    parts: list[str] = []
    primary_scheme = (theme.get("color_scheme") or "dark").strip().lower()
    primary_selector = f':root, html[data-color-scheme="{primary_scheme}"]'
    parts.append(render_tokens(theme, primary_selector))

    if alternate_theme:
        alternate_scheme = (alternate_theme.get("color_scheme") or "light").strip().lower()
        parts.append(render_tokens(alternate_theme, f'html[data-color-scheme="{alternate_scheme}"]'))

    for filename in ["tokens.css.j2", "base.css", "layout.css", "components.css", "code.css"]:
        if filename.endswith(".j2"):
            continue
        path = next((directory / filename for directory in theme_dirs if (directory / filename).exists()), None)
        if path is None:
            continue
        parts.append(path.read_text(encoding="utf-8"))
    return "\n\n".join(parts)


def indent_section_html(value: str, spaces: int = 8) -> str:
    prefix = " " * spaces
    lines = space_section_html(value).splitlines()
    output: list[str] = []
    in_pre = False

    for line in lines:
        if in_pre:
            output.append(line)
            if "</code></pre>" in line:
                in_pre = False
            continue

        if line:
            if line.startswith("<li>"):
                output.append(prefix + "  " + line)
            else:
                output.append(prefix + line)
        else:
            output.append(line)

        if "<pre" in line and "</code></pre>" not in line:
            in_pre = True

    return "\n".join(output)


def space_section_html(value: str) -> str:
    lines = value.splitlines()
    output: list[str] = []
    in_pre = False
    current_pre_lang = ""
    last_closed_pre_lang = ""

    def needs_blank_before(line: str) -> bool:
        if not output or not output[-1]:
            return False
        if line.startswith(("<h2>", "<h3>")):
            return True
        if line.startswith("<h4>"):
            previous_nonblank = next((item for item in reversed(output[:-1]) if item), "")
            if output[-1].startswith("<h3>") and previous_nonblank.endswith("</table>"):
                return False
            return True
        if line.startswith('<pre data-lang="python"') and output[-1].startswith("<p>"):
            return True
        if line.startswith('<pre data-lang="python"') and output[-1] == "<h2>Store and read</h2>":
            return True
        if line.startswith(('<div class="feature-grid">', '<div class="callout ')):
            return True
        if line.startswith('<div class="selector-row">'):
            return output[-1].startswith("<h2>")
        if line == "<table>" and output[-1].startswith("<p>Returns the backend class"):
            return True
        if line == "<hr>":
            return True
        if line.startswith("<p>") and output[-1].endswith("</code></pre>") and last_closed_pre_lang != "bash":
            return True
        return False

    for line in lines:
        if in_pre:
            output.append(line)
            if "</code></pre>" in line:
                in_pre = False
                last_closed_pre_lang = current_pre_lang
                current_pre_lang = ""
            continue

        if needs_blank_before(line):
            output.append("")
        output.append(line)

        if line.startswith("<pre"):
            lang_match = re.search(r'data-lang="([^"]+)"', line)
            current_pre_lang = lang_match.group(1) if lang_match else ""
            if "</code></pre>" in line:
                last_closed_pre_lang = current_pre_lang
                current_pre_lang = ""
            else:
                in_pre = True

    return "\n".join(output)


def template_env() -> Environment:
    env = Environment(
        loader=PackageLoader("atlas_docs", "templates"),
        autoescape=select_autoescape(["html", "xml", "j2"]),
        trim_blocks=False,
        lstrip_blocks=False,
    )
    env.filters["indent_section_html"] = indent_section_html
    return env
