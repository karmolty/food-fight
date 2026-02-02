import fs from "node:fs";
import path from "node:path";

const SITE_DIR = path.resolve("site");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tally(fight) {
  const [a, b] = fight.foods || [];
  const votes = Object.values(fight.votes || {});
  const aCount = votes.filter((v) => v === a).length;
  const bCount = votes.filter((v) => v === b).length;
  return { a, b, aCount, bCount, total: votes.length };
}

function comparisonLine({ a, b, aCount, bCount }) {
  if (!a || !b) return "";
  if (aCount === bCount) return `${a} ${aCount} = ${b} ${bCount}`;
  if (aCount > bCount) return `${a} ${aCount} > ${b} ${bCount}`;
  return `${b} ${bCount} > ${a} ${aCount}`;
}

function laTimestamp(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  } catch {
    return iso;
  }
}

function renderFightLine(fight, label) {
  const t = tally(fight);
  const line = comparisonLine(t);
  const when = laTimestamp(fight.createdAt);
  return `
    <div class="fight">
      <div class="label">${escapeHtml(label)}</div>
      <div class="line">${escapeHtml(line || "?")}</div>
      <div class="meta">${escapeHtml(when)} • ${escapeHtml(String(t.total))} votes</div>
    </div>`;
}

const dataPath = path.join(SITE_DIR, "fights.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const active = data.active;
const history = data.history || [];

const activeBlock = active?.id
  ? renderFightLine(active, "Current Fight")
  : `
    <div class="fight">
      <div class="label">Current Fight</div>
      <div class="line">No fight running.</div>
      <div class="meta">Summon Moldy.</div>
    </div>`;

const historyBlocks = history
  .slice()
  .reverse() // newest first
  .map((f) => renderFightLine(f, "Previous Fight"))
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Food Fight</title>
  <style>
    :root { --bg:#fff; --ink:#111; --muted:#666; --line:#eaeaea; }
    body { margin:0; background:var(--bg); color:var(--ink); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    .wrap { max-width: 760px; margin: 0 auto; padding: 36px 18px 54px; }
    h1 { margin: 0 0 18px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .fight { padding: 18px 0; border-top: 1px solid var(--line); }
    .label { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
    .line { margin-top: 10px; font-size: clamp(36px, 6vw, 64px); font-weight: 800; letter-spacing: -0.02em; }
    .meta { margin-top: 8px; color: var(--muted); font-size: 13px; }
    .sectionTitle { margin-top: 24px; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
    footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    a { color: inherit; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Food Fight</h1>

    ${activeBlock}

    <div class="sectionTitle">Previous Fights</div>
    ${historyBlocks || '<div class="meta" style="margin-top:10px;">None yet.</div>'}

    <footer>
      <div>Site: <a href="https://karmolty.github.io/food-fight/" target="_blank" rel="noreferrer">karmolty.github.io/food-fight</a></div>
      <div>Repo: <a href="https://github.com/karmolty/food-fight" target="_blank" rel="noreferrer">karmolty/food-fight</a></div>
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(SITE_DIR, "index.html"), html);
console.log("rendered site/index.html");
