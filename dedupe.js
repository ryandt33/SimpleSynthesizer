import fs from "fs";
const data = fs
  .readFileSync("formattedData.jsonl", "utf-8")
  .split("\n")
  .map(JSON.parse);

const topicList = [];

const filteredList = data.filter((d) => {
  const topic = d.topic;
  if (!topicList.includes(topic)) {
    topicList.push(topic);
    return true;
  }
  return false;
});

console.log(filteredList.length);

fs.writeFileSync(
  "filteredData.jsonl",
  filteredList.map(JSON.stringify).join("\n")
);
