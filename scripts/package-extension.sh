#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/site/downloads"
TMP_DIR="$ROOT_DIR/.tmp/extension-package"
ZIP_NAME="cegos-env-switcher.zip"

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
mkdir -p "$DIST_DIR"

cp -R "$ROOT_DIR/extension/." "$TMP_DIR/"

rm -f "$DIST_DIR/$ZIP_NAME"

cd "$TMP_DIR"
zip -r "$DIST_DIR/$ZIP_NAME" .
