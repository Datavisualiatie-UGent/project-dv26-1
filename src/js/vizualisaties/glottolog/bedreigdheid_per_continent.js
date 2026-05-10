import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "bedreigdheid per continent";
const element = document.getElementById(id);
const graph = d3.select(element);

const container = graph
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("width", "100%");

const bedreigdheidsnamen = [
    "not endangered",
    "threatened",
    "shifting",
    "moribund",
    "nearly extinct",
    "extinct",
    "NA"
];

// Nederlandse namen voor de legende + tooltips
const nederlandseNamen = {
    "not endangered": "niet bedreigd",
    "threatened": "bedreigd",
    "shifting": "verschuivend",
    "moribund": "stervend",
    "nearly extinct": "bijna uitgestorven",
    "extinct": "uitgestorven",
    "NA": "onbekend"
};

const kleur = d3
    .scaleOrdinal()
    .domain(bedreigdheidsnamen)
    .range(d3.schemeTableau10)

const clean_data = data
    .filter(d => d["macroarea"] != "NA")
    .flatMap(d =>
        d["macroarea"]
            .split(";")
            .map(macroarea => ({ ...d, macroarea }))
    );

const macroareas = [...new Set(clean_data.map(d => d["macroarea"]))];

let continent_bedreigdheden = Object.entries(
    clean_data.reduce(
        (acc, d) => (
            acc[d["macroarea"]][bedreigdheidsnamen.indexOf(d["status_label"])]++,
            acc
        ),
        Object.fromEntries(
            macroareas.map(d => [d, bedreigdheidsnamen.map(_ => 0)])
        )
    )
);

continent_bedreigdheden = continent_bedreigdheden.sort(
    (a, b) =>
        a[1].at(-2) / a[1].slice(0, -1).reduce((c, d) => c + d, 0)
        -
        b[1].at(-2) / b[1].slice(0, -1).reduce((c, d) => c + d, 0)
);

const bar_stijl = document.createElement("style");
bar_stijl.textContent = `
    div.bar {
        width: 20px;
        height: 22px;
        color: white;
        background-color: darkgreen;
    }
`;

element.appendChild(bar_stijl);

// Alleen deze visualisatie breder maken
graph
    .style("padding", "12px")
    .style("overflow", "hidden")
    .style("max-width", "1100px")
    .style("width", "100%");

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

const tabel = container.append("table")
    .style("width", "100%");

const rijen = tabel.selectAll()
    .data(continent_bedreigdheden)
    .enter()
    .append("tr");

rijen.append("td")
    .style("width", "20%")
    .text(d => d[0]);

const bedreigdheidsstaven = rijen.append("td")
    .style("width", "100%")
    .attr("class", "bar")
    .style("background-color", "white")
    .style("display", "flex");

for (let i = 0; i < bedreigdheidsnamen.length - 1; i++) {
    bedreigdheidsstaven.append("div")
        .style(
            "width",
            d => `${d[1][i] / d[1].slice(0, -1).reduce((a, b) => a + b, 0) * 100}%`
        )
        .attr("class", "bar")
        .style("background-color", kleur(bedreigdheidsnamen[i]))
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
            const percentage =
                d[1][i] /
                d[1].slice(0, -1).reduce((a, b) => a + b, 0) *
                100;

            tooltip
                .style("opacity", 1)
                .text(`${nederlandseNamen[bedreigdheidsnamen[i]]}: ${percentage.toFixed(2)}%`)
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
}

const legenda = container.append("div")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("justify-content", "center")
    .style("gap", "8px 16px")
    .style("margin-top", "18px")
    .style("padding-top", "8px");

legenda.selectAll("div")
    .data(bedreigdheidsnamen.slice(0, -1))
    .enter()
    .append("div")
    .style("display", "inline-flex")
    .style("align-items", "center")
    .style("gap", "6px")
    .style("font-size", "12px")
    .style("color", "#333")
    .html(d => `
        <span
            style="
                width:10px;
                height:10px;
                border-radius:2px;
                display:inline-block;
                background:${kleur(d)}
            ">
        </span>
        ${nederlandseNamen[d]}
    `);