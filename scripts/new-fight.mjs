import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SITE_DIR = path.resolve("site");
const dataPath = path.join(SITE_DIR, "fights.json");

const foods = process.argv.slice(2);
if (foods.length !== 2) {
  console.error("usage: node scripts/new-fight.mjs <emoji1> <emoji2>");
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// archive old active if exists
if (data.active?.id) {
  data.history = data.history || [];
  data.history.push(data.active);
}

const now = new Date().toISOString();
data.active = {
  id: crypto.randomUUID(),
  createdAt: now,
  foods,
  votes: {}
};

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log("created fight", data.active.id);
