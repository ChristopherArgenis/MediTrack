import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Humanoide, poseEn, type Pose, type V3 } from "../three/Humanoide";
import { Lienzo, type Camara } from "../three/Lienzo";
import { Telefono, useLienzo2D } from "../three/Objetos";
import { LAURA } from "../three/poses";
import { ESCRITORIO, Oficina, TEL_MESA } from "../three/Oficina";
import { ASPECTO_LAURA } from "../three/personajes";
import { C, FONT, FPS } from "../theme";
import { Chip, dibujarTel, type EstadoTel, type PropsEscena, suave, TelAmpliado } from "./comunes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const camEn = (claves: [number, Camara][], s: number): Camara => {
  if (s <= claves[0][0]) return claves[0][1];
  for (let i = 0; i < claves.length - 1; i++) {
    const [t0, a] = claves[i], [t1, b] = claves[i + 1];
    if (s <= t1) { const k = ease((s - t0) / (t1 - t0)); return { pos: lerp3(a.pos, b.pos, k), mira: lerp3(a.mira, b.mira, k), fov: lerp(a.fov ?? 35, b.fov ?? 35, k) }; }
  }
  return claves[claves.length - 1][1];
};

export const EscenaLaura: React.FC<PropsEscena> = ({ ui, frases, dur, lang }) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const at = (id: string) => (frases.find((x) => x.id === id)?.from ?? 0) / FPS;
  const L1 = at("l1") + 0.4, L2 = at("l2") + 0.2, L3 = at("l3");
  const fin = dur / FPS;

  // teclea → toma el teléfono → lo mira → (noche) llega la alerta → llama → deja el teléfono
  const claves: [number, Pose][] = [
    [0, LAURA.teclear], [L1 + 0.3, LAURA.teclear], [L1 + 1.2, LAURA.tomarTel], [L1 + 1.5, LAURA.tomarTel], [L1 + 2.5, LAURA.verTel],
    [L2 + 1.6, LAURA.verTel], [L2 + 2.6, LAURA.llamar], [Math.max(L3 + 1.0, L2 + 4.2), LAURA.llamar],
    [Math.max(L3 + 2.0, L2 + 5.2), LAURA.verTel], [fin, LAURA.verTel],
  ];
  let pose = poseEn(claves, s);
  if (s < L1 + 0.3) {
    const k = Math.sin(s * 14) * 0.06;
    pose = { ...pose, munecaI: [pose.munecaI[0] + k, pose.munecaI[1], pose.munecaI[2]], munecaD: [pose.munecaD[0] - k, pose.munecaD[1], pose.munecaD[2]] };
  }
  pose = { ...pose, columna: [pose.columna[0] + Math.sin(s * 1.5) * 0.01, pose.columna[1], pose.columna[2]] };

  const enMano = s >= L1 + 1.4;
  const noche = suave(f, (L2 - 0.4) * FPS, (L2 + 0.4) * FPS);
  const alerta = s >= L2;
  const vibra = s >= L1 - 0.2 && s < L1 + 1.4 ? (s - L1 + 0.2) / 1.6 : s >= L2 && s < L2 + 1.2 ? (s - L2) / 1.2 : 0;
  const e: EstadoTel = alerta
    ? { hora: lang === "es" ? "20:30" : "8:30", tipo: "alerta", t1: ui.notif_alerta, t2: ui.notif_alerta2, app: ui.notif_app }
    : { hora: lang === "es" ? "8:06" : "8:06", tipo: s >= L1 - 0.2 ? "ok" : "nada", t1: ui.notif_ok, t2: ui.notif_ok2, app: ui.notif_app };
  const { ctx, t } = useLienzo2D(256, 540);
  dibujarTel(ctx, e);
  t.needsUpdate = true;
  const encendido = s >= L1 - 0.2 ? 1 : 0;

  const cam = camEn([
    [0, { pos: [-1.5, 1.45, 2.2], mira: [-0.1, 0.92, 0.3], fov: 38 }],
    [L1 + 0.8, { pos: [-1.4, 1.4, 2.0], mira: [-0.12, 0.92, 0.3], fov: 37 }],
    [L1 + 2.6, { pos: [-1.0, 1.32, 1.5], mira: [-0.1, 1.0, 0.2], fov: 36 }],
    [L2 + 2.0, { pos: [-1.0, 1.32, 1.5], mira: [-0.1, 1.0, 0.2], fov: 36 }],
    [L2 + 3.5, { pos: [-1.3, 1.35, 1.9], mira: [-0.1, 0.95, 0.25], fov: 37 }],
  ], s);

  const telIn = suave(f, (L1 - 0.1) * FPS, (L1 + 0.4) * FPS);
  const notifIn = alerta ? suave(f, L2 * FPS, (L2 + 0.4) * FPS) : suave(f, (L1 - 0.1) * FPS, (L1 + 0.3) * FPS);
  const fondo = noche > 0.5 ? "#3a3f4a" : "#e4eaee";
  const luz = { pos: [2.6, 4.2, 3.2] as V3, color: noche > 0.5 ? "#ffc58a" : "#fff4e5", intensidad: lerp(2.2, 1.3, noche) };

  return (
    <AbsoluteFill>
      <Lienzo cam={cam} fondo={fondo} luz={luz} ambiente={lerp(0.6, 0.35, noche)} ancho={1280} izquierda={640}>
        <Oficina noche={noche} />
        <Humanoide
          pose={pose}
          aspecto={ASPECTO_LAURA}
          enManoD={enMano ? <group position={[0, -0.02, 0.01]} rotation={[0, 0, Math.PI]}><Telefono pantalla={t} vibra={vibra} encendido={encendido} /></group> : null}
        />
        {!enMano && (
          <group position={TEL_MESA} rotation={[-Math.PI / 2, 0, 0.3]}>
            <Telefono pantalla={t} vibra={vibra} encendido={encendido} />
          </group>
        )}
        {/* lámpara de escritorio encendida de noche */}
        <pointLight position={[0.5, ESCRITORIO.alto + 0.5, ESCRITORIO.z]} intensity={noche * 1.6} distance={3} color="#ffd29a" />
      </Lienzo>

      {/* columna izquierda (1/3): el teléfono de Laura en grande */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 1080, background: noche > 0.5 ? "#232833" : C.page, display: "grid", justifyItems: "center", alignContent: "start", paddingTop: 40, gap: 18 }}>
        <div style={{ opacity: telIn, transform: `translateY(${(1 - telIn) * 30}px)` }}>
          <TelAmpliado e={e} entra={notifIn} grande nota={alerta ? undefined : ui.opcional} oscuro={noche > 0.5} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 700, top: 54, display: "flex", gap: 12 }}>
        <Chip bg="rgba(255,255,255,.92)" color={C.fg}>{ui.oficina.split("·")[0].trim()} · {alerta ? (lang === "es" ? "20:30" : "8:30 PM") : lang === "es" ? "8:06" : "8:06 AM"}</Chip>
      </div>

      {alerta && (
        <div style={{ position: "absolute", left: 700, top: 120, opacity: suave(f, (L2 + 2.4) * FPS, (L2 + 3.0) * FPS) }}>
          <Chip bg={C.missSoft} color="#a3261d" style={{ font: `800 26px ${FONT}` }}>{lang === "es" ? "Laura le llama a Rafael" : "Laura calls Rafael"}</Chip>
        </div>
      )}

      <Sequence from={Math.round((L1 - 0.2) * FPS)} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/notif.wav")} volume={0.35} /></Sequence>
      <Sequence from={Math.round(L2 * FPS)} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/vibra.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
