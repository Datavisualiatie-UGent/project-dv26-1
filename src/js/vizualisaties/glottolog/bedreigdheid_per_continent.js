import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "bedreigdheid per continent";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);

const bedreigdheidsnamen = ["not endangered", "threatened", "shifting", "moribund", "nearly extinct", "extinct", "NA"];
const clean_data = data.filter(d => d["macroarea"] != "NA").flatMap(d => d["macroarea"].split(";").map(macroarea => ({...d, macroarea: macroarea})));
const macroareas = [...new Set(clean_data.map(d => d["macroarea"]))];
console.log(Object.fromEntries(macroareas.map(d => [d,bedreigdheidsnamen.map(_ => 0)])))
const continent_bedreigdheden = clean_data.reduce(
    (acc,d) => (acc[d["macroarea"]][bedreigdheidsnamen.indexOf(d["status_label"])]++,acc),
    Object.fromEntries(macroareas.map(d => [d,bedreigdheidsnamen.map(_ => 0)])))
console.log(continent_bedreigdheden)

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
    .data(Object.entries(continent_bedreigdheden))
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

for(let i=0;i<bedreigdheidsnamen.length;i++){
    bedreigdheidsstaven.append("div")
        .style("width", "10%")
        .attr("class", "bar")
        .style("background-color", "white")
}
