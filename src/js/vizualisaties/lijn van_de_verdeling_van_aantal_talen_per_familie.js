import "../d3.v7.js";
import { data } from "../data.js";

const id = "lijn van de verdeling van aantal talen per familie";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const familie_telling = Object.entries(
    data.reduce((acc, curr, index) => {
        if (curr.family in acc) acc[curr.family]++;
        else acc[curr.family] = 0;
        return acc;
    }, {}))
    .sort((a, b) => b[1] - a[1]);

const rand = { boven: 10, beneden: 20, links: 60, rechts: 10 },
    hoogte = 600,
    breedte = 800;

const tekening = graph
    .append("svg")
    .attr("width", breedte)
    .attr("height", hoogte)

const x_as = d3.scaleBand()
    .domain(d3.range(familie_telling.length))
    .range([0, breedte - rand.links - rand.rechts])
    .padding(0.1);

const y_as = d3.scaleLinear()
    .domain([0, d3.max(familie_telling, d => d[1])])
    .range([hoogte - rand.beneden, rand.boven]);

tekening.selectAll("rect")
    .data(familie_telling)
    .enter()
    .append("rect")
    .attr("x", (_, i) => x_as(i))
    .attr("y", d => y_as(d[1]))
    .attr("width", x_as.bandwidth())
    .attr("height", d => hoogte - y_as(d[1]) - rand.beneden + 1)
    .attr("transform", `translate(${rand.links}, ${rand.boven})`)
    .attr("fill", "steelblue");

tekening.append("g")
    .attr("transform", `translate(${rand.links}, ${rand.boven})`)
    .call(d3.axisLeft(y_as));