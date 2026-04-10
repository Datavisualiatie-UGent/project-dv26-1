import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "kaart met puntjes van de talen";
const element = document.getElementById(id);
if (!element) console.error(`element ${id} niet gevonden`);
const graph = d3.select(element);