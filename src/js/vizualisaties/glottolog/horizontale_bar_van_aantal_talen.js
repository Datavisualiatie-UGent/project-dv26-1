import "../../d3.v7.js";
import { data } from "../../data.js";

const id = "horizontale bar van aantal talen";
const element = document.getElementById(id);

if (!element) {
    console.error(`element ${id} niet gevonden`);
}

const graph = d3.select(element);

const grafiek = graph
    .append("table")
    .style("width", "100%")
    .style("border-spacing", "0 4px")
    .selectAll();

const bar_stijl = document.createElement("style");

bar_stijl.textContent = `
    div.bar {
        width: 20px;
        height: 22px;
        color: white;
        background-color: darkgreen;
        border-radius: 4px;
    }
`;

element.appendChild(bar_stijl);

const tooltip = graph
    .append("div")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 2200)
    .style("padding", "10px 12px")
    .style("background", "rgba(20, 20, 20, 0.92)")
    .style("color", "#fff")
    .style("border-radius", "8px")
    .style("font-size", "12px")
    .style("line-height", "1.35")
    .style("max-width", "260px")
    .style("box-shadow", "0 2px 10px rgba(0,0,0,0.35)");

const familie_data = Object.entries(
    data.reduce((acc, curr) => {
        const familie = curr.family;

        if (!(familie in acc)) {
            acc[familie] = {
                aantal: 0,
                talen: []
            };
        }

        acc[familie].aantal++;

        // choose correct language field
        const taalnaam =
            curr.name ||
            curr.language ||
            curr.language_name ||
            "onbekende taal";

        acc[familie].talen.push(taalnaam);

        return acc;
    }, {})
);

const kleine_families = {
    aantal: 0,
    talen: []
};

const familie_telling = familie_data
    .sort((a, b) => a[1].aantal - b[1].aantal)
    .reduce((acc, curr) => {
        if (curr[1].aantal < 50) {
            kleine_families.aantal += curr[1].aantal;
            kleine_families.talen.push(...curr[1].talen);
        } else {
            acc.push([
                curr[0],
                {
                    aantal: curr[1].aantal,
                    talen: curr[1].talen
                }
            ]);
        }

        return acc;
    }, [["andere (< 50 talen)", kleine_families]])
    .reverse()
    .filter(d =>
        !["NA", "Unattested", "Unclassifiable", "Bookkeeping"].includes(d[0])
    );

const maxAantal = familie_telling.reduce(
    (a, b) => Math.max(a, b[1].aantal),
    0
);

const rijen = grafiek
    .data(familie_telling)
    .enter()
    .append("tr");

rijen.append("td")
    .style("padding", "0px 10px 0px 0px")
    .style("width", "20%")
    .style("white-space", "nowrap")
    .text(d => d[0]);

const kolommen = rijen
    .append("td")
    .style("padding", "0px")
    .append("div")
    .attr("class", "bar")
    .style("width", d => `${d[1].aantal / maxAantal * 100}%`)
    .style("cursor", "pointer");

let pinned = false;
let pinnedElement = null;

function showTooltip(event, d) {
    const talenlijst = d[1].talen
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map(t => `<div>${t}</div>`)
        .join("");

    tooltip
        .style("opacity", 1)
        .html(`
            <div style="
                font-weight:bold;
                margin-bottom:6px;
            ">
                ${d[0]} (${d[1].aantal} talen)
            </div>

            <div style="
                max-height:200px;
                overflow-y:auto;
                padding-right:4px;
            ">
                ${talenlijst}
            </div>
        `)
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY - 12}px`);
}

kolommen
    .on("mouseenter", (event, d) => {
        if (pinned) return;

        showTooltip(event, d);
    })
    .on("mousemove", (event) => {
        if (pinned) return;

        tooltip
            .style("left", `${event.clientX + 12}px`)
            .style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", () => {
        if (!pinned) {
            tooltip.style("opacity", 0);
        }
    })
    .on("click", (event, d) => {
        event.stopPropagation();

        // close if clicking same bar again
        if (pinned && pinnedElement === event.currentTarget) {
            pinned = false;
            pinnedElement = null;

            tooltip
                .style("opacity", 0)
                .style("pointer-events", "none");

            return;
        }

        pinned = true;
        pinnedElement = event.currentTarget;

        showTooltip(event, d);

        tooltip.style("pointer-events", "auto");
    });

d3.select(document).on("click", () => {
    pinned = false;
    pinnedElement = null;

    tooltip
        .style("opacity", 0)
        .style("pointer-events", "none");
});

kolommen
    .style("position", "relative")
    .style("overflow", "visible");

kolommen.append("div")
    .text(d => d[1].aantal)
    .style("position", "absolute")
    .style("top", "50%")
    .style("transform", "translateY(-50%)")
    .style("font-size", "13px")
    .style("white-space", "nowrap")
    .style("pointer-events", "none")
    .style("right", d => {
        const percentage = d[1].aantal / maxAantal;

        // if bar almost reaches edge, place label inside
        return percentage > 0.9 ? "6px" : "-38px";
    })
    .style("color", d => {
        const percentage = d[1].aantal / maxAantal;

        return percentage > 0.9 ? "white" : "#222";
    });