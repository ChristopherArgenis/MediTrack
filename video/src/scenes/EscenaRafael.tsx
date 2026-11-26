import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Humanoide, poseEn, type Pose, type V3 } from "../three/Humanoide";
import { Lienzo, type Camara } from "../three/Lienzo";
import { Frasco, Pastilla, Reloj, Tapa, useLienzo2D, Vaso } from "../three/Objetos";
import { RAFAEL } from "../three/poses";
import { MESA, Sala } from "../three/Sala";
import { ASPECTO_RAFAEL } from "../three/personajes";
import { C, FONT, FPS, MONO } from "../theme";
import { Chip, dibujarReloj, type EstadoReloj, type PropsEscena, RelojAmpliado, suave } from "./comunes";

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Cámara por fotogramas clave [segundo, cámara]. */
const camEn = (claves: [number, Camara][], s: number): Camara => {
  if (s <= claves[0][0]) return claves[0][1];
  for (let i = 0; i < claves.length - 1; i++) {
    const [t0, a] = claves[i], [t1, b] = claves[i + 1];
    if (s <= t1) { const k = ease((s - t0) / (t1 - t0)); return { pos: lerp3(a.pos, b.pos, k), mira: lerp3(a.mira, b.mira, k), fov: lerp(a.fov ?? 35, b.fov ?? 35, k) }; }
  }
  return claves[claves.length - 1][1];
};

// Valores de las evidencias (mismo modelo de fusión que el prototipo y el documento técnico)
const EV = { time: 0.75, imu: 0.91, seq: 0.86 };
const W8 = { time: 0.5, imu: 2.2, seq: 1.2 };
const BIAS = -0.35;

export const EscenaRafael: React.FC<PropsEscena> = ({ ui, frases, dur }) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const at = (id: string) => (frases.find((x) => x.id === id)?.from ?? 0) / FPS;
  const A = at("r1"), B = Math.max(at("r2"), A + 4.4), R4 = at("r4"), R5 = at("r5");
  const Cv = Math.max(B + 5.4, at("r3") + 0.6);

  // ---- pose ----
  const claves: [number, Pose][] = [
    [0, RAFAEL.reposo], [A + 0.5, RAFAEL.reposo], [A + 1.4, RAFAEL.mirar], [A + 3.3, RAFAEL.mirar], [A + 4.1, RAFAEL.reposo],
    [B, RAFAEL.reposo], [B + 0.9, RAFAEL.frasco], [B + 2.1, RAFAEL.frasco], [B + 2.5, RAFAEL.aLado], [B + 2.8, RAFAEL.aLado],
    [B + 3.2, RAFAEL.frascoBajo], [B + 3.5, RAFAEL.frascoBajo], [B + 4.4, RAFAEL.boca], [B + 5.0, RAFAEL.boca],
    [Cv - 0.1, RAFAEL.vaso], [Cv + 0.4, RAFAEL.vaso], [Cv + 1.4, RAFAEL.beber], [Cv + 3.0, RAFAEL.beber],
    [Cv + 3.9, RAFAEL.vaso], [Cv + 4.2, RAFAEL.vaso], [Cv + 5.0, RAFAEL.reposo],
    [R5 + 0.2, RAFAEL.reposo], [R5 + 1.1, RAFAEL.mirar], [dur / FPS, RAFAEL.mirar],
  ].sort((a, b) => (a[0] as number) - (b[0] as number)) as [number, Pose][];
  let pose = poseEn(claves, s);
  // giro de muñeca al abrir el frasco
  if (s > B + 0.9 && s < B + 2.1) {
    const k = Math.sin((s - B - 0.9) * Math.PI * 2 * 1.7) * 0.55 * Math.sin(((s - B - 0.9) / 1.2) * Math.PI);
    pose = { ...pose, munecaI: [pose.munecaI[0], pose.munecaI[1] + k, pose.munecaI[2]] };
  }
  // respiración sutil
  pose = { ...pose, columna: [pose.columna[0] + Math.sin(s * 1.6) * 0.012, pose.columna[1], pose.columna[2]] };

  // ---- objetos ----
  const tapaEnMano = s >= B + 1.6 && s < B + 2.7;
  const tapaQuitada = s >= B + 1.6;
  const pastilla = s >= B + 3.4 && s < B + 4.5;
  const vasoEnMano = s >= Cv + 0.4 && s < Cv + 4.0;
  const agua = lerp(0.72, 0.42, ease((s - Cv - 1.6) / 1.4));

  // ---- reloj ----
  const vibra = s >= A && s < A + 1.9 ? (s - A) / 1.9 : s >= R5 && s < R5 + 0.9 ? (s - R5) / 0.9 : 0;
  const e: EstadoReloj = {
    modo: s < A ? "hora" : s < B ? "aviso" : s < R5 ? "evidencias" : "confirmada",
    hora: s < A ? "7:59" : "8:00", med: ui.med, dosis: ui.dosis, titulo: ui.hora, ok: ui.confirmada, p: 0.93,
  };
  const pulso = (Math.sin(s * 6) + 1) / 2;
  const { ctx, t } = useLienzo2D(256, 256);
  dibujarReloj(ctx, e, pulso);
  t.needsUpdate = true;

  // ---- evidencias y probabilidad ----
  const tiempoEv = { time: B + 0.3, imu: B + 4.4, seq: Cv + 3.0 };
  let x = BIAS, any = false;
  (Object.keys(EV) as (keyof typeof EV)[]).forEach((k) => {
    const w = ease((s - tiempoEv[k]) / 0.6);
    if (w > 0) { x += W8[k] * (2 * EV[k] - 1) * w; if (k !== "time") any = true; }
  });
  const P = any ? sig(x) : null;

  // ---- cámara ----
  const cam = camEn([
    [0, { pos: [2.1, 1.35, 2.7], mira: [0.25, 0.78, 0.05], fov: 34 }],
    [A + 0.3, { pos: [2.1, 1.35, 2.7], mira: [0.25, 0.78, 0.05], fov: 34 }],
    [A + 1.6, { pos: [0.95, 1.32, 1.05], mira: [0.12, 0.95, 0.2], fov: 32 }],
    [A + 3.4, { pos: [0.95, 1.32, 1.05], mira: [0.12, 0.95, 0.2], fov: 32 }],
    [B + 0.6, { pos: [1.75, 1.3, 2.05], mira: [0.38, 0.82, 0.1], fov: 33 }],
    [Cv + 4.5, { pos: [1.55, 1.28, 1.9], mira: [0.3, 0.86, 0.1], fov: 33 }],
    [R5, { pos: [1.55, 1.28, 1.9], mira: [0.3, 0.86, 0.1], fov: 33 }],
    [R5 + 1.6, { pos: [0.95, 1.32, 1.05], mira: [0.12, 0.95, 0.2], fov: 32 }],
  ], s);

  const panel = suave(f, (B - 0.2) * FPS, (B + 0.4) * FPS);
  const ampli = Math.max(suave(f, (A + 0.2) * FPS, (A + 0.7) * FPS) * (1 - suave(f, (A + 4.0) * FPS, (A + 4.5) * FPS)), suave(f, (R5 + 0.3) * FPS, (R5 + 0.8) * FPS));
  const confirmada = suave(f, R5 * FPS, (R5 + 0.5) * FPS);
  const filas: { k: keyof typeof EV | "nfc"; i: number }[] = [{ k: "imu", i: 0 }, { k: "seq", i: 1 }, { k: "time", i: 2 }, { k: "nfc", i: 3 }];

  return (
    <AbsoluteFill>
      <Lienzo cam={cam} fondo="#e9e3da">
        <Sala />
        <Humanoide
          pose={pose}
          aspecto={ASPECTO_RAFAEL}
          enMunecaI={<Reloj pantalla={t} vibra={vibra} />}
          enManoI={
            tapaEnMano ? <group position={[0, -0.01, 0]}><Tapa /></group>
              : pastilla ? <group position={[0, 0.005, 0.012]}><Pastilla /></group>
                : vasoEnMano ? <group position={[-0.05, 0, 0.03]} rotation={[0, 0, -Math.PI / 2]}><Vaso agua={agua} /></group>
                  : null
          }
        />
        <group position={[MESA.x - 0.1, MESA.alto, MESA.z + 0.04]}><Frasco conTapa={!tapaQuitada} /></group>
        {tapaQuitada && !tapaEnMano && <group position={[MESA.x - 0.02, MESA.alto + 0.009, MESA.z + 0.14]}><Tapa /></group>}
        {!vasoEnMano && <group position={[MESA.x - 0.01, MESA.alto, MESA.z + 0.14]}><Vaso agua={s > Cv + 1.6 ? agua : 0.72} /></group>}
      </Lienzo>

      <div style={{ position: "absolute", left: 60, top: 54 }}><Chip bg="rgba(255,255,255,.92)" color={C.fg}>{ui.casa}</Chip></div>

      {ampli > 0.01 && (
        <div style={{ position: "absolute", left: 70, top: 150, opacity: ampli, transform: `scale(${0.85 + 0.15 * ampli})`, transformOrigin: "top left" }}>
          <RelojAmpliado e={e} pulso={pulso} titulo={e.modo === "confirmada" ? ui.confirmada : ui.hora} />
        </div>
      )}

      <div style={{ position: "absolute", right: 60, top: 140, width: 560, opacity: panel, transform: `translateX(${(1 - panel) * 40}px)` }}>
        <div style={{ background: "rgba(255,255,255,.95)", borderRadius: 28, padding: "26px 30px", boxShadow: "0 24px 50px -28px rgba(15,34,48,.5)" }}>
          <div style={{ font: `800 22px ${FONT}`, letterSpacing: ".1em", textTransform: "uppercase", color: C.mu, marginBottom: 14 }}>{ui.ev_titulo}</div>
          {filas.map(({ k, i }) => {
            const obs = k !== "nfc" && s >= tiempoEv[k as keyof typeof EV];
            const v = k !== "nfc" ? EV[k as keyof typeof EV] : 0;
            const w = k !== "nfc" ? ease((s - tiempoEv[k as keyof typeof EV]) / 0.6) : 0;
            return (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "2px 14px", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none", opacity: k === "nfc" ? 0.55 : 1 }}>
                <span style={{ font: `800 24px ${FONT}`, color: C.fg }}>{obs ? "✓ " : ""}{ui.ev[i]}</span>
                <span style={{ gridRow: "1 / span 2", gridColumn: 2, display: "grid", gap: 6, justifyItems: "end" }}>
                  <span style={{ width: 150, height: 12, background: C.bg, borderRadius: 6, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${v * w * 100}%`, background: v >= 0.8 ? C.ok : C.late, borderRadius: 6 }} /></span>
                  <span style={{ font: `700 18px ${MONO}`, color: C.mu }}>{obs ? v.toFixed(2) : "—"}</span>
                </span>
                <span style={{ font: `600 18px ${FONT}`, color: C.mu }}>{ui.ev_sensor[i]}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: `800 26px ${FONT}`, color: C.fg }}>
              <span>{ui.p_label}</span><span style={{ fontFamily: MONO }}>{P == null ? "—" : P.toFixed(2)}</span>
            </div>
            <div style={{ position: "relative", height: 18, background: C.bg, borderRadius: 9, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(P ?? 0) * 100}%`, background: (P ?? 0) >= 0.85 ? C.ok : (P ?? 0) >= 0.5 ? C.late : "#7c8a96", borderRadius: 9 }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "85%", width: 3, background: C.fg }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, opacity: confirmada, transform: `scale(${0.9 + 0.1 * confirmada})`, transformOrigin: "left center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.ok, color: "#fff", font: `800 34px ${FONT}`, padding: "14px 26px", borderRadius: 20 }}>✓ {ui.confirmada} · P = 0.93</div>
          <div style={{ font: `700 21px ${FONT}`, color: C.fg, marginTop: 14, background: "rgba(255,255,255,.9)", padding: "10px 16px", borderRadius: 14 }}>{ui.pregunta}</div>
        </div>
      </div>

      <Sequence from={Math.round(A * FPS)} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/vibra.wav")} volume={0.35} /></Sequence>
      <Sequence from={Math.round(R5 * FPS)} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/notif.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
