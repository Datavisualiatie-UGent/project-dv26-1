import "../d3.v7.js";
import { data } from "../data.js";

const id = "horizontale bar van aantal talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const grafiek = d3.select(element).append("table").selectAll();

const bar_stijl = document.createElement("style");
bar_stijl.textContent = `
    div.bar {
    width: 1000px;
    height: 22px;
    color: white;
    background-color: darkgreen;}`;
element.appendChild(bar_stijl);

const familie_telling = Object.entries(
    data.reduce((acc, curr, index) => {
        if (curr.family in acc) acc[curr.family]++;
        else acc[curr.family] = 0;
        return acc;
    }, {}))
    .sort((a, b) => a[1] - b[1])
    .reduce((acc, curr, index) => {
        if (curr[1] < 50) acc[0][1] += curr[1];
        else acc = acc.concat([curr]);
        return acc;
    }, [["andere (< 50 talen)", 0]])
    .reverse()
    .filter(d => !(["NA", "Unattested", "Unclassifiable"].includes(d[0])));

const rijen = grafiek
    .data(familie_telling)
    .enter()
    .append("tr");

rijen.append("td")
    .style("padding", "0px")
    .text(d => d[0]);

const kolommen = rijen.append("td")
    .style("padding", "0px")
    .append("div")
    .attr("class", "bar")
    .style("width", d => `${d[1]*.9}px`);

kolommen.append("div")
    .text(d => d[1])
    .style("margin", "2px");
