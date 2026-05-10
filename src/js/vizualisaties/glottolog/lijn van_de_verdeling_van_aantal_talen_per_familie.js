import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "lijn van de verdeling van aantal talen per familie";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const familie_telling = Object.entries(
    data.reduce((acc, curr, index) => {
        if (curr.family in acc) acc[curr.family]++;
        else acc[curr.family] = 1;
        return acc;
    }, {}))
    .sort((a, b) => b[1] - a[1]);

const rand = { boven: 10, beneden: 30, links: 60, rechts: 10 },
    hoogte = element.clientHeight || 600,
    breedte = element.clientWidth || 900;

const tekening = graph
    .append("svg")
    .attr("width", breedte)
    .attr("height", hoogte)

const tooltip = graph
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
    .attr("fill", "steelblue")
    .style("cursor", "pointer")
    .on("mouseenter", function(event, d) {
        d3.select(this).attr("fill", "#2a5f8f");
        tooltip
            .style("opacity", 1)
            .html(`<strong>${d[0] || "Unknown family"}</strong><br>${d[1]} talen`)
            .style("left", `${event.clientX + 14}px`)
            .style("top", `${event.clientY - 12}px`);
    })
    .on("mousemove", function(event) {
        tooltip
            .style("left", `${event.clientX + 14}px`)
            .style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", function() {
        d3.select(this).attr("fill", "steelblue");
        tooltip.style("opacity", 0);
    });

tekening.append("g")
    .attr("transform", `translate(${rand.links}, ${rand.boven})`)
    .call(d3.axisLeft(y_as));

tekening.append("text")
    .attr("transform", `rotate(-90) translate(-${hoogte/3*2},15)`)
    .text("number of languages in family")

tekening.append("text")
    .attr("transform", `translate(${breedte/2},${hoogte-3})`)
    .text("language families sorted by size")