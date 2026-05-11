import "../../d3.v7.js";
import { data } from "../../data.js";


const id = "kaart met puntjes van de talen";
const element = document.getElementById(id);

const width = 1500;
const height = 700;

const svg = d3.select(element).append("svg").style("width", "100%").style("height", height)

const tooltip = d3.select(element)
    .append("div")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 2200)
    .style("padding", "8px 10px")
    .style("background", "rgba(20, 20, 20, 0.92)")
    .style("color", "#fff")
    .style("border-radius", "8px")
    .style("font-size", "12px")
    .style("line-height", "1.35");

const projection = d3.geoMercator()
    .scale(120)
    .translate([width / 2, height / 1.5]);

const namen = ["not endangered", "threatened", "shifting", "moribund", "nearly extinct", "extinct", "NA"];

const vertalingen = {
    "not endangered": "Niet bedreigd",
    "threatened":     "Bedreigd",
    "shifting":       "In verschuiving",
    "moribund":       "Stervend",
    "nearly extinct": "Bijna uitgestorven",
    "extinct":        "Uitgestorven",
    "NA":             "Onbekend"
};

const kleur = d3.scaleOrdinal(namen, d3.quantize(d3.interpolateViridis, namen.length))

let puntjes = data.map(d => ({
    x:      projection([d["longitude"], d["latitude"]])[0],
    y:      projection([d["longitude"], d["latitude"]])[1],
    kleur:  d["status_label"] === "NA" ? "gray" : kleur(d["status_label"]),
    naam:   d["name"] ?? d["title"] ?? "Onbekend",
    status: vertalingen[d["status_label"]] ?? d["status_label"]
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
    .attr("fill", "#282828")

svg.selectAll()
    .data(puntjes)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 1)
    .attr("fill", d => d.kleur)
    .style("cursor", "pointer")       // 👈 add from here
    .on("mouseenter", (event, d) => {
        tooltip
            .style("opacity", 1)
            .html(`
                <strong>${d.naam}</strong><br>
                ${d.status}
            `)
            .style("left", `${event.clientX + 12}px`)
            .style("top",  `${event.clientY - 12}px`);
    })
    .on("mousemove", event => {
        tooltip
            .style("left", `${event.clientX + 12}px`)
            .style("top",  `${event.clientY - 12}px`);
    })
    .on("mouseleave", () => {
        tooltip.style("opacity", 0);
    });

const legendeHoogte = 20 + namen.length * 20 + 10;
const legendeBreedte = 190;
const legendeX = 10;
const legendeY = height - legendeHoogte - 10;

const legende = svg.append("g")
    .attr("transform", `translate(${legendeX}, ${legendeY})`);

legende.append("rect")
    .attr("width", legendeBreedte)
    .attr("height", legendeHoogte)
    .attr("rx", 10)
    .attr("fill", "white")
    .attr("opacity", 0.92);

legende
    .selectAll(".legende-tekst")
    .data(namen)
    .enter()
    .append("text")
    .attr("class", "legende-tekst")
    .attr("x", 10)
    .attr("y", (_, i) => 25 + i * 20)
    .style("font-size", "13px")
    .text(d => vertalingen[d] ?? d);

legende
    .selectAll(".legende-kleur")
    .data(namen)
    .enter()
    .append("rect")
    .attr("class", "legende-kleur")
    .attr("x", legendeBreedte - 10 - 14)
    .attr("y", (_, i) => 13 + i * 20)
    .attr("width", 14)
    .attr("height", 14)
    .attr("rx", 4)
    .attr("fill", d => d === "NA" ? "darkgrey" : kleur(d));
