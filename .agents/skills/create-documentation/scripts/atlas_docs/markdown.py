from __future__ import annotations

import html
import re
from typing import Any

from markdown_it import MarkdownIt


DOC_LINK_RE = re.compile(
    r"\[([^\]\|]+?)\s*\|\s*doc:([a-zA-Z0-9_-]+(?:#[a-zA-Z0-9_-]+)?)\]|\[doc:([a-zA-Z0-9_-]+(?:#[a-zA-Z0-9_-]+)?)\]"
)
ASSET_RE = re.compile(r"@asset\[([a-zA-Z0-9_-]+)\]")
INLINE_REF_RE = re.compile(r"`([^`]+?)\{ref=([a-zA-Z0-9_-]+(?:#[a-zA-Z0-9_-]+)?)\}`")
HEADING_LINE_RE = re.compile(r"^(#{2,4})\s+(.+?)(?:\s+\{id=([A-Za-z0-9_-]+)\})?\s*$")
METHOD_ARROW_RE = re.compile(r"\s*(?:→|->)\s*([A-Za-z_][A-Za-z0-9_\[\].]*)$")


md = MarkdownIt("commonmark", {"html": True, "linkify": False, "typographer": False}).enable("table")
md_inline = MarkdownIt("commonmark", {"html": True, "linkify": False, "typographer": False}).enable("table")


def protect_fenced_code_blocks(text: str) -> tuple[str, dict[str, str]]:
    lines = text.splitlines(keepends=True)
    placeholders: dict[str, str] = {}
    rendered: list[str] = []
    index = 0

    while index < len(lines):
        opener = re.match(r"^ {0,3}([`~]{3,})(.*)$", lines[index])
        if not opener:
            rendered.append(lines[index])
            index += 1
            continue

        fence = opener.group(1)
        fence_char = fence[0]
        fence_len = len(fence)
        block_lines = [lines[index]]
        index += 1

        while index < len(lines):
            block_lines.append(lines[index])
            closer = re.match(r"^ {0,3}([`~]{3,})[ \t]*\r?\n?$", lines[index])
            if closer and closer.group(1)[0] == fence_char and len(closer.group(1)) >= fence_len:
                index += 1
                break
            index += 1

        token = f"@@ATLAS_LITERAL_BLOCK_{len(placeholders)}@@"
        placeholders[token] = "".join(block_lines)
        rendered.append(token)

    return "".join(rendered), placeholders


def protect_inline_code_spans(text: str) -> tuple[str, dict[str, str]]:
    placeholders: dict[str, str] = {}
    rendered: list[str] = []
    index = 0

    while index < len(text):
        if text[index] != "`":
            rendered.append(text[index])
            index += 1
            continue

        opener_end = index
        while opener_end < len(text) and text[opener_end] == "`":
            opener_end += 1
        fence_len = opener_end - index

        closer_start = opener_end
        while closer_start < len(text):
            closer_start = text.find("`", closer_start)
            if closer_start == -1:
                break
            closer_end = closer_start
            while closer_end < len(text) and text[closer_end] == "`":
                closer_end += 1
            if closer_end - closer_start == fence_len:
                token = f"@@ATLAS_LITERAL_INLINE_{len(placeholders)}@@"
                placeholders[token] = text[index:closer_end]
                rendered.append(token)
                index = closer_end
                break
            closer_start = closer_end
        else:
            closer_start = -1

        if closer_start == -1:
            rendered.append(text[index:opener_end])
            index = opener_end

    return "".join(rendered), placeholders


def restore_literal_regions(text: str, placeholders: dict[str, str]) -> str:
    for token, original in placeholders.items():
        text = text.replace(token, original)
    return text


def apply_prose_transforms(
    text: str,
    nav_labels: dict[str, str],
    assets: dict[str, Any],
    *,
    current_section_slug: str = "",
    protect_fences: bool = False,
    protect_inline: bool = False,
    include_assets: bool = True,
) -> str:
    placeholders: dict[str, str] = {}
    if protect_fences:
        text, fence_placeholders = protect_fenced_code_blocks(text)
        placeholders.update(fence_placeholders)
    if protect_inline:
        text, inline_placeholders = protect_inline_code_spans(text)
        placeholders.update(inline_placeholders)

    text = suppress_proximate_inline_refs(text, current_section_slug)
    text = render_doc_links(text, nav_labels)
    text = render_inline_refs(text)
    if include_assets:
        text = render_assets(text, assets)
    return restore_literal_regions(text, placeholders)


def attrs_to_dict(value: str | None) -> dict[str, str]:
    if not value:
        return {}
    pairs = re.findall(r"([a-zA-Z_][\w-]*)=([^\s}]+)", value)
    return {key: raw.strip('"').strip("'") for key, raw in pairs}


def html_attrs(base_class: str, attrs: dict[str, str], *, allow: set[str] | None = None) -> str:
    merged = dict(attrs)
    classes = [base_class]
    if merged.get("class"):
        classes.append(merged.pop("class"))
    rendered = [f'class="{html.escape(" ".join(classes))}"']
    for key, value in merged.items():
        if allow is not None and key not in allow and not key.startswith("data-") and not key.startswith("aria-"):
            continue
        rendered.append(f'{html.escape(key)}="{html.escape(value)}"')
    return " " + " ".join(rendered)


def atlas_slugify(text: str) -> str:
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", (text or "").lower())).strip("-")[:64]


def parse_ref_target(target: str) -> tuple[str, str]:
    slug, _, anchor = target.partition("#")
    return slug, anchor


def build_section_target_id(slug: str, anchor: str) -> str:
    clean_anchor = anchor.strip()
    return f"{slug}-{clean_anchor}" if clean_anchor else ""


def suppress_proximate_inline_refs(text: str, current_section_slug: str = "") -> str:
    if not current_section_slug:
        return text

    def repl(match: re.Match[str]) -> str:
        token, target = match.group(1), match.group(2)
        slug, _ = parse_ref_target(target)
        if slug == current_section_slug:
            return f"`{token}`"
        return match.group(0)

    return INLINE_REF_RE.sub(repl, text)


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value)


def extract_heading_specs(text: str) -> tuple[str, list[dict[str, str]]]:
    lines = text.splitlines()
    rendered: list[str] = []
    specs: list[dict[str, str]] = []
    fence_open = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            fence_open = not fence_open
            rendered.append(line)
            continue

        if fence_open:
            rendered.append(line)
            continue

        match = HEADING_LINE_RE.match(line)
        if not match:
            rendered.append(line)
            continue

        title = match.group(2).strip()
        rendered.append(f"{match.group(1)} {title}")
        specs.append({
            "level": str(len(match.group(1))),
            "title": title,
            "anchor": match.group(3) or "",
        })

    return "\n".join(rendered), specs


def add_heading_ids(html_text: str, section_slug: str, heading_specs: list[dict[str, str]]) -> str:
    heading_iter = iter(heading_specs)
    used_ids: dict[str, int] = {}

    def repl(match: re.Match[str]) -> str:
        level = match.group(1)
        inner = match.group(2)
        try:
            spec = next(heading_iter)
        except StopIteration:
            spec = {"level": level, "title": strip_tags(inner).strip(), "anchor": ""}

        anchor = spec.get("anchor") or atlas_slugify(spec.get("title") or strip_tags(inner).strip())
        if not anchor:
            anchor = f"h{level}"

        count = used_ids.get(anchor, 0) + 1
        used_ids[anchor] = count
        if count > 1:
            anchor = f"{anchor}-{count}"

        dom_id = build_section_target_id(section_slug, anchor)
        return f'<h{level} id="{html.escape(dom_id)}" data-anchor="{html.escape(anchor)}">{inner}</h{level}>'

    return re.sub(r"<h([2-4])>(.*?)</h\1>", repl, html_text, flags=re.DOTALL)


def render_markdown_inline(
    text: str,
    nav_labels: dict[str, str],
    assets: dict[str, Any],
    *,
    current_section_slug: str = "",
) -> str:
    text = text.strip()
    text = apply_prose_transforms(
        text,
        nav_labels,
        assets,
        current_section_slug=current_section_slug,
        protect_inline=True,
    )
    return render_inline_html(md_inline.renderInline(text))


def render_inline_html(value: str) -> str:
    value = add_external_link_targets(value)
    return value.replace("<hr />", "<hr>").replace("&quot;", '"')


def render_doc_links(text: str, nav_labels: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        if match.group(2):
            label, target = match.group(1), match.group(2)
        else:
            target = match.group(3)
            slug, _ = parse_ref_target(target)
            label = nav_labels.get(slug, slug)
        slug, anchor = parse_ref_target(target)
        target_id = build_section_target_id(slug, anchor)
        label_html = md_inline.renderInline(label).strip()
        href = f"#section-{slug}:{target_id}" if target_id else f"#section-{slug}"
        target_attr = f' data-target-id="{html.escape(target_id)}"' if target_id else ""
        return f'<a class="doc-link" href="{href}" data-doc-link="{slug}"{target_attr}>{label_html}</a>'

    return DOC_LINK_RE.sub(repl, text)


def render_inline_refs(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        token, target = match.group(1), match.group(2)
        slug, anchor = parse_ref_target(target)
        target_id = build_section_target_id(slug, anchor)
        target_attr = f' data-target-id="{html.escape(target_id)}"' if target_id else ""
        return f'<code class="inline-code-ref" data-section-id="{html.escape(slug)}"{target_attr}>{html.escape(token)}</code>'

    return INLINE_REF_RE.sub(repl, text)


def render_assets(text: str, assets: dict[str, Any]) -> str:
    catalog = {}
    for row in assets.get("svgs", []) or []:
        if isinstance(row, str):
            name, path, *_ = [part.strip() for part in row.split("|")]
            catalog[name] = {"kind": "svg", "path": path}
    for key in ("images", "remote_images"):
        for row in assets.get(key, []) or []:
            if isinstance(row, str):
                name, path, *rest = [part.strip() for part in row.split("|")]
                alt = rest[0] if rest else name
                catalog[name] = {"kind": "image", "path": path, "alt": alt}

    def repl(match: re.Match[str]) -> str:
        name = match.group(1)
        asset = catalog.get(name)
        if not asset:
            return f"<!-- missing asset: {html.escape(name)} -->"
        if asset["kind"] == "svg":
            return f'<span class="asset asset-svg" data-asset="{html.escape(name)}"></span>'
        return f'<img class="asset asset-image" src="{html.escape(asset["path"])}" alt="{html.escape(asset["alt"])}">'

    return ASSET_RE.sub(repl, text)


def parse_items(body: str) -> list[tuple[str, dict[str, str], str]]:
    chunks = re.split(r"^###\s+", body.strip(), flags=re.MULTILINE)
    items = []
    for chunk in chunks:
        if not chunk.strip():
            continue
        first, _, rest = chunk.partition("\n")
        attr_match = re.search(r"\{([^}]+)\}\s*$", first)
        attrs = attrs_to_dict(attr_match.group(1) if attr_match else None)
        title = re.sub(r"\s*\{[^}]+\}\s*$", "", first).strip()
        items.append((title, attrs, rest.strip()))
    return items


def render_directive(kind: str, attr_line: str | None, body: str, nav_labels: dict[str, str], assets: dict[str, Any]) -> str:
    if kind == "feature_grid":
        container_attrs = html_attrs("feature-grid", attrs_to_dict(attr_line), allow={"id"})
        rows = []
        for title, item_attrs, content in parse_items(body):
            rows.append(
                "  <div class=\"feature-item\">\n"
                f"    <div class=\"feature-icon\">{html.escape(item_attrs.get('icon', '•'))}</div>\n"
                "    <div class=\"feature-text\">\n"
                f"      <strong>{render_markdown_inline(title, nav_labels, assets)}</strong>\n"
                f"      <span>{render_markdown_inline(content, nav_labels, assets)}</span>\n"
                "    </div>\n"
                "  </div>"
            )
        return f"<div{container_attrs}>\n" + "\n".join(rows) + "\n</div>"

    if kind == "cards":
        container_attrs = html_attrs("cards", attrs_to_dict(attr_line), allow={"id"})
        rows = []
        for title, item_attrs, content in parse_items(body):
            slug = item_attrs.get("link")
            if slug:
                rows.append(
                    f"  <div class=\"card\" data-card-link=\"{html.escape(slug)}\">\n"
                    f"    <div class=\"card-title\">→ {render_markdown_inline(title, nav_labels, assets)}</div>\n"
                    f"    <div class=\"card-desc\">{render_markdown_inline(content, nav_labels, assets)}</div>\n"
                    "  </div>"
                )
            else:
                title_html = render_markdown_inline(title, nav_labels, assets)
                color = "var(--red)" if title.strip().startswith("✗") else "var(--accent)"
                rows.append(
                    "  <div class=\"card\" style=\"cursor:default\">\n"
                    f"    <div class=\"card-title\" style=\"color: {color};\">{title_html}</div>\n"
                    f"    <div class=\"card-desc\">{render_markdown_inline(content, nav_labels, assets)}</div>\n"
                    "  </div>"
                )
        return f"<div{container_attrs}>\n" + "\n".join(rows) + "\n</div>"

    if kind == "callout":
        variant = (attr_line or "").strip() or "default"
        rendered = md.render(
            apply_prose_transforms(body, nav_labels, assets, protect_fences=True, protect_inline=True, include_assets=False)
        ).strip()
        rendered = rendered.replace("&quot;", '"')
        paragraph_match = re.fullmatch(r"<p>(.*)</p>", rendered, flags=re.DOTALL)
        if paragraph_match:
            rendered = paragraph_match.group(1)
        return f'<div class="callout {html.escape(variant)}">{rendered}</div>'

    if kind == "method":
        return render_method_block(body.strip())

    if kind == "selector_list":
        rows = []
        for title, _, content in parse_items(body):
            syntax = render_markdown_inline(title, nav_labels, assets)
            code_match = re.fullmatch(r"<code>(.*?)</code>", syntax)
            if code_match:
                syntax = code_match.group(1)
            rows.append(
                "<div class=\"selector-row\">\n"
                f"  <div class=\"selector-syntax\">{syntax}</div>\n"
                f"  <div class=\"selector-desc\">{render_markdown_inline(content, nav_labels, assets)}</div>\n"
                "</div>"
            )
        return "\n".join(rows)

    if kind == "table":
        return format_table_html(md.render(body).strip().replace("<hr />", "<hr>"))

    if kind in {"quick_links", "reference_list"}:
        cls = "quick-links" if kind == "quick_links" else "reference-list"
        rendered = md.render(
            apply_prose_transforms(body, nav_labels, assets, protect_fences=True, protect_inline=True, include_assets=False)
        ).strip()
        return f'<div class="{cls}">\n{rendered}\n</div>'

    return md.render(body).strip()


def format_table_html(value: str) -> str:
    headers = re.findall(r"<th>(.*?)</th>", value, flags=re.DOTALL)
    row_html = re.findall(r"<tr>\s*((?:<td>.*?</td>\s*)+)</tr>", value, flags=re.DOTALL)
    rows = [re.findall(r"<td>(.*?)</td>", row, flags=re.DOTALL) for row in row_html]
    if not headers or not rows:
        return value

    def text_len(cell: str) -> int:
        return len(re.sub(r"<[^>]+>", "", cell))

    if headers == ["Attribute", "Description"]:
        return format_table_compact(headers, rows)

    long_cells = any(text_len(cell) > 70 for row in rows for cell in row)
    if long_cells and len(headers) >= 3:
        return format_table_pretty(headers, rows)
    if long_cells:
        return format_table_semipretty(headers, rows)
    return format_table_compact(headers, rows)


def format_table_pretty(headers: list[str], rows: list[list[str]]) -> str:
    lines = ["<table>", "  <thead>", "    <tr>"]
    lines.extend(f"      <th>{header}</th>" for header in headers)
    lines.extend(["    </tr>", "  </thead>", "  <tbody>"])
    for row in rows:
        lines.append("    <tr>")
        lines.extend(f"      <td>{cell}</td>" for cell in row)
        lines.append("    </tr>")
    lines.extend(["  </tbody>", "</table>"])
    return "\n".join(lines)


def format_table_semipretty(headers: list[str], rows: list[list[str]]) -> str:
    head = "".join(f"<th>{header}</th>" for header in headers)
    lines = ["<table>", f"  <thead>", f"    <tr>{head}</tr>", "  </thead>", "  <tbody>"]
    for row in rows:
        lines.append("    <tr>")
        lines.extend(f"      <td>{cell}</td>" for cell in row)
        lines.append("    </tr>")
    lines.extend(["  </tbody>", "</table>"])
    return "\n".join(lines)


def format_table_compact(headers: list[str], rows: list[list[str]]) -> str:
    head = "".join(f"<th>{header}</th>" for header in headers)
    lines = ["<table>", f"  <thead><tr>{head}</tr></thead>", "  <tbody>"]
    lines.extend("    <tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows)
    lines.extend(["  </tbody>", "</table>"])
    return "\n".join(lines)


def split_signature_args(params: str) -> list[str]:
    args: list[str] = []
    current: list[str] = []
    depth = 0
    for char in params:
        if char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        if char == "," and depth == 0:
            part = "".join(current).strip()
            if part:
                args.append(part + ",")
            current = []
            continue
        current.append(char)
    tail = "".join(current).strip()
    if tail:
        args.append(tail)
    return args


def group_signature_args(args: list[str], max_len: int = 50) -> list[str]:
    if len(args) <= 3:
        return args

    grouped: list[str] = []
    current = ""
    index = 0
    while index < len(args):
        arg = args[index]
        if arg == "*,":
            if current:
                grouped.append(current)
            if index + 1 < len(args):
                current = f"*, {args[index + 1]}"
                index += 2
                continue
            current = arg
            index += 1
            continue

        candidate = f"{current} {arg}" if current else arg
        if current.startswith("*,") and ":" not in current:
            limit = 60
        elif ":" in current:
            limit = 40
        else:
            limit = max_len
        if current and len(candidate) > limit:
            grouped.append(current)
            current = arg
        else:
            current = candidate
        index += 1
    if current:
        grouped.append(current)
    return grouped


def render_method_prefix(prefix: str) -> str:
    rendered = html.escape(prefix)
    rendered = re.sub(r"^(@[\w.]+)", r'<span class="dc">\1</span>', rendered)
    rendered = re.sub(r"^([A-Z][A-Za-z0-9_]*)(?=\s*$)", r'<span class="cl">\1</span>', rendered)
    rendered = re.sub(r"\.([A-Za-z_][A-Za-z0-9_]*)(?=\s*$)", r'.<span class="mname">\1</span>', rendered)
    rendered = re.sub(r"^([a-z_][A-Za-z0-9_]*)(?=\s*$)", r'<span class="fn">\1</span>', rendered)
    return rendered


def render_method_signature(method: str) -> str:
    method = html.escape(method)
    method = re.sub(r"^(@[\w.]+)", r'<span class="dc">\1</span>', method)
    method = re.sub(r"^([A-Z][A-Za-z0-9_]*)(?=\[|\()", r'<span class="cl">\1</span>', method)
    method = re.sub(r"^([a-z_][A-Za-z0-9_]*)(?=\()", r'<span class="fn">\1</span>', method)
    method = re.sub(r"\.([A-Za-z_][A-Za-z0-9_]*)(?=\()", r'.<span class="mname">\1</span>', method)

    def params_repl(match: re.Match[str]) -> str:
        params = match.group(1)
        return "()" if not params else f'(<span class="mparam">{params}</span>)'

    method = re.sub(r"\((.*)\)", params_repl, method)
    method = re.sub(r"\s*(?:→|-&gt;)\s*([A-Za-z_][A-Za-z0-9_\[\].]*)", r' → <span class="mtype">\1</span>', method)
    return method


def render_method_block(text: str) -> str:
    expanded = re.sub(r"\{fn:([^}]+)\}", r'<span class="mname">\1</span>', text)
    expanded = re.sub(r"\{param:([^}]+)\}", r'<span class="mparam">\1</span>', expanded)
    expanded = re.sub(r"\{type:([^}]+)\}", r'<span class="mtype">\1</span>', expanded)
    expanded = re.sub(r"\{default:([^}]+)\}", r'<span class="mdefault">\1</span>', expanded)
    if "<span" in expanded:
        return f'<div class="method">{expanded}</div>'

    match = re.match(r"^(.*?)(\((.*)\))(.*)$", text)
    if not match:
        return f'<div class="method">{render_method_signature(text)}</div>'

    prefix = match.group(1).strip()
    params = match.group(3)
    suffix = match.group(4).strip()
    args = split_signature_args(params)
    multiline = (text.strip().endswith(",)") and len(args) >= 3) or (len(text) > 150 and len(args) >= 4)
    if not multiline:
        return f'<div class="method">{render_method_signature(text)}</div>'

    lines = [f"{render_method_prefix(prefix)}(<br>"]
    for arg in group_signature_args(args):
        lines.append(f'&nbsp;&nbsp;<span class="mparam">{html.escape(arg)}</span><br>')
    closing = ")"
    arrow_match = METHOD_ARROW_RE.match(suffix)
    if arrow_match:
        closing += f' → <span class="mtype">{html.escape(arrow_match.group(1))}</span>'
    return "<div class=\"method\">\n  " + "\n  ".join(lines + [closing]) + "\n</div>"


def render_directives(text: str, nav_labels: dict[str, str], assets: dict[str, Any]) -> str:
    lines = text.splitlines()
    rendered: list[str] = []
    index = 0
    while index < len(lines):
        opener = re.match(r"^:::(\w+)(?:\s+(.+))?\s*$", lines[index])
        if not opener:
            rendered.append(lines[index])
            index += 1
            continue

        kind, attr_line = opener.group(1), opener.group(2)
        body_lines: list[str] = []
        index += 1
        while index < len(lines) and lines[index].strip() != ":::":
            body_lines.append(lines[index])
            index += 1
        if index == len(lines):
            rendered.append(lines[index - len(body_lines) - 1])
            rendered.extend(body_lines)
            break

        rendered.append(render_directive(kind, attr_line, "\n".join(body_lines), nav_labels, assets))
        index += 1

    return "\n".join(rendered)


def add_external_link_targets(value: str) -> str:
    return re.sub(r'<a href="(https?://[^"]+)"(?![^>]*target=)', r'<a href="\1" target="_blank"', value)


def render_markdown(text: str, nav_labels: dict[str, str], assets: dict[str, Any], *, section_slug: str = "") -> str:
    text, heading_specs = extract_heading_specs(text)
    text = apply_prose_transforms(
        text,
        nav_labels,
        assets,
        current_section_slug=section_slug,
        protect_fences=True,
        protect_inline=True,
    )
    text = render_directives(text, nav_labels, assets)
    html_text = md.render(text)
    if section_slug:
        html_text = add_heading_ids(html_text, section_slug, heading_specs)
    html_text = render_code_blocks(html_text)
    return render_inline_html(html_text)


def render_code_blocks(html_text: str) -> str:
    pattern = re.compile(r'<pre><code class="language-([^"]+)">(.*?)\n?</code></pre>', re.DOTALL)

    def repl(match: re.Match[str]) -> str:
        lang = html.escape(match.group(1))
        code = highlight_code(match.group(2), lang)
        return f'<pre data-lang="{lang}"><code>{code}</code></pre>'

    return pattern.sub(repl, html_text)


def highlight_code(code: str, lang: str) -> str:
    if lang not in {"python", "py"}:
        return code
    code = html.unescape(code)
    tokens: dict[str, str] = {}
    keywords = {"from", "import", "class", "def", "return", "if", "else", "elif", "for", "while", "with", "as", "None", "True", "False", "try", "except", "finally", "raise", "in", "not", "and", "or", "async", "await", "is"}

    def placeholder(value: str) -> str:
        key = chr(0xE000 + len(tokens))
        tokens[key] = value
        return key

    def stash(pattern: str, class_name: str, value: str, flags: int = 0) -> str:
        def repl(match: re.Match[str]) -> str:
            escaped = html.escape(match.group(0), quote=False)
            return placeholder(f'<span class="{class_name}">{escaped}</span>')

        return re.sub(pattern, repl, value, flags=flags)

    def stash_strings(value: str) -> str:
        def repl(match: re.Match[str]) -> str:
            raw = match.group(0)
            prefix = "f" if raw.startswith("f") else ""
            literal = raw[1:] if prefix else raw
            return prefix + placeholder(f'<span class="st">{html.escape(literal, quote=False)}</span>')

        return re.sub(r'(?<![A-Za-z0-9_])(f?"[^"\n]*"|f?\'[^\'\n]*\')', repl, value)

    def stash_classes(value: str) -> str:
        def repl(match: re.Match[str]) -> str:
            word = match.group(0)
            if word in keywords:
                return word
            if match.start() == 0:
                return word
            return placeholder(f'<span class="cl">{word}</span>')

        processed: list[str] = []
        in_import = False
        for line in value.splitlines():
            starts_import = bool(re.search(r"\bimport\b", line))
            if starts_import:
                in_import = "(" in line and ")" not in line
            if in_import:
                processed.append(line)
            elif starts_import:
                processed.append(line)
            else:
                processed.append(re.sub(r"\b([A-Z][A-Za-z0-9_]*)\b", repl, line))
            if in_import and ")" in line:
                in_import = False
        return "\n".join(processed)

    def stash_bare_functions(value: str) -> str:
        skip = {"print"}

        def repl(match: re.Match[str]) -> str:
            name = match.group(1)
            if name in skip:
                return name
            return placeholder(f'<span class="fn">{name}</span>')

        return re.sub(r"\b([a-z_][A-Za-z0-9_]*)\b(?=\()", repl, value)

    def stash_super(value: str) -> str:
        def repl(match: re.Match[str]) -> str:
            tail = value[match.end():]
            class_name = "kw" if tail.startswith(".__init__(\n    origins={\n") else "fn"
            return placeholder(f'<span class="{class_name}">super()</span>')

        return re.sub(r"\bsuper\(\)", repl, value)

    code = stash(r"(?m)#.*$", "cm", code)
    code = stash_strings(code)
    code = stash(r"(@[A-Za-z_][A-Za-z0-9_.]*)", "dc", code)
    code = stash_super(code)
    code = stash(r"(?<=\bdef\s)([A-Za-z_][A-Za-z0-9_]*)(?=\()", "fn", code)
    code = stash(r"(?<=\.)([A-Za-z_][A-Za-z0-9_]*)(?=\()", "fn", code)
    code = stash_bare_functions(code)
    code = stash_classes(code)
    code = stash(r"\bif\s+not\b", "kw", code)
    code = stash(r"\b(from|import|class|def|return|if|else|elif|for|while|with|as|None|True|False|try|except|finally|raise|in|not|and|or|async|await|is)\b", "kw", code)
    code = stash(r"\b(\d+(?:\.\d+)?)\b", "num", code)

    for token, rendered in tokens.items():
        code = code.replace(token, rendered)
    return code
