import fs from "fs";

const data = fs.readFileSync("data.jsonl", "utf-8").split("\n").map(JSON.parse);

const formattedData = data.map((d) => {
  if (d.text) return d;

  d.text = d.chain.reduce(
    (acc, c) =>
      acc +
      `<|start_header_id|>${
        c.role === "student" ? "user" : "assistant"
      }<|end_header_id|>\n\n${c.content}<|eot_id|>`,
    "<|start_header_id|>system<|end_header_id|>\n\nYour job is to help a student brainstorm an essay thesis about the given topic.<|eot_id|>"
  );

  return d;
});

fs.writeFileSync(
  "formattedData.jsonl",
  formattedData.map(JSON.stringify).join("\n")
);
