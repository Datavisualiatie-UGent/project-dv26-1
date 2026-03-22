import "../d3.v7.js";
import { data } from "../data.js";

/*
 * ik weet niet hoe het zit met bronvermelding enzo maar ik heb alles van dit bestand gestolen van https://observablehq.com/@d3/pie-chart/2
*/

const id = "bol van hoeveelheid uitgestorven talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const width = 600;
const height = 600;

const data2 = [
  {name: "niet gestorven", value: 2000},
  {name: "uitgestorven", value: 1500},
]

const svg = graph
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin-left", "100px")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

const color = d3.scaleOrdinal()
      .domain(data2.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data2.length).reverse())

const arcs = d3.pie()
    .sort(null)
    .value(d => d.value)(data2);

const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 1);

const labelRadius = arc.outerRadius()() * 0.8;

const arcLabel = d3.arc()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius);

svg.append("g")
    .attr("stroke", "white")
    .selectAll()
    .data(arcs)
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc)
    .append("title")
    .text(d => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);

svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll()
    .data(arcs)
    .join("text")
    .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .call(text => text.append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(d => d.data.name))
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .text(d => d.data.value.toLocaleString("en-US")));