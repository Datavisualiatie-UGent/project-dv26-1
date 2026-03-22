const data_csv = await fetch("/data/dataset").then(response => response.text());
const lijnen = data_csv.split("\n"); //kankerwindows
const hoofding = lijnen[0].split(",");
lijnen.forEach(l => {
    if(l.split(",").length != hoofding.length) console.log(l, l.split(","), l.split(",").length);
})
export const data = lijnen.slice(1).map(line => line.split(",").reduce((acc, curr, index) => ({ [hoofding[index]]: curr, ...acc }), {}));