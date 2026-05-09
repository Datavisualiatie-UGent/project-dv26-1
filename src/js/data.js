const data_csv = await fetch(new URL("../data/dataset", import.meta.url)).then(response => response.text());
const lijnen = data_csv.split("\n"); //kankerwindows
const hoofding = lijnen[0].split(",");
export const data = lijnen.slice(1).map(line => line.split(",").reduce((acc, curr, index) => ({ [hoofding[index]]: curr, ...acc }), {}));