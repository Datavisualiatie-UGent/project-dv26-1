#!/bin/bash

set -e  # exit on error

echo "Downloading Asher dataset..."
wget -N https://zenodo.org/records/18613195/files/Glottography/asher2007world-v2.0.zip?download=1

echo "Extracting zip file..."
mv asher2007world-v2.0.zip\?download\=1 asher2007world-v2.0.zip

# Use Python's zipfile module instead of unzip (more portable)
python3 -m zipfile -e asher2007world-v2.0.zip asher2007world-v2.0

echo "Copying dataset files..."
mkdir -p ./traditional ./contemporary
cp asher2007world-v2.0/Glottography-asher2007world-2010223/cldf/traditional/* ./traditional/ 2>/dev/null || true
cp asher2007world-v2.0/Glottography-asher2007world-2010223/cldf/contemporary/* ./contemporary/ 2>/dev/null || true

echo "Cleaning up..."
rm -f asher2007world-v2.0.zip
rm -rf asher2007world-v2.0/

echo "Done!"