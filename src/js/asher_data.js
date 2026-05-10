import "./d3.v7.js";

const IDB_NAME    = "talen-cache";
const IDB_STORE   = "geodata";
const IDB_KEY     = "asher-v1";

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

function idbGet(db, key) {
    return new Promise((resolve, reject) => {
        const req = db.transaction(IDB_STORE).objectStore(IDB_STORE).get(key);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

function idbSet(db, key, value) {
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(IDB_STORE, "readwrite");
        const req = tx.objectStore(IDB_STORE).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}

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

if (!window.__asherCache) window.__asherCache = { data: null, inflight: null };
const store = window.__asherCache;

export async function loadAsherColonialData() {
    // 1. In-memory: instant, same-page
    if (store.data) return store.data;
    if (store.inflight) return store.inflight;

    store.inflight = (async () => {

        // 2. IndexedDB: fast, cross-page, no re-parsing
        const db     = await openDb();
        const cached = await idbGet(db, IDB_KEY);

        if (cached) {
            store.data    = cached;
            store.inflight = null;
            return cached;
        }

        // 3. Full load — only happens once ever (or when IDB_KEY changes)
        const [traditionalGeo, contemporaryGeo] = await Promise.all([
            d3.json(new URL("../data/traditional/languages.geojson",  import.meta.url)),
            d3.json(new URL("../data/contemporary/languages.geojson", import.meta.url))
        ]);

        const areaTraditional  = sumAreaByCode(traditionalGeo.features ?? []);
        const areaContemporary = sumAreaByCode(contemporaryGeo.features ?? []);

        store.data = {
            traditionalGeo,
            contemporaryGeo,
            colonialRows: buildColonialAreaRows(areaTraditional, areaContemporary)
        };

        // Store for next page load — fire and forget
        idbSet(db, IDB_KEY, store.data).catch(e =>
            console.warn("IDB write failed:", e)
        );

        store.inflight = null;
        return store.data;
    })();

    return store.inflight;
}

