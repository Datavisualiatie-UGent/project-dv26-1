import "./d3.v7.js";

const BASE_PATH = "/data/asher2007world-v2.0/Glottography-asher2007world-2010223/cldf";

let cache = null;

export const COLONIAL_LANGUAGES = [
    { code: "stan1293", name: "English" },
    { code: "stan1288", name: "Spanish" },
    { code: "port1283", name: "Portuguese" },
    { code: "stan1290", name: "French" },
    { code: "dutc1256", name: "Dutch" },
    { code: "russ1263", name: "Russian" }
];

function sumAreaByCode(features) {
    return features.reduce((acc, feature) => {
        const code = feature?.properties?.["cldf:languageReference"];
        if (!code) return acc;
        const area = d3.geoArea(feature);
        if (!Number.isFinite(area) || area <= 0) return acc;
        if (code in acc) acc[code] += area;
        else acc[code] = area;
        return acc;
    }, {});
}

function buildColonialAreaRows(areaTraditional, areaContemporary) {
    return COLONIAL_LANGUAGES.map(language => {
        const traditionalArea = areaTraditional[language.code] ?? 0;
        const contemporaryArea = areaContemporary[language.code] ?? 0;
        const delta = contemporaryArea - traditionalArea;
        const deltaPct = traditionalArea > 0 ? (delta / traditionalArea) * 100 : 0;

        return {
            ...language,
            traditionalArea,
            contemporaryArea,
            delta,
            deltaPct
        };
    });
}

export async function loadAsherColonialData() {
    if (cache) return cache;

    const [traditionalGeo, contemporaryGeo] = await Promise.all([
        d3.json(`${BASE_PATH}/traditional/languages.geojson`),
        d3.json(`${BASE_PATH}/contemporary/languages.geojson`)
    ]);

    const areaTraditional = sumAreaByCode(traditionalGeo.features ?? []);
    const areaContemporary = sumAreaByCode(contemporaryGeo.features ?? []);

    cache = {
        traditionalGeo,
        contemporaryGeo,
        colonialRows: buildColonialAreaRows(areaTraditional, areaContemporary)
    };

    return cache;
}
