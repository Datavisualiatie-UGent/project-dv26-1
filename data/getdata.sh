wget https://zenodo.org/records/18613195/files/Glottography/asher2007world-v2.0.zip?download=1
mv asher2007world-v2.0.zip\?download\=1 data.zip

unzip data.zip
rm data.zip

mv Glottography-asher2007world-2010223/cldf/traditional/* ./traditional/
mv Glottography-asher2007world-2010223/cldf/contemporary/* ./contemporary/

rm -rf Glottography-asher2007world-2010223/