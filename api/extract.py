"""Vercel Python serverless function: stateless rule-based extractor.

POST { filename, mime, content_base64 }  (or { text })
->   { ok, text_len, extractions: [{field,value,source_span,confidence,rule_id}] }

Stateless by design: no DB access, no secrets. The Next.js side stores the file
and persists confirmed extractions; this endpoint only turns bytes -> suggestions.
"""

from http.server import BaseHTTPRequestHandler
import base64
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "engine"))

from extract import run_rules  # noqa: E402
from textract import extract_text  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")

            if payload.get("text") is not None:
                text = str(payload["text"])
            else:
                raw = base64.b64decode(payload.get("content_base64", ""))
                text = extract_text(raw, payload.get("mime", ""), payload.get("filename", ""))

            extractions = [e.to_dict() for e in run_rules(text)]
            self._send(200, {"ok": True, "text_len": len(text), "extractions": extractions})
        except Exception as exc:  # surface a clean error to the caller
            self._send(400, {"ok": False, "error": str(exc)})

    def _send(self, status: int, body: dict):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
