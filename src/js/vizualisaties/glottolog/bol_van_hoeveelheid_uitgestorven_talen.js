import "../../d3.v7.js";
import { data } from "../../data.js";

/*
 * ik weet niet hoe het zit met bronvermelding enzo maar ik heb alles van dit bestand deels gestolen van https://observablehq.com/@d3/pie-chart/2
*/

const id = "bol van hoeveelheid uitgestorven talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const width = element.clientWidth || 800;
const height = element.clientHeight || 600;

const bedreigdheidsnamen = {
    "not endangered":1,
    "threatened":2,
    "shifting":3,
    "moribund":4,
    "nearly extinct":5,
    "extinct":6,
    "NA":7
};

const bedreigdheden = Object.entries(
    data.reduce((acc, curr) => {
        if (curr["status_label"] in acc) acc[curr["status_label"]]++;
        else acc = { [curr["status_label"]]: 1, ...acc };
        return acc;
    }, {})
).sort((a,b) => bedreigdheidsnamen[a[0]] - bedreigdheidsnamen[b[0]]);

const totaal = bedreigdheden.reduce((a, b) => a + b[1], 0);

const svg = graph
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);


const hihi = bedreigdheden.map(d => d[1])
const kleur = d3.scaleOrdinal(hihi, d3.quantize(d3.interpolateViridis, hihi.length))

const tooltip = graph
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

const bogen = d3
    .pie()
    .sort(null)
    .value(d => d[1])(bedreigdheden);

const boog = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 1);

const taart_stukken = svg
    .append("g")
    .attr("transform", `translate(100,0)`)
    .selectAll()
    .data(bogen)
    .join("path")
    .attr("d", boog)
    .attr("stroke", "white")
    .attr("fill", d => d.data[0] == "NA" ? "darkgrey" : kleur(d.data[1]))
    .style("cursor", "pointer")
    .on("mouseenter", (event, d) => {
        const percentage = d.data[1] / totaal * 100;

        tooltip
            .style("opacity", 1)
            .html(`
                <strong>${d.data[0]}</strong><br>
                ${d.data[1]} languages<br>
                ${percentage.toFixed(2)}%
            `)
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

const legende = svg.append("g");

legende.append("rect")
    .attr("x", width/-2)
    .attr("y", height/2-150+5)
    .attr("width", 200)
    .attr("height", 145)
    .attr("rx", 10)
    .attr("fill", "white");

    const vertalingen = {
    "not endangered":  "Niet bedreigd",
    "threatened":      "Bedreigd",
    "shifting":        "In verschuiving",
    "moribund":        "Stervend",
    "nearly extinct":  "Bijna uitgestorven",
    "extinct":         "Uitgestorven",
    "NA":              "Onbekend"
};

legende
    .selectAll()
    .data(bedreigdheden)
    .enter()
    .append("text")
    .attr("x", width/-2 + 18)
    .attr("y", d => height/2-150 + 30 + 20 * bedreigdheden.indexOf(d))
    .style("font-size", "13px")
    .text(d => vertalingen[d[0]] || d[0]);

legende
    .selectAll()
    .data(bedreigdheden)
    .enter()
    .append("rect")
    .attr("x", width/-2 + 160)
    .attr("y", d => height/2-150 + 18 + 20 * bedreigdheden.indexOf(d))
    .attr("width", 14)
    .attr("height", 14)
    .attr("rx", 4)
    .attr("fill", d => d[0] == "NA" ? "darkgrey" : kleur(d[1]));