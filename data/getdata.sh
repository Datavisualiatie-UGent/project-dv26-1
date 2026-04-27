#!/bin/bash

wget -N https://zenodo.org/records/18613195/files/Glottography/asher2007world-v2.0.zip?download=1
mv asher2007world-v2.0.zip\?download\=1 asher2007world-v2.0.zip

unzip asher2007world-v2.0.zip -d asher2007world-v2.0

rm asher2007world-v2.0.zip

cp asher2007world-v2.0/Glottography-asher2007world-2010223/cldf/traditional/* ./traditional/
cp asher2007world-v2.0/Glottography-asher2007world-2010223/cldf/contemporary/* ./contemporary/

rm -rf Glottography-asher2007world-2010223/