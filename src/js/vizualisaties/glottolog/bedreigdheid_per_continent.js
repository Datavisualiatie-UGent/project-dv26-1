import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "bedreigdheid per continent";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const bedreigdheidsnamen = ["not endangered", "threatened", "shifting", "moribund", "nearly extinct", "extinct", "NA"];
const kleur = d3
    .scaleOrdinal()
    .domain(bedreigdheidsnamen)
    .range(d3.schemeTableau10)

const clean_data = data.filter(d => d["macroarea"] != "NA").flatMap(d => d["macroarea"].split(";").map(macroarea => ({...d, macroarea: macroarea})));
const macroareas = [...new Set(clean_data.map(d => d["macroarea"]))];
console.log(Object.fromEntries(macroareas.map(d => [d,bedreigdheidsnamen.map(_ => 0)])))
let continent_bedreigdheden = Object.entries(clean_data.reduce(
    (acc,d) => (acc[d["macroarea"]][bedreigdheidsnamen.indexOf(d["status_label"])]++,acc),
    Object.fromEntries(macroareas.map(d => [d,bedreigdheidsnamen.map(_ => 0)]))
));
console.log(continent_bedreigdheden)
continent_bedreigdheden = continent_bedreigdheden.sort((a,b) => a[1].at(-2)/a[1].slice(0,-1).reduce((c,d) => c+d,0)-b[1].at(-2)/b[1].slice(0,-1).reduce((c,d) => c+d,0))

const bar_stijl = document.createElement("style");
bar_stijl.textContent = `
    div.bar {
    width: 20px;
    height: 22px;
    color: white;
    background-color: darkgreen;}
`;

element.appendChild(bar_stijl);

const tabel =graph.append("table")
    .style("width", "100%")

const rijen = tabel.selectAll()
    .data(continent_bedreigdheden)
    .enter()
    .append("tr")

rijen.append("td")
    .style("width", "20%")
    .text(d => d[0])

const bedreigdheidsstaven = rijen.append("td")
    .style("width", "100%")
    .attr("class", "bar")
    .style("background-color", "white")
    .style("display", "flex")

for(let i=0;i<bedreigdheidsnamen.length-1;i++){
    bedreigdheidsstaven.append("div")
        .style("width", d => `${d[1][i]/d[1].slice(0,-1).reduce((a,b) => a+b,0)*100}%`)
        .attr("class", "bar")
        .attr("title", d => bedreigdheidsnamen[i] + ": " + `${(d[1][i]/d[1].slice(0,-1).reduce((a,b) => a+b,0)*100).toFixed(2)}%`)
        .style("background-color", kleur(bedreigdheidsnamen[i]));
}
