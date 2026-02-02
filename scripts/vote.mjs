import fs from "node:fs";
import path from "node:path";

const SITE_DIR = path.resolve("site");
const dataPath = path.join(SITE_DIR, "fights.json");

const [voterId, choice] = process.argv.slice(2);
if (!voterId || !choice) {
  console.error("usage: node scripts/vote.mjs <voterId> <emoji>");
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (!data.active?.id) {
  console.error("no active fight");
  process.exit(2);
}

const allowed = new Set(data.active.foods);
if (!allowed.has(choice)) {
  console.error(`invalid vote: ${choice}. allowed: ${[...allowed].join(" ")}`);
  process.exit(2);
}

data.active.votes = data.active.votes || {};
data.active.votes[voterId] = choice;

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log("recorded vote", voterId, choice);
