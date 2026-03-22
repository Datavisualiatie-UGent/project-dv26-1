import "../d3.v7.js";
import { data } from "../data.js";

/*
 * ik weet niet hoe het zit met bronvermelding enzo maar ik heb alles van dit bestand deels gestolen van https://observablehq.com/@d3/pie-chart/2
*/

const id = "bol van hoeveelheid uitgestorven talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const width = 800;
const height = 600;

const codes = {
    "not endangered":1,
    "threatened":2,
    "shifting":3,
    "moribund":4,
    "nearly extinct":5,
    "extinct":6,
    "NA":7
};
const bedreigdheden = Object.entries(data
    .reduce((acc, curr, index) => {
        if (curr["status_label"] in acc) acc[curr["status_label"]]++;
        else acc = { [curr["status_label"]]: 1, ...acc };
        return acc;
    }, {})
).sort((a,b) => codes[a[0]] - codes[b[0]]);

const svg = graph
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])

const kleur = d3
    .scaleOrdinal()
    .domain(bedreigdheden.map(d => d[1]))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), bedreigdheden.length).reverse())

const bogen = d3
    .pie()
    .sort(null)
    .value(d => d[1])(bedreigdheden);

console.log(bogen);

const boog = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 1);

const taart_stukken = svg
    .append("g")
    .attr("stroke", "white")
    .selectAll()
    .data(bogen)
    .join("path")
    .attr("d", boog)
    .attr("transform", `translate(100,0)`)
    .attr("fill", d => d.data[0] == "NA"? "darkgrey": kleur(d.data[1]));

taart_stukken
    .append("title")
    .text(d => `${d.data[0]}: ${d.data[1]}`);

const legende = svg.append("g")

legende.append("rect")
    .attr("x", width/-2)
    .attr("y", height/2-150+5)
    .attr("width", 200)
    .attr("height", 150-5)
    .attr("fill", "darkgrey")

legende
    .append("rect")
    .attr("x", width/-2+10)
    .attr("y", height/2-150+10+3)
    .attr("width", 200-20)
    .attr("height", 150-20-3)
    .attr("fill", "white");

legende
    .selectAll()
    .data(bedreigdheden)
    .enter()
    .append("text")
    .attr("x", d => width/-2+10)
    .attr("y", d => height/2-150+25+18*bedreigdheden.indexOf(d)+2)
    .text(d => d[0])

legende
    .selectAll()
    .data(bedreigdheden)
    .enter()
    .append("rect")
    .attr("x", width/-2+200-10-18)
    .attr("y", d => height/2-150+10+18*bedreigdheden.indexOf(d)+4)
    .attr("width", 18-1)
    .attr("height", 18-1)
    .attr("fill", d => d[0] == "NA"? "darkgrey": kleur(d[1]))
