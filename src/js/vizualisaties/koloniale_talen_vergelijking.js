import "../d3.v7.js";
import { loadAsherColonialData } from "../asher_data.js";

const id = "koloniale talen: traditioneel vs hedendaags";
const element = document.getElementById(id);

const idDelta = "koloniale talen: netto verandering";
const elementDelta = document.getElementById(idDelta);

const WIDTH = 860;
const HEIGHT = 450;
const MARGIN_BAR   = { top: 36, right: 46,  bottom: 56, left: 78 };
const MARGIN_DELTA = { top: 36, right: 68,  bottom: 56, left: 78 };

function formatPct(value) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function createTooltip(container) {
    return d3.select(container)
        .append("div")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 2000)
        .style("padding", "8px 10px")
        .style("background", "rgba(20, 20, 20, 0.92)")
        .style("color", "#fff")
        .style("border-radius", "8px")
        .style("font-size", "12px")
        .style("line-height", "1.35");
}

function renderComparativeBars(container, rows) {
    const tooltip = createTooltip(container);

    const svg = d3.select(container)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const x = d3.scaleBand()
        .domain(rows.map(d => d.name))
        .range([MARGIN_BAR.left, WIDTH - MARGIN_BAR.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(rows, d => Math.max(d.traditionalArea, d.contemporaryArea)) * 1.08])
        .nice()
        .range([HEIGHT - MARGIN_BAR.bottom, MARGIN_BAR.top]);

    const pairWidth = x.bandwidth();
    const barWidth  = pairWidth / 2 - 4;

    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT - MARGIN_BAR.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${MARGIN_BAR.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(v => d3.format(".2f")(v)));

    svg.append("text")
        .attr("x", MARGIN_BAR.left)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .text("Totale oppervlakte per taal (sferische eenheid)");

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
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
            tooltip
                .style("opacity", 1)
                .text(d3.format(".6f")(d.traditionalArea))
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
        });

    groups.append("rect")
        .attr("x", barWidth + 8)
        .attr("y", d => y(d.contemporaryArea))
        .attr("width", barWidth)
        .attr("height", d => y(0) - y(d.contemporaryArea))
        .attr("fill", "#2f7d4f")
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
            tooltip
                .style("opacity", 1)
                .text(d3.format(".6f")(d.contemporaryArea))
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
        });

    const legend = svg.append("g")
        .attr("transform", `translate(${WIDTH - 350}, ${MARGIN_BAR.top})`);

    legend.append("rect")
        .attr("width", 12).attr("height", 12)
        .attr("fill", "#70543e");

    legend.append("text")
        .attr("x", 18).attr("y", 10)
        .text("Traditioneel / tijdstip van contact");

    legend.append("rect")
        .attr("x", 0).attr("y", 20)
        .attr("width", 12).attr("height", 12)
        .attr("fill", "#2f7d4f");

    legend.append("text")
        .attr("x", 18).attr("y", 30)
        .text("Hedendaags");
}

function renderDeltaBars(container, rows) {
    const tooltip = createTooltip(container);

    const svg = d3.select(container)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const sorted = rows.slice().sort((a, b) => b.deltaPct - a.deltaPct);

    const x = d3.scaleLinear()
        .domain(d3.extent(sorted, d => d.deltaPct))
        .nice()
        .range([MARGIN_DELTA.left, WIDTH - MARGIN_DELTA.right]);

    const y = d3.scaleBand()
        .domain(sorted.map(d => d.name))
        .range([MARGIN_DELTA.top, HEIGHT - MARGIN_DELTA.bottom])
        .padding(0.22);

    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT - MARGIN_DELTA.bottom})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(v => `${v}%`));

    svg.append("g")
        .attr("transform", `translate(${MARGIN_DELTA.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", MARGIN_DELTA.top).attr("y2", HEIGHT - MARGIN_DELTA.bottom)
        .attr("stroke", "#222")
        .attr("stroke-dasharray", "4 3");

    svg.append("text")
        .attr("x", MARGIN_DELTA.left)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .text("Netto verandering van oppervlakte (hedendaags t.o.v. traditioneel)"); 

    svg.append("g")
        .selectAll("rect")
        .data(sorted)
        .enter()
        .append("rect")
        .attr("x", d => Math.min(x(0), x(d.deltaPct)))
        .attr("y", d => y(d.name))
        .attr("width",  d => Math.abs(x(d.deltaPct) - x(0)))
        .attr("height", y.bandwidth())
        .attr("fill", d => d.deltaPct >= 0 ? "#2f7d4f" : "#b5473c")
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
            tooltip
                .style("opacity", 1)
                .text(d3.format(".6f")(d.deltaPct))
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
        });

    svg.append("g")
        .selectAll("text")
        .data(sorted)
        .enter()
        .append("text")
        .attr("x", d => d.deltaPct >= 0
            ? Math.min(x(d.deltaPct) + 6, WIDTH - MARGIN_DELTA.right - 2) 
            : Math.max(x(d.deltaPct) - 6, MARGIN_DELTA.left + 2))          
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", d => d.deltaPct >= 0 ? "start" : "end")
        .style("font-size", "12px")
        .text(d => formatPct(d.deltaPct));
}

async function start() {
    if (!element || !elementDelta) return;

    const { colonialRows } = await loadAsherColonialData();
    const filtered = colonialRows.filter(d => d.name !== "Russian");
    renderComparativeBars(element, filtered);
    renderDeltaBars(elementDelta, filtered);
}

start();
