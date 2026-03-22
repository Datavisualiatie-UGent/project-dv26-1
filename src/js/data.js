const data_csv = await fetch("/data/dataset").then(response => response.text());
const lijnen = data_csv.split("\r\n"); //kankerwindows
const hoofding = lijnen[0].split(",");
export const data = lijnen.slice(1).map(line => line.split(",").reduce((acc, curr, index) => ({ [hoofding[index]]: curr, ...acc }), {}));