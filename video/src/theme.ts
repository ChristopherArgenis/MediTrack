import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fuentes locales (public/fonts, de @fontsource, licencia OFL): el render no depende de internet.
export const FONT = "Manrope, system-ui, sans-serif";
export const MONO = "'JetBrains Mono', monospace";
export const fuentes = Promise.all([
  ...[500, 600, 700, 800].map((w) => loadFont({ family: "Manrope", url: staticFile(`fonts/manrope-latin-${w}-normal.woff2`), weight: String(w) })),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" }),
]);

// Mismos tokens que el sitio (assets/tema.css).
export const C = {
  page: "#edf2f5",
  bg: "#f5f8fa",
  card: "#ffffff",
  fg: "#0f2230",
  mu: "#5b6b78",
  line: "#dde6ec",
  ac: "#0d8a84",
  acDk: "#06615d",
  acSoft: "#ddf2f0",
  ok: "#1f9d55",
  okSoft: "#e1f5e9",
  late: "#d98a12",
  lateSoft: "#fdf1dc",
  miss: "#d9463b",
  missSoft: "#fde6e4",
  ges: "#6b4fe0",
  gesSoft: "#ece7fd",
  blue: "#2f6fd6",
  blueSoft: "#e5eefb",
  dark: "#0f2230",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
