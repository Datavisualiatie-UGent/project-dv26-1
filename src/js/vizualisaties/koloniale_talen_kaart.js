import "../d3.v7.js";
import { loadAsherColonialData } from "../asher_data.js";

const id = "koloniale talen: kaart over tijd";
const element = document.querySelector(".kaart-container:has(#kaart-wrapper)");

function buildLanguageOptions(dataByDataset) {
    const areasTraditional = {};
    const areasContemporary = {};
    const namesByCode = {};

    dataByDataset.traditional.forEach(row => {
        addAreaToMap(areasTraditional, row.feature);
        if (!namesByCode[row.code] && row.feature?.properties?.title)
            namesByCode[row.code] = row.feature.properties.title;
    });

    dataByDataset.contemporary.forEach(row => {
        addAreaToMap(areasContemporary, row.feature);
        if (!namesByCode[row.code] && row.feature?.properties?.title)
            namesByCode[row.code] = row.feature.properties.title;
    });

    return Object.keys({ ...areasTraditional, ...areasContemporary })
        .map(code => {
            const traditionalArea = areasTraditional[code] ?? 0;
            const contemporaryArea = areasContemporary[code] ?? 0;
            return {
                code,
                name: namesByCode[code] ?? code,
                traditionalArea,
                contemporaryArea,
                priorityScore: Math.max(traditionalArea, contemporaryArea)
            };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore || a.name.localeCompare(b.name));
}

function addAreaToMap(targetMap, feature) {
    const code = feature?.properties?.["cldf:languageReference"];
    if (!code) return;
    const area = d3.geoArea(feature);
    if (!Number.isFinite(area) || area <= 0) return;
    if (code in targetMap) targetMap[code] += area;
    else targetMap[code] = area;
}

async function start() {
    if (!element) return;

    await new Promise(resolve => requestAnimationFrame(resolve));

    const wrapper = element.querySelector("#kaart-wrapper");
    const WIDTH  = wrapper.offsetWidth  || 980;
    const HEIGHT = wrapper.offsetHeight || 660;

    // Query pre-existing DOM elements
    const languageInput    = element.querySelector("#kaart-taal-input");
    const languageList     = element.querySelector("#taal-zoeklijst");
    const toggleTraditional   = element.querySelector("#toggle-traditional");
    const toggleContemporary  = element.querySelector("#toggle-contemporary");
    const zoomReset        = element.querySelector("#zoom-reset");
    const toggleBoundaries = element.querySelector("#toggle-boundaries");
    const boundaryYear     = element.querySelector("#boundary-year");
    const yearLabel        = element.querySelector("#year-label");

    const { traditionalGeo, contemporaryGeo } = await loadAsherColonialData();

    const dataByDataset = {
        traditional: (traditionalGeo.features ?? []).map(feature => ({
            feature,
            code: feature?.properties?.["cldf:languageReference"]
        })),
        contemporary: (contemporaryGeo.features ?? []).map(feature => ({
            feature,
            code: feature?.properties?.["cldf:languageReference"]
        }))
    };

    const datasetIndex = {
        traditional: {
            rows: dataByDataset.traditional,
            byCode: dataByDataset.traditional.reduce((acc, row) => {
                if (!row.code) return acc;
                (acc[row.code] ??= []).push(row.feature);
                return acc;
            }, {})
        },
        contemporary: {
            rows: dataByDataset.contemporary,
            byCode: dataByDataset.contemporary.reduce((acc, row) => {
                if (!row.code) return acc;
                (acc[row.code] ??= []).push(row.feature);
                return acc;
            }, {})
        }
    };

    const languageOptions = buildLanguageOptions(dataByDataset);
    const codeToLanguage  = Object.fromEntries(languageOptions.map(l => [l.code, l]));

    // Populate datalist
    languageOptions.forEach(language => {
        const option = document.createElement("option");
        option.value = `${language.name} (${language.code})`;
        languageList.appendChild(option);
    });

    let selectedCode = languageOptions[0]?.code ?? "";
    languageInput.value = selectedCode
        ? `${codeToLanguage[selectedCode].name} (${selectedCode})`
        : "";

    const years = [1800, 1914, 1918, 1939, 1945, 1970, 1990, 2000];
    let boundariesEnabled = false;
    let currentYearIndex = 0;
    const boundariesCache = {};

    const colonialLanguageNames = new Set(["spanish", "portuguese", "english", "french"]);

    const empireColors = {
        spanish: "rgba(220, 60, 60, 0.55)",
        portuguese: "rgba(65, 140, 80, 0.55)",
        english: "rgba(70, 110, 230, 0.55)",
        french: "rgba(115, 70, 200, 0.55)"
    };

    const empireTerritoriesByLanguage = {
        spanish: new Set([
            "Spain",
            "New Spain of Mexico",
            "Peru",
            "Cuba",
            "Puerto Rico",
            "Philippine Islands",
            "Guayana",
            "Saint Dominic",
            "New Spain of Mexico"
        ]),
        portuguese: new Set([
            "Portugal",
            "Brazil",
            "Cabo Verde",
            "Madeira",
            "Azores"
        ]),
        english: new Set([
            "United Kingdom",
            "Bermuda",
            "Bahamas",
            "Barbados",
            "Anguilla",
            "Antigua and Barbuda",
            "Cayman Islands",
            "Dominica",
            "Jamaica",
            "Montserrat",
            "Saint Kitts and Nevis",
            "Saint Lucia",
            "Saint Martin",
            "Saint Vincent and the Grenadines",
            "Trinidad",
            "Turks and Caicos Islands",
            "Falkland Islands",
            "Hudson's Bay Company",
            "Isle of Man",
            "Bermuda",
            "Guernsey",
            "Jersey"
        ]),
        french: new Set([
            "France",
            "Guadeloupe",
            "Martinique",
            "Saint-Domingue",
            "Isle de France",
            "Saint Barthelemy"
        ])
    };

    // D3 setup — attached to wrapper, not element
    const mapContainer = d3.select(wrapper)
        .append("div")
        .style("position", "relative")
        .style("width", `${WIDTH}px`)
        .style("height", `${HEIGHT}px`)
        .style("flex-shrink", "0");

    const tooltip = d3.select(wrapper)
        .append("div")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 2200)
        .style("padding", "8px 10px")
        .style("background", "rgba(20, 20, 20, 0.92)")
        .style("color", "#fff")
        .style("border-radius", "8px")
        .style("font-size", "12px")
        .style("line-height", "1.35");

    const canvasTraditional = mapContainer
        .append("canvas")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("inset", "0")
        .style("pointer-events", "none")
        .node();

    const canvasContemporary = mapContainer
        .append("canvas")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("inset", "0")
        .style("pointer-events", "none")
        .style("display", "none")
        .node();

    const svg = mapContainer
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("inset", "0")
        .style("display", "block")
        .style("cursor", "grab");

    const projection = d3.geoNaturalEarth1();
    projection.fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 40]], { type: "Sphere" });

    const path    = d3.geoPath(projection);
    const mapRoot = svg.append("g");

    mapRoot.append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#aeb8c4")
        .attr("stroke-width", 1.2);

    mapRoot.append("path")
        .datum(d3.geoGraticule10())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#d4dbe3")
        .attr("stroke-width", 0.6)
        .attr("stroke-opacity", 0.6);

    const layerHighlight = mapRoot.append("g");

    const layerBoundaries = mapRoot.append("g");

    function drawMutedCanvas(canvas, features) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, WIDTH, HEIGHT);
        const canvasPath = d3.geoPath(projection, context);
        context.fillStyle   = "rgba(184,184,184,0.22)";
        context.strokeStyle = "rgba(143,143,143,0.2)";
        context.lineWidth   = 0.35;
        for (const feature of features) {
            context.beginPath();
            canvasPath(feature);
            context.fill();
            context.stroke();
        }
    }

    drawMutedCanvas(canvasTraditional, dataByDataset.traditional.map(r => r.feature));
    drawMutedCanvas(canvasContemporary, dataByDataset.contemporary.map(r => r.feature));

    async function loadBoundaries(year) {
        if (boundariesCache[year]) return boundariesCache[year];
        // Resolve relative to the page (dist/), not the JS module path.
        // This keeps URLs stable if JS is moved/bundled.
        const shpUrl = new URL(`./data/boundaries/Year_${year}.shp`, document.baseURI);
        try {
            if (typeof shp !== "function") {
                throw new Error("shp() is not available. Ensure shpjs is loaded before enabling boundaries.");
            }
            const geojson = await shp(shpUrl.href);
            boundariesCache[year] = geojson;
            return geojson;
        } catch (error) {
            console.error(`Failed to load boundaries for ${year}:`, error);
            return { features: [] };
        }
    }

    function renderBoundaries() {
        if (!boundariesEnabled) {
            layerBoundaries.selectAll("path").remove();
            return;
        }
        const selectedLanguage = codeToLanguage[selectedCode];
        const selectedLanguageName = selectedLanguage?.name?.toLowerCase() ?? "";
        const isColonial = colonialLanguageNames.has(selectedLanguageName);
        const empireTerritories = empireTerritoriesByLanguage[selectedLanguageName] || new Set();
        const empireFill = empireColors[selectedLanguageName] || "rgba(0, 0, 0, 0)";
        const year = years[currentYearIndex];
        loadBoundaries(year).then(geojson => {
            layerBoundaries.selectAll("path")
                .data(geojson.features)
                .join("path")
                .attr("d", path)
                .attr("fill", d => {
                    if (!isColonial) return "none";
                    const name = d.properties?.NAME;
                    if (empireTerritories.has(name)) {
                        return empireFill;
                    }
                    return "none";
                })
                .attr("fill-opacity", 0.55)
                .attr("stroke", "#000")
                .attr("stroke-width", 0.8)
                .attr("stroke-opacity", 1);
        });
    }

    const subtitle = svg.append("text")
        .attr("x", 20)
        .attr("y", HEIGHT - 10)
        .attr("font-size", 13)
        .attr("fill", "#333");

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("start", () => svg.style("cursor", "grabbing"))
        .on("end",   () => svg.style("cursor", "grab"))
        .on("zoom", event => {
            currentTransform = event.transform;
            const t = `translate(${event.transform.x}px,${event.transform.y}px) scale(${event.transform.k})`;
            d3.select(canvasTraditional).style("transform-origin", "0 0").style("transform", t);
            d3.select(canvasContemporary).style("transform-origin", "0 0").style("transform", t);
            mapRoot.attr("transform", event.transform);
        });

    svg.call(zoom);

    let dataset = "contemporary";
    let currentTransform = d3.zoomIdentity;

    // CSS class toggle instead of inline style manipulation
    function setActiveDataset(next) {
        dataset = next;
        toggleTraditional.classList.toggle("active",  next === "traditional");
        toggleContemporary.classList.toggle("active", next === "contemporary");
        render();
        if (boundariesEnabled) renderBoundaries();
    }

    function normalizeSearchValue(rawValue) {
        const value = rawValue.trim();
        if (!value) return null;
        const exactCode = languageOptions.find(l => l.code === value);
        if (exactCode) return exactCode.code;
        const match = value.match(/\(([a-z0-9]{8})\)$/i);
        if (match) return match[1].toLowerCase();
        const exactName = languageOptions.find(l => l.name.toLowerCase() === value.toLowerCase());
        if (exactName) return exactName.code;
        const startsWith = languageOptions.find(l => l.name.toLowerCase().startsWith(value.toLowerCase()));
        if (startsWith) return startsWith.code;
        return null;
    }

    function findLanguageCodeAtPointer(event) {
        const [sx, sy] = d3.pointer(event, svg.node());
        const [mx, my] = currentTransform.invert([sx, sy]);
        const coords = projection.invert([mx, my]);
        if (!coords) return null;

        const rows = datasetIndex[dataset].rows;
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            if (!row.code) continue;
            if (d3.geoContains(row.feature, coords)) return row.code;
        }
        return null;
    }

    function render() {
        d3.select(canvasTraditional).style("display",  dataset === "traditional"  ? null : "none");
        d3.select(canvasContemporary).style("display", dataset === "contemporary" ? null : "none");

        const highlightedFeatures = datasetIndex[dataset].byCode[selectedCode] ?? [];

        layerHighlight.selectAll("path")
            .data(highlightedFeatures)
            .join("path")
            .attr("d", path)
            .attr("fill",         dataset === "traditional" ? "#8d5d2f" : "#2a7a4b")
            .attr("fill-opacity", 0.86)
            .attr("stroke",       dataset === "traditional" ? "#5a3d1f" : "#1b4d31")
            .attr("stroke-width", 0.7)
            .style("cursor", "pointer")
            .on("mouseenter", (event, feature) => {
                const code = feature?.properties?.["cldf:languageReference"];
                const label = code && codeToLanguage[code]
                    ? codeToLanguage[code].name
                    : (feature?.properties?.title ?? "Onbekende taal");
                tooltip
                    .style("opacity", 1)
                    .text(label)
                    .style("left", `${event.clientX + 12}px`)
                    .style("top", `${event.clientY - 12}px`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", `${event.clientX + 12}px`)
                    .style("top", `${event.clientY - 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
            })
            .on("click", (event, feature) => {
                event.stopPropagation();
                const code = feature?.properties?.["cldf:languageReference"];
                if (!code || !codeToLanguage[code]) return;
                selectedCode = code;
                languageInput.value = `${codeToLanguage[code].name} (${code})`;
                languageInput.style.borderColor = "";
                render();
                if (boundariesEnabled) renderBoundaries();
            });

        const language = codeToLanguage[selectedCode];
        subtitle.text(`${language?.name ?? selectedCode} (${selectedCode}) | ${dataset === "traditional" ? "Traditioneel" : "Hedendaags"}`);
    }

    function applyLanguageInput() {
        const resolvedCode = normalizeSearchValue(languageInput.value);
        if (!resolvedCode || !codeToLanguage[resolvedCode]) {
            languageInput.style.borderColor = "#b5473c";
            return;
        }
        selectedCode = resolvedCode;
        languageInput.style.borderColor = "";
        languageInput.value = `${codeToLanguage[resolvedCode].name} (${resolvedCode})`;
        render();
        if (boundariesEnabled) renderBoundaries();
    }

    function pickLanguageFromMap(event) {
        if (event.defaultPrevented) return;
        const [sx, sy] = d3.pointer(event, svg.node());
        const [mx, my] = currentTransform.invert([sx, sy]);
        const coords = projection.invert([mx, my]);
        if (!coords) return;
        for (let i = datasetIndex[dataset].rows.length - 1; i >= 0; i--) {
            const row = datasetIndex[dataset].rows[i];
            if (!row.code || !codeToLanguage[row.code]) continue;
            if (!d3.geoContains(row.feature, coords)) continue;
            selectedCode = row.code;
            languageInput.value = `${codeToLanguage[row.code].name} (${row.code})`;
            languageInput.style.borderColor = "";
            render();
            if (boundariesEnabled) renderBoundaries();
            return;
        }
    }

    languageInput.addEventListener("change", applyLanguageInput);
    languageInput.addEventListener("search",  applyLanguageInput);
    languageInput.addEventListener("keydown", e => { if (e.key === "Enter") applyLanguageInput(); });

    toggleTraditional.addEventListener("click",  () => setActiveDataset("traditional"));
    toggleContemporary.addEventListener("click", () => setActiveDataset("contemporary"));
    zoomReset.addEventListener("click", () => {
        svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity);
    });

    toggleBoundaries.addEventListener("change", () => {
        boundariesEnabled = toggleBoundaries.checked;
        renderBoundaries();
    });

    boundaryYear.addEventListener("input", () => {
        currentYearIndex = +boundaryYear.value;
        yearLabel.textContent = years[currentYearIndex];
        if (boundariesEnabled) renderBoundaries();
    });

    svg.on("mousemove.tooltip", (event) => {
        const code = findLanguageCodeAtPointer(event);
        if (!code || !codeToLanguage[code]) {
            tooltip.style("opacity", 0);
            return;
        }

        tooltip
            .style("opacity", 1)
            .text(codeToLanguage[code].name)
            .style("left", `${event.clientX + 12}px`)
            .style("top", `${event.clientY - 12}px`);
    });

    svg.on("mouseleave.tooltip", () => {
        tooltip.style("opacity", 0);
    });

    svg.on("click", pickLanguageFromMap);

    render();
    renderBoundaries();
}

start();