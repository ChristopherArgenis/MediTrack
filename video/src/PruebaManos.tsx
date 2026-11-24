import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { conPose, D, Humanoide, type Pose } from "./three/Humanoide";
import { Lienzo } from "./three/Lienzo";
import { Frasco, Pastilla, Tapa, Telefono, useLienzo2D, Vaso } from "./three/Objetos";
import { LAURA, RAFAEL } from "./three/poses";
import { MESA, Sala } from "./three/Sala";
import { Oficina } from "./three/Oficina";
import { ASPECTO_LAURA, ASPECTO_RAFAEL } from "./three/personajes";
import { dibujarTel } from "./scenes/comunes";

/** Banco de pruebas de manos: cada fotograma = una pose con un giro de muñeca distinto (solo para ajustar). */
const GIROS = [-60, -45, -30, -15, 15, 30, 45, 60];
type Caso = { nombre: string; pose: Pose; obj: "vaso" | "pastilla" | "tapa" | "tel" | null; laura?: boolean; lado: "I" | "D" };
const CASOS: Caso[] = [
  { nombre: "frasco", pose: RAFAEL.frasco, obj: "tapa", lado: "I" },
  { nombre: "boca", pose: RAFAEL.boca, obj: "pastilla", lado: "I" },
  { nombre: "vaso", pose: conPose(RAFAEL.vaso, { hombroI: D(-10, 0, 34), codoI: -80 * Math.PI / 180, munecaI: D(0, 0, 0), columna: D(6, 6, -12) }), obj: "vaso", lado: "I" },
  { nombre: "beber", pose: RAFAEL.beber, obj: "vaso", lado: "I" },
  { nombre: "verTel", pose: LAURA.verTel, obj: "tel", laura: true, lado: "D" },
  { nombre: "llamar", pose: LAURA.llamar, obj: "tel", laura: true, lado: "D" },
];

export const VASO_EN_MANO: React.FC<{ agua?: number }> = ({ agua }) => (
  // eje del vaso en la dirección del pulgar (+X de la mano), centrado en el puño
  <group position={[-0.05, 0, 0.03]} rotation={[0, 0, -Math.PI / 2]}><Vaso agua={agua} /></group>
);

export const PruebaManos: React.FC = () => {
  const f = useCurrentFrame();
  const caso = CASOS[2];
  const g = GIROS[f % GIROS.length];
  const pose = conPose(caso.pose, { hombroI: [caso.pose.hombroI[0], (g * Math.PI) / 180, caso.pose.hombroI[2]], munecaI: [0, (120 * Math.PI) / 180, 0] } as Partial<Pose>);
  const { ctx, t } = useLienzo2D(256, 540);
  dibujarTel(ctx, { hora: "8:06", tipo: "ok", t1: "Rafael tomó su Metformina", t2: "8:06", app: "MediTrack" });
  t.needsUpdate = true;
  const obj = caso.obj === "vaso" ? <VASO_EN_MANO /> : caso.obj === "pastilla" ? <group position={[0, 0.005, 0.012]}><Pastilla /></group>
    : caso.obj === "tapa" ? <Tapa /> : caso.obj === "tel" ? <group rotation={[0, 0, Math.PI]}><Telefono pantalla={t} vibra={0} encendido={1} /></group> : null;
  const cam = caso.laura
    ? { pos: [-0.9, 1.25, 1.1] as [number, number, number], mira: [-0.15, 1.0, 0.2] as [number, number, number], fov: 34 }
    : caso.nombre === "vaso" || caso.nombre === "frasco"
      ? { pos: [1.05, 1.0, 0.95] as [number, number, number], mira: [0.55, 0.7, 0.15] as [number, number, number], fov: 34 }
      : { pos: [0.7, 1.28, 0.95] as [number, number, number], mira: [0.12, 1.12, 0.1] as [number, number, number], fov: 32 };
  return (
    <AbsoluteFill>
      <Lienzo cam={cam}>
        {caso.laura ? <Oficina noche={0} /> : <Sala />}
        {caso.laura
          ? <Humanoide pose={pose} aspecto={ASPECTO_LAURA} enManoD={obj} />
          : <Humanoide pose={pose} aspecto={ASPECTO_RAFAEL} enManoI={obj} />}
        {!caso.laura && <group position={[MESA.x - 0.1, MESA.alto, MESA.z + 0.04]}><Frasco conTapa={false} /></group>}
        {!caso.laura && <mesh position={[MESA.x - 0.2, MESA.alto + 0.05, MESA.z + 0.16]}><sphereGeometry args={[0.02]} /><meshBasicMaterial color="red" /></mesh>}
      </Lienzo>
      <div style={{ position: "absolute", left: 30, top: 20, font: "800 64px sans-serif", color: "#000", background: "#fff", padding: "4px 14px" }}>{caso.nombre} Y={g}</div>
    </AbsoluteFill>
  );
};
export const N_PRUEBAS = CASOS.length * GIROS.length;
void D;
