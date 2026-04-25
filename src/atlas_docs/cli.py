from __future__ import annotations

import http.server
import json
import queue
import threading
from functools import partial
from pathlib import Path

import typer
from watchfiles import Change, DefaultFilter, watch

from .loader import resolve_source_root
from .renderer import build_site
from .theme import package_path

app = typer.Typer(help="Build Atlas documentation sites.")

RELOAD_ENDPOINT = "/__atlas_reload__"
DEV_RELOAD_SCRIPT = f"""
(() => {{
  if (!window.EventSource) {{
    return;
  }}

  const source = new EventSource("{RELOAD_ENDPOINT}");
  source.addEventListener("reload", () => {{
    window.location.reload();
  }});
  source.onerror = () => {{
    if (source.readyState === EventSource.CLOSED) {{
      source.close();
    }}
  }};
}})();
"""


class AtlasWatchFilter(DefaultFilter):
    allowed_extensions = (
        ".css",
        ".gif",
        ".html",
        ".jpeg",
        ".jpg",
        ".js",
        ".json",
        ".md",
        ".png",
        ".svg",
        ".toml",
        ".txt",
        ".webp",
        ".yaml",
        ".yml",
    )

    def __call__(self, change: Change, path: str) -> bool:
        if not super().__call__(change, path):
            return False
        candidate = Path(path)
        if candidate.is_dir():
            return False
        if candidate.name == "theme.yaml":
            return True
        return candidate.suffix.lower() in self.allowed_extensions


class ReloadBroker:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._subscribers: set[queue.Queue[int | None]] = set()
        self._version = 0

    def subscribe(self) -> queue.Queue[int | None]:
        subscriber: queue.Queue[int | None] = queue.Queue()
        with self._lock:
            self._subscribers.add(subscriber)
        return subscriber

    def unsubscribe(self, subscriber: queue.Queue[int | None]) -> None:
        with self._lock:
            self._subscribers.discard(subscriber)

    def publish_reload(self) -> None:
        with self._lock:
            self._version += 1
            version = self._version
            subscribers = tuple(self._subscribers)
        for subscriber in subscribers:
            subscriber.put(version)


class AtlasPreviewServer(http.server.ThreadingHTTPServer):
    daemon_threads = True

    def __init__(
        self,
        server_address: tuple[str, int],
        handler_class: type[http.server.BaseHTTPRequestHandler],
        *,
        directory: str,
        reload_broker: ReloadBroker,
    ) -> None:
        self.directory = directory
        self.reload_broker = reload_broker
        super().__init__(server_address, handler_class)


class AtlasPreviewHandler(http.server.SimpleHTTPRequestHandler):
    server: AtlasPreviewServer

    def __init__(self, *args, directory: str | None = None, **kwargs) -> None:
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:
        if self.path.rstrip("/") == RELOAD_ENDPOINT:
            self.handle_reload_stream()
            return
        super().do_GET()

    def end_headers(self) -> None:
        if self.path in ("/", "/index.html"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def handle_reload_stream(self) -> None:
        subscriber = self.server.reload_broker.subscribe()
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        try:
            while True:
                try:
                    version = subscriber.get(timeout=15)
                except queue.Empty:
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
                    continue

                payload = f"event: reload\ndata: {json.dumps({'version': version})}\n\n"
                self.wfile.write(payload.encode("utf-8"))
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            return
        finally:
            self.server.reload_broker.unsubscribe(subscriber)


def build_preview(source: Path, out_dir: Path, theme: str) -> Path:
    out_file = out_dir / "index.html"
    return build_site(
        source=source,
        out_file=out_file,
        theme_name=theme,
        minify=False,
        extra_js=DEV_RELOAD_SCRIPT,
    )


def watch_paths_for(source: Path) -> list[Path]:
    paths = [
        source,
        package_path("templates"),
        package_path("static"),
        package_path("themes"),
    ]
    return [path.resolve() for path in paths]


def run_watcher(source: Path, out_dir: Path, theme: str, broker: ReloadBroker) -> None:
    watched_paths = watch_paths_for(source)
    for changes in watch(*watched_paths, watch_filter=AtlasWatchFilter(), debounce=250, step=50, raise_interrupt=False):
        try:
            result = build_preview(source, out_dir, theme)
        except Exception as exc:  # pragma: no cover - dev server path
            typer.echo(f"Rebuild failed: {exc}", err=True)
            continue

        changed_files = ", ".join(sorted(Path(path).name for _change, path in changes))
        typer.echo(f"Rebuilt {result} from changes: {changed_files}")
        broker.publish_reload()


@app.command()
def init(path: Path = typer.Argument(..., help="Directory to create.")) -> None:
    """Create a minimal Atlas docs source tree."""
    from .renderer import init_site

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
    """Build, watch, and serve a local preview with live reload."""
    source = resolve_source_root(source)
    result = build_preview(source, out_dir, theme)
    broker = ReloadBroker()

    watcher = threading.Thread(
        target=run_watcher,
        args=(source, out_dir, theme, broker),
        name="atlas-docs-watch",
        daemon=True,
    )
    watcher.start()

    handler = partial(AtlasPreviewHandler, directory=str(out_dir.resolve()))
    typer.echo(f"Serving {result.parent} at http://localhost:{port}")
    typer.echo("Watching source and theme files for changes.")
    with AtlasPreviewServer(("", port), handler, directory=str(out_dir.resolve()), reload_broker=broker) as server:
        server.serve_forever()


if __name__ == "__main__":
    app()
