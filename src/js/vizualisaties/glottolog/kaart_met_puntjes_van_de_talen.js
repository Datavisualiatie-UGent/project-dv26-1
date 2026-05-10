import "../../d3.v7.js";
import { data } from "../../data.js";


const id = "kaart met puntjes van de talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);

const width = element.clientWidth || 800;
const height = element.clientHeight || 400;

const svg = d3.select(element).append("svg").style("width", width+200).style("height", height)

const projection = d3.geoMercator()
    .scale(120)
    .translate([width / 2, height / 1.5]);

const namen = ["not endangered", "threatened", "shifting", "moribund", "nearly extinct", "extinct", "NA"];

const kleur = d3
    .scaleOrdinal()
    .domain(namen)
    .range(d3.schemeTableau10)

let puntjes = data.map(d => ({
    x: projection([d["longitude"], d["latitude"]])[0],
    y: projection([d["longitude"], d["latitude"]])[1],
    kleur: d["status_label"] == "NA"? "gray": kleur(d["status_label"])
}));

const min_x = puntjes.reduce((min,p)=>Math.min(min,p.x),1000);
const min_y = puntjes.reduce((min,p)=>Math.min(min,p.y),1000);
puntjes = puntjes.map(p => ({...p,
    x: p.x-min_x,
    y: p.y-min_y
}))

const max_x = puntjes.reduce((max,p)=>Math.max(max,p.x),0);
const max_y = puntjes.reduce((max,p)=>Math.max(max,p.y),0);

const scale = max_y*((width-10)/max_x)>400? (height-10)/max_y: (width-10)/max_x;

puntjes = puntjes.map(p => ({...p,
    x : p.x*scale+5,
    y : p.y*scale+5,
}));

// svg.style("width", width+200).style("height", height)

puntjes = puntjes.sort((p1, p2) => p1.y-p2.y);

svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 10)
    .attr("fill", "#242424")

svg.selectAll()
    .data(puntjes)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 1)
    .attr("fill", d => d.kleur);

const legende = svg.append("g")

legende.append("rect")
    .attr("x", width)
    .attr("y", height-150)
    .attr("width", 200)
    .attr("height", 150)
    .attr("rx", 10)
    .attr("fill", "darkgrey")

legende
    .append("rect")
    .attr("x", width+10)
    .attr("y", height-150+10+3)
    .attr("width", 200-20)
    .attr("height", 150-20-3)
    .attr("rx", 10)
    .attr("fill", "white");

legende
    .selectAll()
    .data(namen)
    .enter()
    .append("text")
    .attr("x", width+10)
    .attr("y", d => height-150+25+18*namen.indexOf(d)+2)
    .text(d => d)

legende
    .selectAll()
    .data(namen)
    .enter()
    .append("rect")
    .attr("x", width+200-10-18)
    .attr("rx", 5)
    .attr("y", d => height-150+10+18*namen.indexOf(d)+4)
    .attr("width", 18-1)
    .attr("height", 18-1)
    .attr("fill", d => d == "NA"? "darkgrey": kleur(d))
