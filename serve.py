#!/usr/bin/env python3
"""Tiny local web server for AventuraGaTo that disables browser caching.

This project has no build step -- every file is served exactly as it sits
on disk, which is normally great (edit a file, refresh, see the change).
But plain `python3 -m http.server` lets browsers cache the game's JS and
image files, and every browser's caching rules are a little different, so
sometimes an edit you just made doesn't show up even after a refresh --
until you hard-refresh, or close and reopen the tab, or clear the cache.

This script is the exact same server, just with caching turned off, so a
normal refresh always shows your latest changes. Use it instead of
`python3 -m http.server`:

    python3 serve.py          (defaults to port 8000)
    python3 serve.py 8080     (or pick your own port)
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Serving AventuraGaTo at http://localhost:{PORT} (caching disabled)")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
