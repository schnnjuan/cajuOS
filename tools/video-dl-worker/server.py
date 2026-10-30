import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

from flask import Flask, request, send_file, jsonify

app = Flask(__name__)

PORT = int(os.environ.get("PORT", "8080"))


def _safe_url(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/download")
def download():
    url = request.args.get("url", "").strip()
    if not url or not _safe_url(url):
        return jsonify({"ok": False, "error": "invalid-url"}), 400

    work = Path(tempfile.mkdtemp(prefix="gdl-"))
    try:
        proc = subprocess.run(
            ["gallery-dl", "-q", "-D", str(work), url],
            capture_output=True,
            text=True,
            timeout=300,
        )
        files = [p for p in work.rglob("*") if p.is_file()]
        if not files:
            return jsonify({"ok": False, "error": "no-media", "stderr": proc.stderr[-500:]}), 404

        if len(files) == 1:
            f = files[0]
            resp = send_file(f, as_attachment=True, download_name=f.name)
            return resp

        zip_base = Path(tempfile.gettempdir()) / f"gallery-{uuid.uuid4().hex}"
        shutil.make_archive(str(zip_base), "zip", work)
        zip_path = zip_base.with_suffix(".zip")
        resp = send_file(zip_path, as_attachment=True, download_name="gallery.zip")
        # cleanup zip after response? Flask send_file streams; delete via after_request not needed for container reuse? Clean best-effort.
        return resp
    except subprocess.TimeoutExpired:
        return jsonify({"ok": False, "error": "timeout"}), 504
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)