from __future__ import annotations

import http.server
import shutil
import socketserver
from pathlib import Path
from typing import Optional

import typer

from .renderer import build_site, init_site

app = typer.Typer(help="Build Atlas documentation sites.")


@app.command()
def init(path: Path = typer.Argument(..., help="Directory to create.")) -> None:
    """Create a minimal Atlas docs source tree."""
    init_site(path)
    typer.echo(f"Created Atlas docs source at {path}")


@app.command()
def build(
    source: Path = typer.Argument(..., help="Atlas docs source directory."),
    out: Path = typer.Option(Path("dist/index.html"), "--out", "-o", help="Output HTML file."),
    theme: str = typer.Option("atlas_dark", "--theme", "-t", help="Theme name or theme directory."),
    pretty: bool = typer.Option(False, "--pretty", help="Keep output expanded for debugging."),
) -> None:
    """Compile an Atlas docs source tree into static HTML."""
    result = build_site(source=source, out_file=out, theme_name=theme, minify=False)
    typer.echo(f"Wrote {result}")


@app.command()
def serve(
    source: Path = typer.Argument(..., help="Atlas docs source directory."),
    out_dir: Path = typer.Option(Path(".atlas-preview"), "--out-dir", help="Preview output directory."),
    theme: str = typer.Option("atlas_dark", "--theme", "-t", help="Theme name or theme directory."),
    port: int = typer.Option(8000, "--port", "-p", help="Local preview port."),
) -> None:
    """Build and serve a local preview."""
    out_file = out_dir / "index.html"
    build_site(source=source, out_file=out_file, theme_name=theme, minify=False)
    handler = http.server.SimpleHTTPRequestHandler
    typer.echo(f"Serving {out_dir} at http://localhost:{port}")
    with socketserver.TCPServer(("", port), handler) as server:
        old_cwd = Path.cwd()
        try:
            import os
            os.chdir(out_dir)
            server.serve_forever()
        finally:
            os.chdir(old_cwd)


if __name__ == "__main__":
    app()
