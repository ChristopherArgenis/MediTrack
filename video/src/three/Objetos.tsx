import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const deg = (d: number) => (d * Math.PI) / 180;

export const Mat: React.FC<{ color: string; rough?: number; metal?: number; emissive?: string; ei?: number; opacity?: number; side?: THREE.Side }> = ({ color, rough = 0.8, metal = 0, emissive, ei = 0, opacity, side }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? "#000"} emissiveIntensity={ei} transparent={opacity !== undefined} opacity={opacity ?? 1} side={side ?? THREE.FrontSide} />
);

export const Caja: React.FC<{ s: [number, number, number]; p: [number, number, number]; r?: number; color: string; rough?: number; rot?: [number, number, number]; sombra?: boolean }> = ({ s, p, r = 0.03, color, rough, rot, sombra = true }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 4, r), [s[0], s[1], s[2], r]);
  return (
    <mesh geometry={g} position={p} rotation={rot ?? [0, 0, 0]} castShadow={sombra} receiveShadow>
      <Mat color={color} rough={rough} />
    </mesh>
  );
};

/** Frasco de pastillas ámbar; la tapa se dibuja aparte para poder quitarla. */
export const Frasco: React.FC<{ conTapa?: boolean }> = ({ conTapa = true }) => (
  <group>
    <mesh castShadow position={[0, 0.038, 0]}>
      <cylinderGeometry args={[0.024, 0.024, 0.076, 24]} />
      <meshPhysicalMaterial color="#c9741f" roughness={0.25} transmission={0} opacity={0.92} transparent clearcoat={0.6} />
    </mesh>
    <mesh position={[0, 0.04, 0.0245]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.032, 0.034]} />
      <Mat color="#ffffff" rough={0.9} />
    </mesh>
    {conTapa && <Tapa p={[0, 0.084, 0]} />}
  </group>
);
export const Tapa: React.FC<{ p?: [number, number, number] }> = ({ p = [0, 0, 0] }) => (
  <mesh castShadow position={p}>
    <cylinderGeometry args={[0.026, 0.026, 0.018, 24]} />
    <Mat color="#f4f4f2" rough={0.5} />
  </mesh>
);
export const Pastilla: React.FC = () => (
  <mesh scale={[0.009, 0.005, 0.009]}>
    <sphereGeometry args={[1, 12, 8]} />
    <Mat color="#ffffff" rough={0.4} />
  </mesh>
);
export const Vaso: React.FC<{ agua?: number }> = ({ agua = 0.7 }) => (
  <group>
    <mesh castShadow position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.032, 0.028, 0.1, 28, 1, true]} />
      <meshPhysicalMaterial color="#e8f3f6" roughness={0.05} transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.002, 0]}>
      <cylinderGeometry args={[0.028, 0.028, 0.004, 28]} />
      <meshPhysicalMaterial color="#e8f3f6" roughness={0.05} transparent opacity={0.5} />
    </mesh>
    {agua > 0.02 && (
      <mesh position={[0, 0.004 + (0.09 * agua) / 2, 0]}>
        <cylinderGeometry args={[0.029, 0.027, 0.09 * agua, 28]} />
        <meshPhysicalMaterial color="#9fd2e6" roughness={0.1} transparent opacity={0.55} />
      </mesh>
    )}
  </group>
);

/**
 * Smartwatch redondo en la cara dorsal de la muñeca (−Z del sistema de la muñeca).
 * `pantalla` es una textura de canvas que la escena redibuja según el fotograma; `vibra` 0–1 la sacude y emite ondas.
 */
export const Reloj: React.FC<{ pantalla: THREE.Texture; vibra: number; brillo?: number }> = ({ pantalla, vibra, brillo = 1 }) => {
  const sx = Math.sin(vibra * 90) * 0.0025 * Math.min(1, vibra * 4);
  return (
    <group position={[sx, -0.005, 0]}>
      {/* correa */}
      <mesh rotation={[deg(90), 0, 0]} scale={[1, 1, 1.35]}>
        <torusGeometry args={[0.028, 0.0065, 10, 32]} />
        <Mat color="#1c2329" rough={0.6} />
      </mesh>
      <group position={[0, 0, -0.03]} rotation={[deg(90), 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.011, 40]} />
          <Mat color="#9aa3aa" rough={0.25} metal={0.85} />
        </mesh>
        <mesh position={[0, -0.0058, 0]} rotation={[deg(90), 0, 0]}>
          <circleGeometry args={[0.021, 40]} />
          <meshStandardMaterial map={pantalla} emissiveMap={pantalla} emissive="#ffffff" emissiveIntensity={0.9 * brillo} roughness={0.2} />
        </mesh>
      </group>
      {/* ondas de vibración */}
      {vibra > 0 && [0, 1, 2].map((i) => {
        const k = (vibra * 3 + i / 3) % 1;
        return (
          <mesh key={i} position={[0, 0, -0.038]} rotation={[deg(90), 0, 0]} scale={1 + k * 2.2}>
            <ringGeometry args={[0.026, 0.029, 40]} />
            <meshBasicMaterial color="#2fd1a5" transparent opacity={(1 - k) * 0.7} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Teléfono (para Laura): cuerpo, pantalla con textura y vibración. */
export const Telefono: React.FC<{ pantalla: THREE.Texture; vibra: number; encendido: number }> = ({ pantalla, vibra, encendido }) => {
  const sx = Math.sin(vibra * 80) * 0.003 * Math.min(1, vibra * 4);
  return (
    <group position={[sx, 0, 0]}>
      <Caja s={[0.075, 0.155, 0.009]} p={[0, 0, 0]} r={0.008} color="#15191d" rough={0.35} />
      <mesh position={[0, 0, 0.0047]}>
        <planeGeometry args={[0.068, 0.146]} />
        <meshStandardMaterial map={pantalla} emissiveMap={pantalla} emissive="#ffffff" emissiveIntensity={0.85 * encendido} color={encendido > 0.05 ? "#ffffff" : "#05070a"} roughness={0.15} />
      </mesh>
    </group>
  );
};

/** Textura de canvas reutilizable: la escena dibuja en ella en cada fotograma (dibujo determinista). */
export const useLienzo2D = (w: number, h: number) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { c, ctx: c.getContext("2d") as CanvasRenderingContext2D, t };
  }, [w, h]);
