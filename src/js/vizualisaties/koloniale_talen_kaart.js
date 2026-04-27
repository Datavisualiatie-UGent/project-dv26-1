import "../d3.v7.js";
import { loadAsherColonialData } from "../asher_data.js";

const id = "koloniale talen: kaart over tijd";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);

const WIDTH = 980;
const HEIGHT = 560;

function addAreaToMap(targetMap, feature) {
    const code = feature?.properties?.["cldf:languageReference"];
    if (!code) return;
    const area = d3.geoArea(feature);
    if (!Number.isFinite(area) || area <= 0) return;
    if (code in targetMap) targetMap[code] += area;
    else targetMap[code] = area;
}

function buildLanguageOptions(dataByDataset) {
    const areasTraditional = {};
    const areasContemporary = {};
    const namesByCode = {};

    dataByDataset.traditional.forEach(row => {
        addAreaToMap(areasTraditional, row.feature);
        if (!namesByCode[row.code] && row.feature?.properties?.title) namesByCode[row.code] = row.feature.properties.title;
    });

    dataByDataset.contemporary.forEach(row => {
        addAreaToMap(areasContemporary, row.feature);
        if (!namesByCode[row.code] && row.feature?.properties?.title) namesByCode[row.code] = row.feature.properties.title;
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

function makeControls(container, languageOptions) {
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "12px";
    controls.style.padding = "12px";
    controls.style.alignItems = "center";
    controls.style.background = "#f5f1e8";
    controls.style.borderBottom = "1px solid #d4c7b4";

    const languageLabel = document.createElement("label");
    languageLabel.textContent = "Taal (zoek op naam of code): ";

    const languageInput = document.createElement("input");
    languageInput.type = "search";
    languageInput.style.padding = "4px 6px";
    languageInput.style.minWidth = "320px";

    const listId = "taal-zoeklijst";
    languageInput.setAttribute("list", listId);

    const languageList = document.createElement("datalist");
    languageList.id = listId;

    languageOptions.forEach(language => {
        const option = document.createElement("option");
        option.value = `${language.name} (${language.code})`;
        languageList.appendChild(option);
    });

    languageLabel.appendChild(languageInput);

    const datasetLabel = document.createElement("span");
    datasetLabel.textContent = "Dataset: ";

    const toggleTraditional = document.createElement("button");
    toggleTraditional.textContent = "Traditional";
    toggleTraditional.type = "button";

    const toggleContemporary = document.createElement("button");
    toggleContemporary.textContent = "Contemporary";
    toggleContemporary.type = "button";

    [toggleTraditional, toggleContemporary].forEach(button => {
        button.style.padding = "4px 10px";
        button.style.border = "1px solid #6f5b41";
        button.style.background = "#fff";
        button.style.cursor = "pointer";
    });

    const zoomReset = document.createElement("button");
    zoomReset.textContent = "Reset zoom";
    zoomReset.type = "button";
    zoomReset.style.padding = "4px 10px";
    zoomReset.style.border = "1px solid #6f5b41";
    zoomReset.style.background = "#fff";
    zoomReset.style.cursor = "pointer";

    controls.appendChild(languageLabel);
    controls.appendChild(languageList);
    controls.appendChild(datasetLabel);
    controls.appendChild(toggleTraditional);
    controls.appendChild(toggleContemporary);
    controls.appendChild(zoomReset);

    container.appendChild(controls);

    return {
        root: controls,
        languageInput,
        toggleTraditional,
        toggleContemporary,
        zoomReset
    };
}

function styleToggle(buttonTraditional, buttonContemporary, activeDataset) {
    const activeStyle = button => {
        button.style.background = "#6f5b41";
        button.style.color = "#fff";
    };
    const inactiveStyle = button => {
        button.style.background = "#fff";
        button.style.color = "#111";
    };

    if (activeDataset === "traditional") {
        activeStyle(buttonTraditional);
        inactiveStyle(buttonContemporary);
    } else {
        inactiveStyle(buttonTraditional);
        activeStyle(buttonContemporary);
    }
}

async function start() {
    if (!element) return;

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
                if (row.code in acc) acc[row.code].push(row.feature);
                else acc[row.code] = [row.feature];
                return acc;
            }, {})
        },
        contemporary: {
            rows: dataByDataset.contemporary,
            byCode: dataByDataset.contemporary.reduce((acc, row) => {
                if (!row.code) return acc;
                if (row.code in acc) acc[row.code].push(row.feature);
                else acc[row.code] = [row.feature];
                return acc;
            }, {})
        }
    };

    const languageOptions = buildLanguageOptions(dataByDataset);
    const codeToLanguage = languageOptions.reduce((acc, language) => {
        acc[language.code] = language;
        return acc;
    }, {});

    const controls = makeControls(element, languageOptions);
    let selectedCode = languageOptions[0]?.code ?? "";
    controls.languageInput.value = selectedCode ? `${codeToLanguage[selectedCode].name} (${selectedCode})` : "";

    const mapContainer = d3.select(element)
        .append("div")
        .style("position", "relative")
        .style("width", `${WIDTH}px`)
        .style("height", `${HEIGHT}px`)
        .style("background", "#f8f8f5")
        .style("overflow", "hidden");

    const canvasTraditional = mapContainer
        .append("canvas")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("left", "0")
        .style("top", "0")
        .style("pointer-events", "none")
        .node();

    const canvasContemporary = mapContainer
        .append("canvas")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("left", "0")
        .style("top", "0")
        .style("pointer-events", "none")
        .style("display", "none")
        .node();

    const svg = mapContainer
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("position", "absolute")
        .style("left", "0")
        .style("top", "0")
        .style("display", "block")
        .style("cursor", "grab");

    const projection = d3.geoNaturalEarth1();
    projection.fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 40]], { type: "Sphere" });

    const path = d3.geoPath(projection);

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

    function drawMutedCanvas(canvas, features) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, WIDTH, HEIGHT);

        const canvasPath = d3.geoPath(projection, context);
        context.fillStyle = "rgba(184, 184, 184, 0.22)";
        context.strokeStyle = "rgba(143, 143, 143, 0.2)";
        context.lineWidth = 0.35;

        for (let i = 0; i < features.length; i++) {
            context.beginPath();
            canvasPath(features[i]);
            context.fill();
            context.stroke();
        }
    }

    drawMutedCanvas(canvasTraditional, datasetIndex.traditional.rows.map(row => row.feature));
    drawMutedCanvas(canvasContemporary, datasetIndex.contemporary.rows.map(row => row.feature));

    const subtitle = svg.append("text")
        .attr("x", 20)
        .attr("y", HEIGHT - 10)
        .attr("font-size", 13)
        .attr("fill", "#333");

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("start", () => svg.style("cursor", "grabbing"))
        .on("end", () => svg.style("cursor", "grab"))
        .on("zoom", event => {
            currentTransform = event.transform;
            const transformCss = `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`;
            d3.select(canvasTraditional)
                .style("transform-origin", "0 0")
                .style("transform", transformCss);
            d3.select(canvasContemporary)
                .style("transform-origin", "0 0")
                .style("transform", transformCss);
            mapRoot.attr("transform", event.transform);
        });

    svg.call(zoom);

    let dataset = "traditional";
    let currentTransform = d3.zoomIdentity;

    function normalizeSearchValue(rawValue) {
        const value = rawValue.trim();
        if (!value) return null;

        const exactCode = languageOptions.find(language => language.code === value);
        if (exactCode) return exactCode.code;

        const pattern = /\(([a-z0-9]{8})\)$/i;
        const match = value.match(pattern);
        if (match) return match[1].toLowerCase();

        const exactName = languageOptions.find(language => language.name.toLowerCase() === value.toLowerCase());
        if (exactName) return exactName.code;

        const firstStartsWith = languageOptions.find(language => language.name.toLowerCase().startsWith(value.toLowerCase()));
        if (firstStartsWith) return firstStartsWith.code;

        return null;
    }

    function render() {
        d3.select(canvasTraditional).style("display", dataset === "traditional" ? null : "none");
        d3.select(canvasContemporary).style("display", dataset === "contemporary" ? null : "none");

        const highlightedFeatures = datasetIndex[dataset].byCode[selectedCode] ?? [];

        const highlightedSelection = layerHighlight.selectAll("path")
            .data(highlightedFeatures)
            .join("path")
            .attr("d", path)
            .attr("fill", dataset === "traditional" ? "#8d5d2f" : "#2a7a4b")
            .attr("fill-opacity", 0.86)
            .attr("stroke", dataset === "traditional" ? "#5a3d1f" : "#1b4d31")
            .attr("stroke-width", 0.7)
            .style("cursor", "pointer")
            .on("click", (event, feature) => {
                event.stopPropagation();
                const code = feature?.properties?.["cldf:languageReference"];
                if (!code || !codeToLanguage[code]) return;
                selectedCode = code;
                controls.languageInput.style.borderColor = "#6f5b41";
                controls.languageInput.value = `${codeToLanguage[selectedCode].name} (${selectedCode})`;
                render();
            });

        highlightedSelection.selectAll("title")
            .data(d => [d])
            .join("title")
            .text(d => d?.properties?.title ?? "unknown");

        const language = codeToLanguage[selectedCode];
        const selectedLanguageName = language?.name ?? selectedCode;
        subtitle.text(`${selectedLanguageName} (${selectedCode}) | ${dataset}`);
    }

    function pickLanguageFromMap(event) {
        if (event.defaultPrevented) return;

        const [sx, sy] = d3.pointer(event, svg.node());
        const [mx, my] = currentTransform.invert([sx, sy]);
        const coords = projection.invert([mx, my]);
        if (!coords) return;

        const rows = datasetIndex[dataset].rows;
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            if (!row.code || !codeToLanguage[row.code]) continue;
            if (!d3.geoContains(row.feature, coords)) continue;

            selectedCode = row.code;
            controls.languageInput.style.borderColor = "#6f5b41";
            controls.languageInput.value = `${codeToLanguage[selectedCode].name} (${selectedCode})`;
            render();
            return;
        }
    }

    function applyLanguageInput() {
        const resolvedCode = normalizeSearchValue(controls.languageInput.value);
        if (!resolvedCode || !codeToLanguage[resolvedCode]) {
            controls.languageInput.style.borderColor = "#b5473c";
            return;
        }

        selectedCode = resolvedCode;
        controls.languageInput.style.borderColor = "#6f5b41";
        controls.languageInput.value = `${codeToLanguage[selectedCode].name} (${selectedCode})`;
        render();
    }

    controls.languageInput.addEventListener("change", applyLanguageInput);
    controls.languageInput.addEventListener("search", applyLanguageInput);
    controls.languageInput.addEventListener("keydown", event => {
        if (event.key === "Enter") applyLanguageInput();
    });

    controls.toggleTraditional.addEventListener("click", () => {
        dataset = "traditional";
        styleToggle(controls.toggleTraditional, controls.toggleContemporary, dataset);
        render();
    });

    controls.toggleContemporary.addEventListener("click", () => {
        dataset = "contemporary";
        styleToggle(controls.toggleTraditional, controls.toggleContemporary, dataset);
        render();
    });

    controls.zoomReset.addEventListener("click", () => {
        svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity);
    });

    svg.on("click", pickLanguageFromMap);

    styleToggle(controls.toggleTraditional, controls.toggleContemporary, dataset);
    render();
}

start();
