import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "kaart met puntjes van de talen per familie";
const element = document.getElementById(id);

const width = 900;
const height = 400;

const svg = d3
    .select(element)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("display", "block")
    .style("width", "100%")
    .style("height", "100%");

const projection = d3.geoMercator()
    .scale(140)
    .translate([width / 2, height / 1.5]);

const familie_selector = document.getElementById("selecteer familie");
const starttaal = "Atlantic-Congo";

if (familie_selector == null) {
    throw new Error("selector niet gevonden");
}

const families = data
    .map(d => d["family"])
    .sort()
    .filter((v, i, arr) => arr.indexOf(v) == i);

families.forEach(f => {
    const optie = document.createElement("option");
    optie.textContent = f;

    if (f == starttaal) optie.selected = true;

    familie_selector.appendChild(optie);
});

let puntjes = data.map(d => ({
    x: projection([d["longitude"], d["latitude"]])[0],
    y: projection([d["longitude"], d["latitude"]])[1],
    familie: d["family"]
}));

const min_x = d3.min(puntjes, p => p.x);
const max_x = d3.max(puntjes, p => p.x);
const min_y = d3.min(puntjes, p => p.y);
const max_y = d3.max(puntjes, p => p.y);

const padding = 20;

const dataWidth = max_x - min_x;
const dataHeight = max_y - min_y;

// Scale to fit both width and height while keeping aspect ratio.
const scale = Math.min(
    (width - padding * 2) / dataWidth,
    (height - padding * 2) / dataHeight
);

// Center the map inside the SVG.
const offsetX = (width - dataWidth * scale) / 2;
const offsetY = (height - dataHeight * scale) / 2;

puntjes = puntjes
    .map(p => ({
        ...p,
        x: (p.x - min_x) * scale + offsetX,
        y: (p.y - min_y) * scale + offsetY,
    }))
    .sort((p1, p2) => p1.y - p2.y);

function render(familie) {
    svg.selectAll("*").remove();

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 10)
        .attr("fill", "#242424");

    svg.selectAll("circle")
        .data(puntjes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 1.0)
        .attr("fill", d => d.familie == familie ? "red" : "white")
        .attr("opacity", d => d.familie == familie ? 1 : 0.35);
}

render(starttaal);

familie_selector.addEventListener("change", function () {
    render(this.value);
});