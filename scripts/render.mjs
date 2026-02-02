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

function tally(active) {
  const [a, b] = active.foods;
  const votes = Object.values(active.votes || {});
  const aCount = votes.filter((v) => v === a).length;
  const bCount = votes.filter((v) => v === b).length;
  return { a, b, aCount, bCount, total: votes.length };
}

function winnerLine({ a, b, aCount, bCount }) {
  if (!a || !b) return "";
  if (aCount === bCount) return "It’s a tie. Humanity is doomed.";
  return `${aCount > bCount ? a : b} wins.`;
}

function renderFightCard(fight, { titlePrefix = "" } = {}) {
  const { a, b, aCount, bCount, total } = tally(fight);
  const when = fight.createdAt ? new Date(fight.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) : "";
  const w = winnerLine({ a, b, aCount, bCount });

  return `
  <section class="fight">
    <div class="row">
      <div class="foods">${escapeHtml(a || "?")}&nbsp;vs&nbsp;${escapeHtml(b || "?")}</div>
      <div class="meta">${escapeHtml(titlePrefix)}${escapeHtml(when)}</div>
    </div>
    <div class="row score">
      <div>${escapeHtml(a || "?")} <strong>${aCount}</strong></div>
      <div>${escapeHtml(b || "?")} <strong>${bCount}</strong></div>
      <div class="total">${total} votes</div>
    </div>
    ${w ? `<div class="winner">${escapeHtml(w)}</div>` : ""}
  </section>`;
}

const dataPath = path.join(SITE_DIR, "fights.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const active = data.active;
const history = data.history || [];

const activeCard = active?.id ? renderFightCard(active, { titlePrefix: "Active • " }) : "<p class=\"muted\">No fight running. Summon Moldy.</p>";
const historyCards = history
  .slice()
  .reverse() // newest first when rendering
  .map((f) => renderFightCard(f, { titlePrefix: "Previous • " }))
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Food Fight</title>
  <style>
    :root { --bg:#ffffff; --ink:#111; --muted:#666; --line:#eee; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:var(--bg); color:var(--ink); }
    .wrap { max-width: 720px; margin: 0 auto; padding: 28px 18px 44px; }
    h1 { margin: 0 0 6px; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 0 0 22px; color: var(--muted); }
    .muted { color: var(--muted); }
    .fight { border-top: 1px solid var(--line); padding: 16px 0; }
    .row { display:flex; gap: 12px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
    .foods { font-size: 40px; letter-spacing: 0.02em; }
    .meta { color: var(--muted); font-size: 12px; }
    .score { margin-top: 10px; font-size: 16px; }
    .score strong { font-size: 20px; }
    .total { color: var(--muted); }
    .winner { margin-top: 10px; font-weight: 700; }
    footer { margin-top: 26px; border-top: 1px solid var(--line); padding-top: 14px; color: var(--muted); font-size: 12px; }
    a { color: inherit; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Food Fight</h1>
    <p class="sub">Vote in Discord. The site updates as votes come in.</p>

    <h2 class="muted" style="font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;">Current fight</h2>
    ${activeCard}

    <h2 class="muted" style="font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-top:22px;">History</h2>
    ${historyCards || '<p class="muted">No previous fights yet.</p>'}

    <footer>
      <div>Repo: <a href="https://github.com/karmolty/food-fight" target="_blank" rel="noreferrer">karmolty/food-fight</a></div>
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(SITE_DIR, "index.html"), html);
console.log("rendered site/index.html");
