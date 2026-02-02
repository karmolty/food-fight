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
  return { a, b, aCount, bCount };
}

function comparisonLine({ a, b, aCount, bCount }) {
  if (!a || !b) return "";
  if (aCount === bCount) return `${a} ${aCount} = ${b} ${bCount}`;
  if (aCount > bCount) return `${a} ${aCount} > ${b} ${bCount}`;
  return `${b} ${bCount} > ${a} ${aCount}`;
}

function renderFight(fight) {
  const t = tally(fight);
  const line = comparisonLine(t);
  return `
    <div class="fight">
      <div class="line">${escapeHtml(line || "No fight")}</div>
    </div>`;
}

const dataPath = path.join(SITE_DIR, "fights.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const active = data.active;
const history = (data.history || []).slice().reverse(); // newest first

const activeBlock = active?.id ? renderFight(active) : '<div class="fight"><div class="line">No fight</div></div>';
const historyBlock = history.length
  ? history.map(renderFight).join("\n")
  : "";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Food Fight</title>
  <style>
    :root { --bg:#fff; --ink:#111; --muted:#888; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    }
    .wrap {
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 22px;
      padding: 28px 18px;
      text-align: center;
    }
    .line {
      font-weight: 900;
      letter-spacing: -0.03em;
      font-size: clamp(44px, 8vw, 88px);
    }
    .history {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: var(--muted);
      font-size: clamp(16px, 2.3vw, 22px);
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="wrap">
    ${activeBlock}
    <div class="history">${historyBlock}</div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(SITE_DIR, "index.html"), html);
console.log("rendered site/index.html");
