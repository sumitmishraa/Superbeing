// Renders every Superbeing pack to public/packs/ with headless Chrome + the three.js studio.
// Usage: node tools/pack-studio/render.mjs [--only slug,slug] [--views front,duo,back,macro,turn] [--out dir]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const ONLY = arg("only", "").split(",").filter(Boolean);
const VIEWS = arg("views", "front,duo,back,macro,turn").split(",");
const OUT = path.resolve(arg("out", path.join(ROOT, "public/packs")));
const FRAMES = 36;

const { PRODUCTS, NEED_BY_ID, doseCount } = await import(pathToFileURL(path.join(ROOT, "src/data/products.ts")).href);
const live = PRODUCTS.filter((p) => p.status === "live");
fs.writeFileSync(path.join(ROOT, "tools/pack-studio/data.json"), JSON.stringify({ products: live.map((p) => ({ ...p, need: NEED_BY_ID[p.need], doseCount: doseCount(p) })) }));

/* static server over the project root */
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

/* chrome over CDP */
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((c) => fs.existsSync(c));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pack-studio-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars", "about:blank"], {
  stdio: ["ignore", "ignore", "pipe"],
});
const wsUrl = await new Promise((res, rej) => {
  let buf = "";
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) res(m[1]);
  });
  setTimeout(() => rej(new Error("chrome did not start")), 20000);
});
const httpBase = wsUrl.replace(/^ws:\/\/([^/]+).*/, "http://$1");
const target = await (await fetch(`${httpBase}/json/new?http://127.0.0.1:${port}/tools/pack-studio/studio.html`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++seq;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800));
  return r.result?.result?.value;
};
await send("Runtime.enable");
for (let i = 0; i < 150; i++) {
  if (await evaluate("!!window.studioReady")) break;
  await new Promise((r) => setTimeout(r, 200));
  if (i === 149) throw new Error("studio not ready");
}

const save = (file, dataUrl) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
};
const r = (spec) => evaluate(`window.studio.render(${JSON.stringify(spec)})`);

const SIZES = { front: [1000, 1250], duo: [1200, 1200], back: [1000, 1250], macro: [1600, 1200], turn: [720, 900] };
let n = 0;
try {
  for (const p of live) {
    if (ONLY.length && !ONLY.includes(p.slug)) continue;
    for (const v of VIEWS) {
      if (v === "duo" && !["carton", "stick", "melt"].includes(p.shape)) continue;
      const [w, h] = SIZES[v];
      if (v === "turn") {
        for (let f = 0; f < FRAMES; f++)
          save(path.join(OUT, p.slug, "turn", `${String(f).padStart(2, "0")}.webp`), await r({ slug: p.slug, view: "turn", frame: f, frames: FRAMES, w, h }));
        n += FRAMES;
      } else {
        save(path.join(OUT, p.slug, `${v}.webp`), await r({ slug: p.slug, view: v, w, h }));
        n++;
      }
    }
    console.log("rendered", p.slug);
  }
  if (ONLY.includes("materials") || (!ONLY.length && VIEWS.includes("materials"))) {
    for (const k of await evaluate("window.studio.materials")) {
      save(path.join(ROOT, "public/ingredients", `${k}.webp`), await evaluate(`window.studio.renderMaterial({ kind: ${JSON.stringify(k)} })`));
      n++;
    }
    console.log("rendered materials");
  }
  if (!ONLY.length || ONLY.includes("blank")) {
    for (const s of ["carton", "stick", "melt", "bottle"]) {
      save(path.join(OUT, "_blank", `${s}.webp`), await r({ blank: s, view: "front", w: 1000, h: 1250 }));
      n++;
    }
    console.log("rendered blanks");
  }
  console.log(`${n} images -> ${OUT}`);
} finally {
  ws.close();
  chrome.kill();
  server.close();
  setTimeout(() => {
    try {
      fs.rmSync(profile, { recursive: true, force: true });
    } catch {}
    process.exit(0);
  }, 800);
}
