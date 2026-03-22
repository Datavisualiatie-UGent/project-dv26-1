import "../d3.v7.js";
import {data} from "../data.js";

const id = "lijn van de verdeling van aantal talen per familie";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element).selectAll();

const svg = graph
    .append("svg")
    .data([10,20,50,40,90,60,70,20])
    .enter();