import "../../d3.v7.js";
import { data } from "../../data.js";

const width = 800;
const height = 400;

const id = "kaart met puntjes van de talen per familie";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const svg = d3.select(element).append("svg").style("width", width+200).style("height", height)

const projection = d3.geoMercator()
    .scale(120)
    .translate([width / 2, height / 1.5]);

const namen = ["not endangered", "threatened", "shifting", "moribund", "nearly extinct", "extinct", "NA"];

const familie_selector = document.getElementById("selecteer familie");
const starttaal = "Atlantic-Congo";
if(familie_selector == null) throw new Error("selector niet gevonden");
const families = data.map(d => d["family"]).sort().filter((v, i, arr) => arr.indexOf(v) == i);
families.forEach(f => {
    const optie = document.createElement("option");
    optie.textContent = f;
    if(f == starttaal) optie.selected = true;
    familie_selector.appendChild(optie);
});

let puntjes = data.map(d => ({
    x: projection([d["longitude"], d["latitude"]])[0],
    y: projection([d["longitude"], d["latitude"]])[1],
    familie: d["family"]
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
puntjes = puntjes.sort((p1, p2) => p1.y-p2.y);

function render(familie){
    svg.selectAll("*").remove();
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
        .attr("fill", d => d.familie == familie? "red": "white");
}

render(starttaal);

familie_selector.addEventListener("change", function () {
    render(this.value);
});