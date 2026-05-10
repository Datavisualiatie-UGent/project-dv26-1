# Datavisualisatie - Project

## Datasets

### Glottolog dataset

The Glottolog dataset contains an entry for every language of the Glottolog languages database.
For each language it includes the language family, origin point and endangeredness status.

### Glottography dataset

The Glottography dataset is a comprehensive collection of information about the world's languages, derived from the "Atlas of the World's Languages" by Asher and Moseley (2007). It includes data on language names, classifications, geographic locations, and other relevant linguistic features. (see references for more details)

#### Contemporary languages

This dataset describes languages areas as they are in more recent/modern times.

#### Traditional languages

language areas at “time of contact”, i.e. before major colonial-era displacement.

### Language families

This dataset describes the hierarchical classification of languages into families, based on shared linguistic features and historical relationships. It includes information on language family names, the number of languages within each family, and their geographic distribution.

## Local Project Setup

> Node or Nodejs is required to run the project. You can download it from [Nodejs.org](https://nodejs.org/).

Simply run the shell script from project root:

```bash
./uitvoeren.sh
```

This will build the project and download the necessary datasets if necessary. Afterwards the project will be available at `http://localhost:3000/`.

## Referenties

- Glottolog dataset, sourced from https://github.com/rfordatascience/tidytuesday/tree/main/data/2025/2025-12-23
- Asher, R. E. & Christopher J. Moseley (eds.) 2007. Atlas of the World's Languages. 2nd edn. Routledge.
- The Glottography Consortium. (2026). Glottography dataset derived from Asher and Moseley 2007 "Atlas of the World's Languages" (v2.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.18613195