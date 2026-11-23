// Renderiza fotogramas sueltos para revisar (un solo bundle).
//   node scripts/fotogramas.mjs <composición> <carpeta> <f1> <f2> ...
//   node scripts/fotogramas.mjs MediTrack-Medicos-ES /tmp/rev auto   → inicio, mitad y momentos clave de cada escena
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [comp, out, ...rest] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const lang = comp.endsWith("EN") ? "en" : "es";
let frames = rest.map(Number);
if (rest[0] === "auto") {
  const t = JSON.parse(fs.readFileSync(path.join(root, "src/tiempos.json")))[lang];
  frames = [];
  for (const e of t.escenas) {
    frames.push(e.from + 2, e.from + Math.round(e.dur / 2));
    for (const fr of e.frases) frames.push(fr.from + Math.round(fr.dur * 0.6));
  }
  frames = [...new Set(frames)].sort((a, b) => a - b);
}
fs.mkdirSync(out, { recursive: true });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions: { gl: "swangle" } });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: path.join(out, `f${String(frame).padStart(5, "0")}.jpeg`), imageFormat: "jpeg", browserExecutable, chromiumOptions: { gl: "swangle" } });
  process.stdout.write(`${frame} `);
}
console.log("\nok", frames.length);
