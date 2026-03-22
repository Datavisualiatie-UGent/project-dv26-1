const data_csv = await fetch("/data/dataset").then(response => response.text());
const lines = data_csv.split("\r\n"); //kankerwindows
const header = lines[0].split(",");
export const data = lines.slice(1).map(line => line.split(",").reduce((acc, curr, index) => ({ [header[index]]: curr, ...acc }), {}));