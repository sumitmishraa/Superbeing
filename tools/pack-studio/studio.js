// Superbeing pack studio. Builds each pack in three.js from the catalogue and renders stills.
// Driven by render.mjs over CDP: await window.studio.render({ slug, view, frame, w, h }) -> dataURL.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const DATA = await (await fetch("./data.json")).json();
const BY_SLUG = Object.fromEntries(DATA.products.map((p) => [p.slug, p]));
for (const wt of [400, 500, 600, 700]) await document.fonts.load(`${wt} 40px Switzer`);

const LOGO_SRC = await (await fetch("/public/brand/superbeing-logo.svg")).text();
const LOGO_RATIO = 360.7 / 975;
const logoCache = new Map();
function logoImage(colour) {
  if (logoCache.has(colour)) return logoCache.get(colour);
  const p = new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(LOGO_SRC.replace('fill="currentColor"', `fill="${colour}"`));
  });
  logoCache.set(colour, p);
  return p;
}

/* ---------------- renderer ---------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const key = new THREE.DirectionalLight(0xffffff, 1.05);
key.position.set(-3, 4, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 0.45);
rim.position.set(4, 2, -3);
scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const camera = new THREE.PerspectiveCamera(20, 0.8, 0.1, 100);

/* ---------------- 2D label drawing ---------------- */
const SLOPE = -0.085; // the logo's rising baseline
function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
const font = (weight, size) => `${weight} ${Math.round(size)}px Switzer`;
function vegMark(ctx, x, y, s, diet) {
  const col = diet === "non-veg" ? "#7A3E1D" : "#1E8A3A";
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = col;
  ctx.lineWidth = s * 0.09;
  ctx.strokeRect(x + s * 0.05, y + s * 0.05, s * 0.9, s * 0.9);
  ctx.fillStyle = col;
  ctx.beginPath();
  if (diet === "non-veg") {
    ctx.moveTo(x + s / 2, y + s * 0.24);
    ctx.lineTo(x + s * 0.76, y + s * 0.72);
    ctx.lineTo(x + s * 0.24, y + s * 0.72);
  } else ctx.arc(x + s / 2, y + s / 2, s * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
const doseCount = (p) => p.doseCount;
const cleanName = (n) => n.replace(/™/g, "");
function needBand(ctx, p, x0, x1, yLeft, th) {
  const dx = x1 - x0;
  const light = p.need.ink === "#FFFFFF";
  ctx.save();
  ctx.fillStyle = light ? "#FFFFFF" : "#131313";
  ctx.beginPath();
  ctx.moveTo(x0, yLeft);
  ctx.lineTo(x1, yLeft + dx * SLOPE);
  ctx.lineTo(x1, yLeft + dx * SLOPE + th);
  ctx.lineTo(x0, yLeft + th);
  ctx.closePath();
  ctx.fill();
  ctx.translate(x0 + th * 0.9, yLeft + th * 0.68);
  ctx.rotate(Math.atan(SLOPE));
  ctx.fillStyle = p.need.colour;
  ctx.font = font(600, th * 0.42);
  ctx.letterSpacing = `${th * 0.05}px`;
  ctx.fillText(p.need.name.toUpperCase(), 0, 0);
  ctx.restore();
}
function crimp(ctx, w, y0, y1) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  for (let x = 0; x < w; x += 7) ctx.fillRect(x, y0, 3, y1 - y0);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let x = 3; x < w; x += 7) ctx.fillRect(x, y0, 2, y1 - y0);
  ctx.restore();
}
function serrate(ctx, w, h, tooth) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  for (let x = 0; x < w; x += tooth) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + tooth / 2, tooth * 0.55);
    ctx.lineTo(x + tooth, 0);
    ctx.moveTo(x, h);
    ctx.lineTo(x + tooth / 2, h - tooth * 0.55);
    ctx.lineTo(x + tooth, h);
  }
  ctx.fill();
  ctx.restore();
}

/** Front of a sachet, stick or carton face. p = null draws an unbranded pack. */
async function drawFront(p, w, h, o = {}) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  const ink = p ? p.need.ink : "#131313";
  ctx.fillStyle = p ? p.need.colour : "#EDEDEA";
  ctx.fillRect(0, 0, w, h);
  const sealT = (o.sealTop || 0) * h;
  const sealS = (o.sealSide || 0) * w;
  if (sealT) {
    crimp(ctx, w, 0, sealT);
    crimp(ctx, w, h - sealT, h);
  }
  if (!p) {
    if (sealT) serrate(ctx, w, h, w / 46);
    return c;
  }
  const narrow = o.narrow;
  const squat = h / w < 1.25;
  const m = sealS + w * 0.075;
  const inner = w - 2 * m;
  let y = sealT + h * 0.045;

  const logo = await logoImage(ink);
  const lw = inner * (narrow ? 1 : squat ? 0.62 : 0.78);
  ctx.drawImage(logo, m, y, lw, lw * LOGO_RATIO);
  y += lw * LOGO_RATIO + h * 0.03;

  const th = h * (narrow ? 0.03 : squat ? 0.05 : 0.055);
  needBand(ctx, p, 0, w, y + w * 0.06, th);
  y += th + w * 0.09 + h * 0.03;

  ctx.fillStyle = ink;
  let size = w * (narrow ? 0.15 : squat ? 0.085 : 0.108);
  ctx.font = font(700, size);
  ctx.letterSpacing = `${-size * 0.02}px`;
  let lines = wrap(ctx, cleanName(p.name).toUpperCase(), inner);
  while (lines.length > (narrow ? 5 : 3) && size > w * 0.06) {
    size *= 0.9;
    ctx.font = font(700, size);
    lines = wrap(ctx, cleanName(p.name).toUpperCase(), inner);
  }
  for (const l of lines) {
    y += size * 0.95;
    ctx.fillText(l, m, y);
  }
  y += size * 0.55;
  ctx.letterSpacing = "0px";
  ctx.font = font(500, w * (narrow ? 0.062 : 0.036));
  for (const l of wrap(ctx, `${doseCount(p)} actives. Every dose on the back.`, inner)) {
    y += w * (narrow ? 0.075 : 0.046);
    ctx.fillText(l, m, y);
  }
  if (p.frontOfPackNote) {
    ctx.font = font(600, w * (narrow ? 0.05 : 0.03));
    for (const l of wrap(ctx, p.frontOfPackNote + ".", inner)) {
      y += w * (narrow ? 0.062 : 0.04);
      ctx.fillText(l, m, y);
    }
  }

  const fy = h - sealT - h * 0.04;
  const vs = w * (narrow ? 0.12 : 0.065);
  vegMark(ctx, m, fy - vs, vs, p.diet);
  ctx.font = font(600, w * (narrow ? 0.058 : 0.034));
  ctx.textAlign = "right";
  ctx.fillText(o.foot || p.packCount.toUpperCase(), w - m, fy - vs * 0.22);
  ctx.textAlign = "left";
  if (sealT) serrate(ctx, w, h, w / 46);
  return c;
}

/** Back of pack: every dose, in a white panel. */
async function drawBack(p, w, h, o = {}) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = p.need.colour;
  ctx.fillRect(0, 0, w, h);
  const sealT = (o.sealTop || 0) * h;
  if (sealT) {
    crimp(ctx, w, 0, sealT);
    crimp(ctx, w, h - sealT, h);
  }
  const m = (o.sealSide || 0) * w + w * 0.06;
  const top = sealT + h * 0.035;
  const bottom = h - sealT - h * 0.035;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(m, top, w - 2 * m, bottom - top);
  const px = m + w * 0.045;
  const pw = w - 2 * m - w * 0.09;
  const rows = p.formula.reduce((n, g) => n + g.items.length + 1, 0) + 9;
  const fs = Math.min(w * 0.034, ((bottom - top) * 0.85) / (rows * 1.32));
  let y = top + fs * 2.4;
  ctx.fillStyle = "#131313";
  ctx.font = font(700, fs * 1.7);
  ctx.fillText("EVERY DOSE", px, y);
  ctx.font = font(500, fs * 0.9);
  y += fs * 1.0;
  for (const l of wrap(ctx, `Per serve: ${p.serve}`, pw)) ctx.fillText(l, px, (y += fs * 1.2));
  y += fs * 0.5;
  ctx.fillRect(px, y, pw, fs * 0.22);
  y += fs * 0.4;
  for (const g of p.formula) {
    ctx.font = font(700, fs * 0.82);
    ctx.fillText(g.group.toUpperCase(), px, (y += fs * 1.35));
    for (const it of g.items) {
      ctx.font = font(400, fs);
      let name = it.name;
      while (ctx.measureText(name).width > pw * 0.7 && name.length > 6) name = name.slice(0, -2);
      if (name !== it.name) name = name.trimEnd() + "…";
      y += fs * 1.3;
      ctx.fillText(name, px, y);
      ctx.font = font(600, fs);
      ctx.textAlign = "right";
      ctx.fillText(it.dose, px + pw, y);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(19,19,19,.14)";
      ctx.fillRect(px, y + fs * 0.38, pw, Math.max(1, fs * 0.05));
      ctx.fillStyle = "#131313";
    }
  }
  y += fs * 1.2;
  ctx.fillRect(px, y, pw, fs * 0.22);
  ctx.font = font(500, fs * 0.82);
  const foot = [p.allergens.length ? `Allergens: ${p.allergens.join(", ")}.` : "", "Not for medicinal use. Keep out of reach of children."].filter(Boolean);
  for (const f of foot) for (const l of wrap(ctx, f, pw)) ctx.fillText(l, px, (y += fs * 1.2));
  ctx.font = font(700, fs * 0.9);
  ctx.textAlign = "right";
  ctx.fillText(p.code, px + pw, bottom - fs * 0.9);
  ctx.textAlign = "left";
  const logo = await logoImage("#131313");
  ctx.drawImage(logo, px, bottom - fs * 0.9 - fs * 2.2, fs * 6, fs * 6 * LOGO_RATIO);
  if (sealT) serrate(ctx, w, h, w / 46);
  return c;
}

/** Carton side panel: name runs bottom to top. */
async function drawSide(p, w, h) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = p ? p.need.shade : "#E2E2DE";
  ctx.fillRect(0, 0, w, h);
  if (!p) return c;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.93);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = p.need.ink;
  let s = w * 0.2;
  ctx.font = font(700, s);
  while (ctx.measureText(cleanName(p.name).toUpperCase()).width > h * 0.86) ctx.font = font(700, (s *= 0.92));
  ctx.fillText(cleanName(p.name).toUpperCase(), 0, 0);
  ctx.font = font(500, w * 0.11);
  ctx.fillText(p.packCount.toUpperCase() + "  ·  " + p.code, 0, w * 0.2);
  ctx.restore();
  return c;
}

/** Bottle/tub label wrap: the front sits at u=0.5, the dose table round the back. */
async function drawWrap(p, w, h, frac = 0.3) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = p ? p.need.colour : "#EDEDEA";
  ctx.fillRect(0, 0, w, h);
  if (!p) return c;
  const fw = Math.round(w * frac);
  ctx.drawImage(await drawFront(p, fw, h, { foot: p.packCount.toUpperCase() }), w * 0.5 - fw / 2, 0);
  const bw = Math.round(w * frac);
  const back = await drawBack(p, bw, h);
  ctx.drawImage(back, -bw / 2, 0);
  ctx.drawImage(back, w - bw / 2, 0);
  return c;
}

function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------------- geometry ---------------- */
function pillowGeometry(w, h, puff, sealTop, sealSide, pinch = 0.025) {
  const g = new THREE.PlaneGeometry(w, h, 180, 220);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / w + 0.5;
    const v = y / h + 0.5;
    const su = (u - sealSide) / (1 - 2 * sealSide);
    const sv = (v - sealTop) / (1 - 2 * sealTop);
    let z = 0.0015;
    if (su > 0 && su < 1 && sv > 0 && sv < 1) {
      const a = Math.pow(Math.sin(Math.PI * su), 0.55);
      const b = Math.pow(Math.sin(Math.PI * sv), 0.35);
      const wob = 1 + 0.035 * Math.sin(u * 23 + v * 7) * Math.sin(v * 17);
      z += puff * a * b * wob;
    } else if (sv <= 0 || sv >= 1) {
      z += 0.0035 * (Math.sin(u * Math.PI * 2 * 70) > 0 ? 1 : 0);
    }
    const bulge = Math.sin(Math.PI * Math.min(Math.max(v, 0), 1));
    pos.setX(i, x * (1 - pinch * bulge * (Math.abs(x) / (w / 2))));
    pos.setZ(i, z);
  }
  g.computeVertexNormals();
  return g;
}

const paper = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.62, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.5 });
const laminate = (map) =>
  new THREE.MeshPhysicalMaterial({ map, roughness: 0.38, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.28, alphaTest: 0.5 });

const SACHET = {
  carton: { w: 0.78, h: 1.0, puff: 0.075, sealTop: 0.075, sealSide: 0.05 },
  stick: { w: 0.36, h: 1.25, puff: 0.05, sealTop: 0.07, sealSide: 0.08 },
  melt: { w: 0.72, h: 0.8, puff: 0.04, sealTop: 0.08, sealSide: 0.07 },
};

async function buildSachet(p, kind) {
  const s = SACHET[kind];
  const tw = 1024;
  const th = Math.round((tw * s.h) / s.w);
  const opts = { sealTop: s.sealTop, sealSide: s.sealSide, narrow: kind === "stick", foot: kind === "stick" ? "1 STICK" : "1 SACHET" };
  const frontC = await drawFront(p, tw, th, opts);
  const backC = p ? await drawBack(p, tw, th, opts) : await drawFront(null, tw, th, opts);
  const geo = pillowGeometry(s.w, s.h, s.puff, s.sealTop, s.sealSide, kind === "stick" ? 0.04 : 0.025);
  const grp = new THREE.Group();
  const b = new THREE.Mesh(geo, laminate(tex(backC)));
  b.rotation.y = Math.PI;
  grp.add(new THREE.Mesh(geo, laminate(tex(frontC))), b);
  return grp;
}

async function buildCarton(p) {
  const W = 0.92,
    H = 1.2,
    D = 0.42;
  const fh = Math.round((1024 * H) / W);
  const front = await drawFront(p, 1024, fh, { foot: p ? p.packCount.toUpperCase() : "" });
  const back = p ? await drawBack(p, 1024, fh) : front;
  const side = await drawSide(p, 360, Math.round((360 * H) / D));
  const top = canvas(512, 256);
  const tctx = top.getContext("2d");
  tctx.fillStyle = p ? p.need.colour : "#EDEDEA";
  tctx.fillRect(0, 0, 512, 256);
  if (p) tctx.drawImage(await logoImage(p.need.ink), 40, 60, 300, 300 * LOGO_RATIO);
  const mats = [paper(tex(side)), paper(tex(side)), paper(tex(top)), paper(tex(top)), paper(tex(front)), paper(tex(back))];
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats));
  return grp;
}

function ribbedCap(r, h, colour) {
  const g = new THREE.CylinderGeometry(r, r, h, 240, 1, false);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    if (Math.hypot(x, z) > r * 0.98) {
      const k = 1 + 0.012 * (Math.sin(Math.atan2(z, x) * 90) > 0 ? 1 : 0);
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4 }));
}

async function buildJar(p, kind) {
  const tall = kind === "bottle";
  const R = tall ? 0.42 : 0.5;
  const H = tall ? 1.02 : 0.8;
  const V = (a, b) => new THREE.Vector2(a, b);
  const pts = [V(0, 0), V(R * 0.94, 0), V(R, R * 0.06), V(R, H)];
  if (tall) pts.push(V(R * 0.96, H + 0.05), V(R * 0.72, H + 0.12), V(R * 0.62, H + 0.15), V(R * 0.62, H + 0.2));
  else pts.push(V(R * 0.97, H + 0.03), V(R * 0.97, H + 0.06));
  const plastic = new THREE.MeshPhysicalMaterial({ color: p ? p.need.colour : "#EDEDEA", roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 160), plastic));
  const lh = H * (tall ? 0.84 : 0.8);
  const tw = 3072;
  const thh = Math.round((tw * lh) / (2 * Math.PI * R));
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.004, R * 1.004, lh, 200, 1, true, -Math.PI, Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ map: tex(await drawWrap(p, tw, thh, tall ? 0.3 : 0.22)), roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
  );
  sleeve.position.y = H * (tall ? 0.48 : 0.47);
  grp.add(sleeve);
  const capH = tall ? 0.24 : 0.2;
  const cap = ribbedCap(tall ? R * 0.68 : R * 1.02, capH, "#131313");
  cap.position.y = (tall ? H + 0.15 : H + 0.02) + capH / 2;
  grp.add(cap);
  return grp;
}


/* ---------------- ingredient materials ---------------- */
function noise3(x, y, z) {
  return Math.sin(x * 12.9 + y * 4.1) * Math.cos(z * 7.3 + x * 3.7) * 0.5 + Math.sin(x * 31.4 + z * 17.7 + y * 9.2) * 0.25;
}
function heap(colour) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const r = (i / 40) * 1.0;
    pts.push(new THREE.Vector2(r, 0.55 * Math.exp(-Math.pow(r / 0.55, 2)) + 0.0));
  }
  pts.reverse();
  const g = new THREE.LatheGeometry(pts, 200);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    pos.setY(i, Math.max(0, y + 0.03 * noise3(x * 3, y * 3, z * 3) * (y > 0.01 ? 1 : 0)));
  }
  g.computeVertexNormals();
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: colour, roughness: 1 })));
  // loose grains
  const grain = new THREE.SphereGeometry(0.012, 6, 4);
  const gm = new THREE.MeshStandardMaterial({ color: colour, roughness: 1 });
  for (let i = 0; i < 140; i++) {
    const a = Math.random() * Math.PI * 2, r = 0.75 + Math.random() * 0.35;
    const m = new THREE.Mesh(grain, gm);
    m.position.set(Math.cos(a) * r, 0.008, Math.sin(a) * r);
    grp.add(m);
  }
  return grp;
}
function softgels(colour, n = 3) {
  const grp = new THREE.Group();
  const g = new THREE.SphereGeometry(0.3, 64, 48);
  const mat = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.08, transmission: 0.55, thickness: 0.4, ior: 1.45, clearcoat: 1, attenuationColor: new THREE.Color(colour), attenuationDistance: 0.4 });
  const spots = [[-0.32, 0.18, 0, 0.4], [0.3, 0.18, 0.05, -0.5], [0, 0.18, 0.42, 1.4]];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(g, mat);
    m.scale.set(1.7, 0.62, 0.95);
    m.position.set(spots[i][0], spots[i][1], spots[i][2]);
    m.rotation.y = spots[i][3];
    grp.add(m);
  }
  return grp;
}
function tablets(colour) {
  const grp = new THREE.Group();
  const g = new THREE.CapsuleGeometry(0.16, 0.42, 12, 48);
  const mat = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const spots = [[-0.3, 0.1, 0, 1.2], [0.28, 0.1, 0.1, 0.6], [0.02, 0.1, 0.42, 1.9]];
  for (const s of spots) {
    const m = new THREE.Mesh(g, mat);
    m.scale.set(1, 1, 0.55);
    m.rotation.set(Math.PI / 2, 0, s[3]);
    m.position.set(s[0], s[1], s[2]);
    grp.add(m);
  }
  return grp;
}
function crystals(colour) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.25, transmission: 0.35, thickness: 0.3, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const g = new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.14, 0);
    const m = new THREE.Mesh(g, mat);
    const a = i * 2.4, r = 0.12 + (i % 4) * 0.13;
    m.position.set(Math.cos(a) * r, 0.1 + (i % 3) * 0.06, Math.sin(a) * r);
    m.rotation.set(i, i * 2, i * 3);
    grp.add(m);
  }
  return grp;
}
function resin(colour) {
  const g = new THREE.IcosahedronGeometry(0.45, 5);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const k = 1 + 0.22 * noise3(v.x * 2, v.y * 2, v.z * 2);
    v.multiplyScalar(k);
    v.y *= 0.6;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }));
  m.position.y = 0.25;
  const grp = new THREE.Group();
  grp.add(m);
  return grp;
}
const MATERIALS = {
  "powder-white": () => heap("#f1eee6"),
  "powder-cream": () => heap("#e7d9b8"),
  "powder-beige": () => heap("#cdb48a"),
  "powder-pink": () => heap("#e9c3c2"),
  "powder-red": () => heap("#b5302a"),
  "powder-rust": () => heap("#8a4b2c"),
  "powder-green": () => heap("#a9b47a"),
  "softgel-amber": () => softgels("#d99a1c"),
  "softgel-red": () => softgels("#a3201a"),
  "tablet-white": () => tablets("#f2f0ea"),
  "salt-pink": () => crystals("#eab0a6"),
  "resin-dark": () => resin("#2a1a12"),
};
async function renderMaterial({ kind, w = 600, h = 600 }) {
  for (const c of [...scene.children]) if (c.userData.pack) scene.remove(c);
  scene.background = null;
  renderer.setSize(w, h, false);
  const root = new THREE.Group();
  root.userData.pack = true;
  root.add(MATERIALS[kind]());
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  const s = box.getSize(new THREE.Vector3());
  camera.fov = 24;
  camera.aspect = w / h;
  const d = Math.max(s.x, s.z) / 0.8 / 2 / Math.tan(THREE.MathUtils.degToRad(12));
  camera.position.set(c.x, c.y + d * 0.55, c.z + d * 0.85);
  camera.lookAt(c);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/webp", 0.86);
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  return url;
}

/* ---------------- scenes ---------------- */
function frame(obj, aspect, fill = 0.86, fov = 20) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  camera.fov = fov;
  camera.aspect = aspect;
  const vfov = THREE.MathUtils.degToRad(fov);
  const hNeed = Math.max(size.y, size.x / aspect) / fill;
  const dist = hNeed / 2 / Math.tan(vfov / 2) + size.z / 2;
  camera.position.set(centre.x, centre.y + size.y * 0.04, centre.z + dist);
  camera.lookAt(centre);
  camera.updateProjectionMatrix();
}

async function heroObject(p, shape) {
  if (shape === "carton" || shape === "stick" || shape === "melt") return buildSachet(p, shape);
  return buildJar(p, shape);
}

async function render({ slug, blank, view = "front", frame: fi = 0, frames = 36, w = 1000, h = 1250 }) {
  for (const c of [...scene.children]) if (c.userData.pack) scene.remove(c);
  scene.background = null;
  const p = blank ? null : BY_SLUG[slug];
  const shape = blank || p.shape;
  renderer.setSize(w, h, false);
  const root = new THREE.Group();
  root.userData.pack = true;
  scene.add(root);
  let fill = 0.86;

  if (view === "plinth" || view === "plinth-back") {
    // Product shot on a white cube, as on the reference's cards.
    const back = view === "plinth-back";
    if (!back && shape === "carton" && p) {
      const carton = await buildCarton(p);
      carton.rotation.y = -0.45;
      carton.position.set(-0.22, 0.6, -0.12);
      const s = await buildSachet(p, "carton");
      s.rotation.set(-0.08, -0.15, 0.06);
      s.position.set(0.4, 0.5, 0.38);
      root.add(carton, s);
    } else if (!back && (shape === "stick" || shape === "melt") && p) {
      for (let i = 0; i < 3; i++) {
        const s = await buildSachet(p, shape);
        s.rotation.set(0, -0.3 + i * 0.2, (i - 1) * 0.12);
        s.position.set((i - 1) * (shape === "stick" ? 0.3 : 0.42), 0, (i === 1 ? 0.12 : 0) - i * 0.02);
        root.add(s);
      }
    } else {
      const obj = await heroObject(p, shape);
      if (shape === "bottle" || shape === "tub") obj.position.y = -0.5;
      obj.rotation.y = back ? Math.PI - 0.25 : -0.3;
      root.add(obj);
    }
    root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root);
    const size = bb.getSize(new THREE.Vector3());
    const centre = bb.getCenter(new THREE.Vector3());
    scene.background = new THREE.Color("#ffffff");
    const plinthH = size.y * 0.55;
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(size.x * 2.6 + 1.2, plinthH, size.z * 2 + 1.0),
      new THREE.MeshStandardMaterial({ color: "#f2f2f2", roughness: 0.92 }),
    );
    plinth.position.set(centre.x, bb.min.y - plinthH / 2 - 0.002, centre.z - 0.15);
    root.add(plinth);
    const sh = canvas(256, 256);
    const sctx = sh.getContext("2d");
    const grd = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, "rgba(0,0,0,0.28)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = grd;
    sctx.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(size.x * 1.4, size.z * 1.4 + 0.5),
      new THREE.MeshBasicMaterial({ map: tex(sh), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(centre.x, bb.min.y + 0.001, centre.z);
    root.add(shadow);
    camera.fov = 22;
    camera.aspect = w / h;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const needH = Math.max(size.y, size.x / camera.aspect) / 0.56;
    const dist = needH / 2 / Math.tan(vfov / 2) + size.z / 2;
    camera.position.set(centre.x, centre.y + size.y * 0.32, centre.z + dist);
    camera.lookAt(centre.x, centre.y - size.y * 0.16, centre.z);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    const purl = renderer.domElement.toDataURL("image/webp", 0.86);
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) for (const m of [].concat(o.material)) (m.map && m.map.dispose(), m.dispose());
    });
    return purl;
  }

  if (view === "duo" && shape === "carton") {
    const carton = await buildCarton(p);
    carton.rotation.y = -0.5;
    carton.position.set(-0.26, 0.6, -0.1);
    const s = await buildSachet(p, "carton");
    s.rotation.set(-0.06, -0.18, 0.09);
    s.position.set(0.38, 0.48, 0.42);
    root.add(carton, s);
    fill = 0.8;
  } else if (view === "duo" && (shape === "stick" || shape === "melt")) {
    for (let i = 0; i < 3; i++) {
      const s = await buildSachet(p, shape);
      s.rotation.set(0, -0.35 + i * 0.22, (i - 1) * 0.16);
      s.position.set((i - 1) * (shape === "stick" ? 0.3 : 0.42), 0, (i === 1 ? 0.12 : 0) - i * 0.02);
      root.add(s);
    }
    fill = 0.8;
  } else {
    const obj = await heroObject(p, shape);
    root.add(obj);
    if (shape === "bottle" || shape === "tub") obj.position.y = -0.5;
    if (view === "turn") {
      obj.rotation.y = -0.35;
      frame(root, w / h, 0.8);
      obj.rotation.y = (fi / frames) * Math.PI * 2 - 0.35;
    } else if (view === "back") obj.rotation.y = Math.PI - 0.22;
    else if (view === "macro") {
      obj.rotation.set(0.18, shape === "bottle" || shape === "tub" ? -0.05 : -0.62, 0.42);
      scene.background = new THREE.Color(p.need.shade);
    } else obj.rotation.y = shape === "bottle" || shape === "tub" ? -0.25 : -0.3;
  }

  if (view === "macro") {
    frame(root, w / h, 1.9, 18);
    camera.position.x += 0.12;
    camera.position.y += 0.2;
  } else if (view !== "turn") frame(root, w / h, fill);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/webp", view === "turn" ? 0.74 : 0.86);
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) for (const m of [].concat(o.material)) (m.map && m.map.dispose(), m.dispose());
  });
  return url;
}

/** Stage: one or more packs on podiums against a flat colour backdrop, framed with headline space. */
async function renderStage({ slugs, bg = "#ffffff", podium = "#f2f2f2", w = 1600, h = 900, align = "right", spread = 1 }) {
  for (const c of [...scene.children]) if (c.userData.pack) scene.remove(c);
  renderer.setSize(w, h, false);
  scene.background = new THREE.Color(bg);
  const root = new THREE.Group();
  root.userData.pack = true;
  scene.add(root);
  const heights = [0.55, 0.85, 0.4, 0.7, 0.5];
  let x = 0;
  for (let i = 0; i < slugs.length; i++) {
    const p = BY_SLUG[slugs[i]];
    const item = new THREE.Group();
    if (p.shape === "carton") {
      const carton = await buildCarton(p);
      carton.rotation.y = -0.4;
      carton.position.set(-0.18, 0.6, -0.1);
      const s = await buildSachet(p, "carton");
      s.rotation.set(-0.06, -0.15, 0.06);
      s.position.set(0.38, 0.5, 0.36);
      item.add(carton, s);
    } else if (p.shape === "stick" || p.shape === "melt") {
      for (let k = 0; k < 3; k++) {
        const s = await buildSachet(p, p.shape);
        s.rotation.set(0, -0.3 + k * 0.2, (k - 1) * 0.12);
        s.position.set((k - 1) * (p.shape === "stick" ? 0.3 : 0.42), 0.62, (k === 1 ? 0.12 : 0) - k * 0.02);
        item.add(s);
      }
    } else {
      const obj = await heroObject(p, p.shape);
      obj.rotation.y = -0.3;
      item.add(obj);
    }
    item.updateMatrixWorld(true);
    const ib = new THREE.Box3().setFromObject(item);
    const isz = ib.getSize(new THREE.Vector3());
    const ph = slugs.length > 1 ? heights[i % heights.length] : 0.5;
    const r = Math.max(isz.x, isz.z) * 0.62 + 0.12;
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(r, r, ph, 96), new THREE.MeshStandardMaterial({ color: podium, roughness: 0.85 }));
    item.position.y = ph - ib.min.y;
    pod.position.y = ph / 2;
    const holder = new THREE.Group();
    holder.add(pod, item);
    holder.position.x = x + r;
    x += 2 * r + 0.18 * spread;
    root.add(holder);
  }
  // floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: bg, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);
  const bb = new THREE.Box3();
  root.children.filter((c) => c !== floor).forEach((c) => bb.expandByObject(c));
  const size = bb.getSize(new THREE.Vector3());
  const centre = bb.getCenter(new THREE.Vector3());
  camera.fov = 24;
  camera.aspect = w / h;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const share = align === "center" ? 0.8 : slugs.length > 2 ? 0.66 : 0.46;
  const needH = Math.max(size.y / 0.72, size.x / camera.aspect / share);
  const dist = needH / 2 / Math.tan(vfov / 2) + size.z / 2;
  const viewW = needH * camera.aspect;
  const shift = align === "right" ? -viewW * 0.22 : align === "left" ? viewW * 0.22 : 0;
  camera.position.set(centre.x + shift, centre.y + size.y * 0.35, centre.z + dist);
  camera.lookAt(centre.x + shift, centre.y - size.y * 0.05, centre.z);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/webp", 0.88);
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) for (const m of [].concat(o.material)) (m.map && m.map.dispose(), m.dispose());
  });
  return url;
}

window.studio = { render, renderStage, renderMaterial, materials: Object.keys(MATERIALS), products: DATA.products.map((p) => p.slug) };
window.studioReady = true;
