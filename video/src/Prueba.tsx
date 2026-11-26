import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Humanoide } from "./three/Humanoide";
import { Lienzo } from "./three/Lienzo";
import { Frasco, Reloj, useLienzo2D, Vaso } from "./three/Objetos";
import { RAFAEL } from "./three/poses";
import { MESA, Sala } from "./three/Sala";
import { ASPECTO_RAFAEL } from "./three/personajes";

const NOMBRES = Object.keys(RAFAEL) as (keyof typeof RAFAEL)[];
const CAMS = [
  { pos: [1.25, 1.15, 1.05] as [number, number, number], mira: [0.45, 0.85, 0.15] as [number, number, number], fov: 30 },
  { pos: [0.2, 1.15, 1.2] as [number, number, number], mira: [0.25, 0.95, 0.1] as [number, number, number], fov: 32 },
];

/** Fotograma n: pose NOMBRES[n % k] con la cámara CAMS[floor(n / k)]. Solo para ajustar poses. */
export const Prueba: React.FC = () => {
  const f = useCurrentFrame();
  const k = NOMBRES.length;
  const pose = RAFAEL[NOMBRES[f % k]];
  const cam = CAMS[Math.floor(f / k) % CAMS.length];
  const { c, ctx, t } = useLienzo2D(256, 256);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#2fd1a5"; ctx.font = "bold 70px sans-serif"; ctx.textAlign = "center"; ctx.fillText("8:00", 128, 150);
  t.needsUpdate = true;
  void c;
  return (
    <AbsoluteFill>
      <Lienzo cam={cam}>
        <Sala />
        <Humanoide pose={pose} aspecto={ASPECTO_RAFAEL} enMunecaI={<Reloj pantalla={t} vibra={0} />}
          enManoI={NOMBRES[f % k] === 'beber' || NOMBRES[f % k] === 'vaso' ? <group position={[0, -0.05, 0]}><Vaso /></group> : NOMBRES[f % k] === 'boca' ? <mesh scale={0.009}><sphereGeometry /><meshStandardMaterial color="#fff" /></mesh> : null} />
        <group position={[MESA.x - 0.08, MESA.alto, MESA.z + 0.06]}><Frasco /></group>
        <group position={[MESA.x + 0.06, MESA.alto, MESA.z + 0.1]}><Vaso /></group>
      </Lienzo>
      <div style={{ position: "absolute", left: 30, top: 20, font: "700 40px sans-serif", color: "#000" }}>{NOMBRES[f % k]}</div>
    </AbsoluteFill>
  );
};
