import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, MONO } from "../theme";

export type Frase = { id: string; from: number; dur: number };
export type UI = Record<string, any>; // textos en pantalla del guion (es/en)
export type PropsEscena = { ui: UI; frases: Frase[]; dur: number; lang: "es" | "en" };

/** Entrada suave: opacidad + desplazamiento, puramente según el fotograma. */
export const useEntrada = (at: number, dist = 24) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 200 }, durationInFrames: 18 });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` } as React.CSSProperties;
};

export const fundido = (f: number, dur: number, entrada = 10, salida = 10) =>
  interpolate(f, [0, entrada, dur - salida, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const suave = (f: number, a: number, b: number, v0 = 0, v1 = 1) =>
  interpolate(f, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

export const Tarjeta: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.card, borderRadius: 28, boxShadow: "0 2px 4px rgba(15,34,48,.06), 0 24px 50px -28px rgba(15,34,48,.45)", padding: "30px 34px", ...style }}>{children}</div>
);

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.ac }) => (
  <div style={{ font: `800 24px ${FONT}`, letterSpacing: ".14em", textTransform: "uppercase", color }}>{children}</div>
);

export const Chip: React.FC<{ children: React.ReactNode; bg: string; color: string; style?: React.CSSProperties }> = ({ children, bg, color, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: `800 22px ${FONT}`, padding: "7px 16px", borderRadius: 999, background: bg, color, ...style }}>{children}</span>
);

/** Logo de MediTrack (mismo dibujo que assets/logo.svg). */
export const Logo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width="32" height="32" rx="9" fill="#0d8a84" />
    <rect x="9" y="5" width="14" height="22" rx="7" fill="#fff" transform="rotate(35 16 16)" />
    <path d="M9 16H23" stroke="#0d8a84" strokeWidth="2.2" transform="rotate(35 16 16)" />
    <circle cx="23.5" cy="23.5" r="5" fill="#ffffff" />
    <path d="m21.3 23.6 1.6 1.6 3-3.2" fill="none" stroke="#1f9d55" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Pantalla del reloj (misma información en la textura 3D y en el recuadro HTML) ----------
export type EstadoReloj = { modo: "hora" | "aviso" | "evidencias" | "confirmada"; hora: string; med: string; dosis: string; titulo: string; ok: string; p?: number };

export const dibujarReloj = (ctx: CanvasRenderingContext2D, e: EstadoReloj, pulso: number) => {
  const S = ctx.canvas.width;
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, S, S);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const cx = S / 2;
  if (e.modo === "hora") {
    ctx.fillStyle = "#fff"; ctx.font = `700 ${S * 0.26}px ${MONO}`; ctx.fillText(e.hora, cx, S * 0.5);
    return;
  }
  if (e.modo === "confirmada") {
    ctx.fillStyle = "#1f9d55"; ctx.beginPath(); ctx.arc(cx, S * 0.4, S * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = S * 0.04; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(cx - S * 0.08, S * 0.4); ctx.lineTo(cx - S * 0.02, S * 0.46); ctx.lineTo(cx + S * 0.09, S * 0.34); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `800 ${S * 0.11}px ${FONT}`; ctx.fillText(e.ok, cx, S * 0.68);
    ctx.fillStyle = "#9fe3c3"; ctx.font = `700 ${S * 0.075}px ${MONO}`; ctx.fillText(`P = ${(e.p ?? 0.93).toFixed(2)}`, cx, S * 0.8);
    return;
  }
  ctx.fillStyle = "#8fd8d2"; ctx.font = `800 ${S * 0.06}px ${FONT}`; ctx.fillText(e.titulo.toUpperCase(), cx, S * 0.2);
  ctx.fillStyle = "#2f6fd6"; ctx.beginPath(); ctx.arc(cx, S * 0.37, S * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.save(); ctx.translate(cx, S * 0.37); ctx.rotate(-Math.PI / 4);
  ctx.fillRect(-S * 0.065, -S * 0.03, S * 0.13, S * 0.06); ctx.restore();
  ctx.fillStyle = "#fff"; ctx.font = `800 ${S * 0.12}px ${FONT}`; ctx.fillText(e.med, cx, S * 0.57);
  ctx.fillStyle = "#b9c7d0"; ctx.font = `600 ${S * 0.065}px ${FONT}`; ctx.fillText(e.dosis, cx, S * 0.67);
  if (e.modo === "evidencias") {
    ctx.fillStyle = `rgba(140,116,255,${0.5 + 0.5 * pulso})`; ctx.beginPath(); ctx.arc(cx, S * 0.81, S * 0.03, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = "#1f9d55"; ctx.beginPath(); ctx.roundRect(cx - S * 0.2, S * 0.75, S * 0.4, S * 0.11, S * 0.05); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `800 ${S * 0.06}px ${FONT}`; ctx.fillText("✓", cx, S * 0.805);
  }
};

/** Recuadro ampliado del reloj (HTML), para que la pantalla se lea bien en el video. */
export const RelojAmpliado: React.FC<{ e: EstadoReloj; pulso: number; style?: React.CSSProperties; titulo: string }> = ({ e, pulso, style, titulo }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) dibujarReloj(ctx, e, pulso);
  });
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 14, ...style }}>
      <div style={{ width: 300, height: 300, borderRadius: "50%", padding: 14, background: "linear-gradient(150deg,#d6d9dc,#9aa0a6 45%,#5b6168)", boxShadow: "0 30px 60px -30px rgba(10,25,35,.7)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#05080a", padding: 12 }}>
          <canvas ref={ref} width={420} height={420} style={{ width: "100%", height: "100%", borderRadius: "50%", display: "block" }} />
        </div>
      </div>
      <span style={{ font: `800 22px ${FONT}`, color: C.fg, background: "rgba(255,255,255,.9)", padding: "6px 16px", borderRadius: 999 }}>{titulo}</span>
    </div>
  );
};

// ---------- Pantalla del teléfono de Laura ----------
export type EstadoTel = { hora: string; tipo: "ok" | "alerta" | "nada"; t1: string; t2: string; app: string };
export const dibujarTel = (ctx: CanvasRenderingContext2D, e: EstadoTel) => {
  const Wd = ctx.canvas.width, Ht = ctx.canvas.height;
  const g = ctx.createLinearGradient(0, 0, 0, Ht);
  g.addColorStop(0, "#14a39b"); g.addColorStop(1, "#06615d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, Wd, Ht);
  ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = `700 ${Wd * 0.2}px ${MONO}`; ctx.fillText(e.hora, Wd / 2, Ht * 0.2);
  if (e.tipo === "nada") return;
  const y = Ht * 0.3, h = Ht * 0.17;
  ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); ctx.roundRect(Wd * 0.05, y, Wd * 0.9, h, Wd * 0.06); ctx.fill();
  ctx.fillStyle = e.tipo === "ok" ? "#1f9d55" : "#d9463b"; ctx.beginPath(); ctx.arc(Wd * 0.16, y + h * 0.45, Wd * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = "left"; ctx.fillStyle = "#0f2230"; ctx.font = `800 ${Wd * 0.055}px ${FONT}`;
  ctx.fillText(e.t1.slice(0, 28), Wd * 0.26, y + h * 0.42);
  ctx.fillStyle = "#5b6b78"; ctx.font = `600 ${Wd * 0.045}px ${FONT}`; ctx.fillText(e.t2.slice(0, 32), Wd * 0.26, y + h * 0.72);
};

/** Teléfono ampliado (HTML) con la notificación, al lado de la escena 3D. */
export const TelAmpliado: React.FC<{ e: EstadoTel; entra: number; style?: React.CSSProperties; nota?: string }> = ({ e, entra, style, nota }) => (
  <div style={{ width: 400, display: "grid", gap: 16, ...style }}>
    <div style={{ height: 760, borderRadius: 54, border: "12px solid #0b0f12", background: "linear-gradient(170deg,#14a39b,#06615d)", boxShadow: "0 40px 80px -40px rgba(10,25,35,.7)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", font: `700 92px ${MONO}`, color: "#fff" }}>{e.hora}</div>
      {e.tipo !== "nada" && (
        <div style={{ position: "absolute", left: 18, right: 18, top: 230, background: "rgba(255,255,255,.96)", borderRadius: 24, padding: "18px 20px", display: "grid", gridTemplateColumns: "56px 1fr", gap: 14, alignItems: "center", opacity: entra, transform: `translateY(${(1 - entra) * -40}px)` }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: e.tipo === "ok" ? C.okSoft : C.missSoft }}><Logo size={40} /></div>
          <div>
            <div style={{ font: `700 18px ${FONT}`, color: C.mu }}>{e.app}</div>
            <div style={{ font: `800 25px ${FONT}`, color: e.tipo === "ok" ? "#13703b" : "#a3261d", lineHeight: 1.2 }}>{e.t1}</div>
            <div style={{ font: `600 20px ${FONT}`, color: C.mu, marginTop: 4 }}>{e.t2}</div>
          </div>
        </div>
      )}
    </div>
    {nota && <div style={{ font: `700 20px ${FONT}`, color: C.mu, textAlign: "center", opacity: entra }}>{nota}</div>}
  </div>
);
