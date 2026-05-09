#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

# Build the static output used by both local preview and GitHub Pages.
if command -v node >/dev/null 2>&1; then
	node build.mjs
elif command -v nodejs >/dev/null 2>&1; then
	nodejs build.mjs
else
	echo "Node.js is required to build dist/. Install node or nodejs first."
	exit 1
fi

# Ensure Asher data files are present in dist/data.
if [ -f "dist/data/getdata.sh" ]; then
	if [ -s "dist/data/traditional/languages.geojson" ] && [ -s "dist/data/contemporary/languages.geojson" ]; then
		echo "Asher data already loaded. Skipping download."
	else
		echo "Asher data missing. Downloading..."
		(cd dist/data && bash getdata.sh)
	fi
fi

echo "Serving http://127.0.0.1:3000"
cd dist
python3 -m http.server 3000