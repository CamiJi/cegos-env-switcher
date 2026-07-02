#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/site/downloads"
TMP_DIR="$ROOT_DIR/.tmp/extension-package"
ZIP_NAME="cegos-env-switcher.zip"
CRX_NAME="cegos-env-switcher.crx"
UPDATES_XML_PATH="$ROOT_DIR/site/updates.xml"
MANIFEST_PATH="$ROOT_DIR/extension/manifest.json"
PAGES_BASE_URL="${PAGES_BASE_URL:-https://camiji.github.io/cegos-env-switcher}"
CHROME_EXTENSION_KEY_PATH="${CHROME_EXTENSION_KEY_PATH:-}"

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
mkdir -p "$DIST_DIR"

cp -R "$ROOT_DIR/extension/." "$TMP_DIR/"

rm -f "$DIST_DIR/$ZIP_NAME"

cd "$TMP_DIR"
zip -r "$DIST_DIR/$ZIP_NAME" .

if [[ -n "$CHROME_EXTENSION_KEY_PATH" ]]; then
  if [[ ! -f "$CHROME_EXTENSION_KEY_PATH" ]]; then
    echo "Error: CHROME_EXTENSION_KEY_PATH file not found: $CHROME_EXTENSION_KEY_PATH" >&2
    exit 1
  fi

  rm -f "${TMP_DIR}.crx"
  google-chrome \
    --no-sandbox \
    --pack-extension="$TMP_DIR" \
    --pack-extension-key="$CHROME_EXTENSION_KEY_PATH"
  cp "${TMP_DIR}.crx" "$DIST_DIR/$CRX_NAME"
  chmod 644 "$DIST_DIR/$CRX_NAME"

  VERSION="$(python -c "import json; print(json.load(open('$MANIFEST_PATH', encoding='utf-8'))['version'])")"
  APP_ID="$(python - "$CHROME_EXTENSION_KEY_PATH" <<'PY'
import hashlib
import subprocess
import sys

pem_path = sys.argv[1]
public_der = subprocess.check_output(
    ["openssl", "rsa", "-in", pem_path, "-pubout", "-outform", "DER"],
    stderr=subprocess.DEVNULL,
)
digest = hashlib.sha256(public_der).hexdigest()[:32]
print("".join(chr(ord("a") + int(c, 16)) for c in digest))
PY
)"

  BASE_URL="${PAGES_BASE_URL%/}"
  CRX_URL="$BASE_URL/downloads/$CRX_NAME"

  cat > "$UPDATES_XML_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">
  <app appid="$APP_ID">
    <updatecheck codebase="$CRX_URL" version="$VERSION" />
  </app>
</gupdate>
EOF
else
  echo "Info: CHROME_EXTENSION_KEY_PATH not set, skipping CRX and updates.xml generation."
fi
