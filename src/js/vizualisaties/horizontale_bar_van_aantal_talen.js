import "../d3.v7.js";
import {data} from "../data.js";

const id = "horizontale bar van aantal talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element).selectAll();

const bar_style = document.createElement("style");
bar_style.textContent = `
    div.bar {
    width: 1000px;
    height: 22px;
    color: white;
    background-color: darkgreen;}`;
element.appendChild(bar_style);


const family_counts = Object.entries(
    data.reduce((acc, curr, index) => {
        if (curr.family in acc) acc[curr.family]++;
        else acc[curr.family] = 0;
        return acc;
    }, {}))
    .reduce((acc, curr, index) => {
        if(curr[1] < 50) acc[0][1] += curr[1];
        else acc = acc.concat([curr]);
        return acc;
    }, [["others (< 50 languages)", 0]])
    .sort((a, b) => b[1] - a[1]);

const rows = graph
    .data(family_counts)
    .enter()
    .append("tr");

rows.append("td")
    .style("padding", "0px")
    .text(d => d[0]);

const bars = rows.append("td")
    .style("padding", "0px")
    .append("div")
    .attr("class", "bar")
    .style("width", d => `${d[1]}px`);

bars.append("div")
    .text(d => d[1])
    .style("margin", "2px");

console.log("hihi")