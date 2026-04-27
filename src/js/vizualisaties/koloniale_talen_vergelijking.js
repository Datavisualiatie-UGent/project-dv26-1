import "../d3.v7.js";
import { loadAsherColonialData } from "../asher_data.js";

const id = "koloniale talen: traditioneel vs hedendaags";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);

const idDelta = "koloniale talen: netto verandering";
const elementDelta = document.getElementById(idDelta);
if (!elementDelta) console.error(`element ${idDelta} niet gevonden`);

const WIDTH = 860;
const HEIGHT = 340;
const MARGIN = { top: 36, right: 26, bottom: 56, left: 78 };

function formatPct(value) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function renderComparativeBars(container, rows) {
    const svg = d3.select(container)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const x = d3.scaleBand()
        .domain(rows.map(d => d.name))
        .range([MARGIN.left, WIDTH - MARGIN.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(rows, d => Math.max(d.traditionalArea, d.contemporaryArea)) * 1.08])
        .nice()
        .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const pairWidth = x.bandwidth();
    const barWidth = pairWidth / 2 - 4;

    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${MARGIN.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(v => d3.format(".2f")(v)));

    svg.append("text")
        .attr("x", MARGIN.left)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .text("Totale polygon-oppervlakte per taal (sferische eenheid)");

    const groups = svg.append("g")
        .selectAll("g")
        .data(rows)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.name)},0)`);

    groups.append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.traditionalArea))
        .attr("width", barWidth)
        .attr("height", d => y(0) - y(d.traditionalArea))
        .attr("fill", "#70543e")
        .append("title")
        .text(d => `Traditioneel: ${d3.format(".4f")(d.traditionalArea)}`);

    groups.append("rect")
        .attr("x", barWidth + 8)
        .attr("y", d => y(d.contemporaryArea))
        .attr("width", barWidth)
        .attr("height", d => y(0) - y(d.contemporaryArea))
        .attr("fill", "#2f7d4f")
        .append("title")
        .text(d => `Hedendaags: ${d3.format(".4f")(d.contemporaryArea)}`);

    const legend = svg.append("g")
        .attr("transform", `translate(${WIDTH - 250},${MARGIN.top})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#70543e");

    legend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text("Traditional / time-of-contact");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#2f7d4f");

    legend.append("text")
        .attr("x", 18)
        .attr("y", 30)
        .text("Contemporary");
}

function renderDeltaBars(container, rows) {
    const svg = d3.select(container)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const sorted = rows.slice().sort((a, b) => b.deltaPct - a.deltaPct);

    const x = d3.scaleLinear()
        .domain(d3.extent(sorted, d => d.deltaPct))
        .nice()
        .range([MARGIN.left, WIDTH - MARGIN.right]);

    const y = d3.scaleBand()
        .domain(sorted.map(d => d.name))
        .range([MARGIN.top, HEIGHT - MARGIN.bottom])
        .padding(0.22);

    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(v => `${v}%`));

    svg.append("g")
        .attr("transform", `translate(${MARGIN.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", MARGIN.top)
        .attr("y2", HEIGHT - MARGIN.bottom)
        .attr("stroke", "#222")
        .attr("stroke-dasharray", "4 3");

    svg.append("text")
        .attr("x", MARGIN.left)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .text("Netto verandering van areaal (contemporary minus traditional)");

    svg.append("g")
        .selectAll("rect")
        .data(sorted)
        .enter()
        .append("rect")
        .attr("x", d => Math.min(x(0), x(d.deltaPct)))
        .attr("y", d => y(d.name))
        .attr("width", d => Math.abs(x(d.deltaPct) - x(0)))
        .attr("height", y.bandwidth())
        .attr("fill", d => d.deltaPct >= 0 ? "#2f7d4f" : "#b5473c")
        .append("title")
        .text(d => `${d.name}: ${formatPct(d.deltaPct)}`);

    svg.append("g")
        .selectAll("text")
        .data(sorted)
        .enter()
        .append("text")
        .attr("x", d => d.deltaPct >= 0 ? x(d.deltaPct) + 6 : x(d.deltaPct) - 6)
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", d => d.deltaPct >= 0 ? "start" : "end")
        .style("font-size", "12px")
        .text(d => formatPct(d.deltaPct));
}

async function start() {
    if (!element || !elementDelta) return;

    const { colonialRows } = await loadAsherColonialData();
    renderComparativeBars(element, colonialRows);
    renderDeltaBars(elementDelta, colonialRows);
}

start();
