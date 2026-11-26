import React from "react";
import * as THREE from "three";
import { Caja, Mat } from "./Objetos";

/** Sala de Rafael: piso de madera, muros, ventana con luz, tapete, sillón, mesita, lámpara y planta. */
export const MESA = { x: 0.62, z: 0.12, alto: 0.58 }; // mesita a la izquierda de Rafael (+X)

export const Sala: React.FC = () => (
  <group>
    {/* piso */}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <Mat color="#b98d63" rough={0.7} />
    </mesh>
    {/* duelas */}
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-6 + i * 0.5, 0.0008, 0]}>
        <planeGeometry args={[0.006, 12]} />
        <Mat color="#9c7450" rough={0.8} />
      </mesh>
    ))}
    {/* muros */}
    <mesh receiveShadow position={[0, 1.6, -1.3]}>
      <planeGeometry args={[12, 3.2]} />
      <Mat color="#efe6da" rough={0.95} />
    </mesh>
    <mesh receiveShadow position={[-2.4, 1.6, 2]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[8, 3.2]} />
      <Mat color="#e7dccd" rough={0.95} />
    </mesh>
    {/* zoclo */}
    <Caja s={[12, 0.1, 0.02]} p={[0, 0.05, -1.29]} r={0.004} color="#f7f2ea" sombra={false} />
    {/* ventana */}
    <group position={[1.35, 1.55, -1.28]}>
      <mesh>
        <planeGeometry args={[1.3, 1.3]} />
        <meshStandardMaterial color="#dfeef6" emissive="#eaf6ff" emissiveIntensity={0.9} />
      </mesh>
      {[[-0.675, 0, 0.05, 1.4], [0.675, 0, 0.05, 1.4], [0, 0, 0.04, 1.3], [0, 0.675, 1.4, 0.05], [0, -0.675, 1.4, 0.05], [0, 0, 1.3, 0.035]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.01]}>
          <boxGeometry args={[w, h, 0.03]} />
          <Mat color="#fbfaf7" rough={0.6} />
        </mesh>
      ))}
      {/* cortinas */}
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, -0.15, 0.06]}>
          <boxGeometry args={[0.28, 1.9, 0.04]} />
          <Mat color="#c9b79c" rough={0.95} />
        </mesh>
      ))}
    </group>
    {/* cuadro */}
    <group position={[-1.1, 1.75, -1.27]}>
      <Caja s={[0.7, 0.5, 0.03]} p={[0, 0, 0]} r={0.008} color="#3d4b55" sombra={false} />
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.6, 0.4]} />
        <Mat color="#9fbfb4" rough={0.9} />
      </mesh>
      <mesh position={[0.1, -0.05, 0.018]}>
        <circleGeometry args={[0.1, 32]} />
        <Mat color="#e7c77f" rough={0.9} />
      </mesh>
    </group>
    {/* tapete */}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.004, 0.5]}>
      <circleGeometry args={[1.25, 64]} />
      <Mat color="#7f9aa2" rough={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.005, 0.5]}>
      <ringGeometry args={[1.05, 1.12, 64]} />
      <Mat color="#e5dccb" rough={1} />
    </mesh>
    {/* sillón */}
    <group position={[0, 0, -0.04]}>
      <Caja s={[0.78, 0.2, 0.7]} p={[0, 0.3, 0]} r={0.05} color="#2f6b6a" />
      <Caja s={[0.6, 0.12, 0.58]} p={[0, 0.45, 0.04]} r={0.05} color="#3a7f7d" />
      <Caja s={[0.78, 0.72, 0.18]} p={[0, 0.66, -0.29]} r={0.07} color="#2f6b6a" />
      <Caja s={[0.6, 0.5, 0.1]} p={[0, 0.72, -0.18]} r={0.05} color="#3a7f7d" />
      {[-1, 1].map((s) => (
        <Caja key={s} s={[0.13, 0.32, 0.66]} p={[0.36 * s, 0.53, 0.0]} r={0.05} color="#2f6b6a" />
      ))}
      {[[-0.32, 0.27], [0.32, 0.27], [-0.32, -0.27], [0.32, -0.27]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.025, 0.018, 0.2, 12]} />
          <Mat color="#5a3d27" rough={0.6} />
        </mesh>
      ))}
    </group>
    {/* mesita */}
    <group position={[MESA.x, 0, MESA.z]}>
      <mesh castShadow receiveShadow position={[0, MESA.alto - 0.015, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.03, 40]} />
        <Mat color="#8a6243" rough={0.55} />
      </mesh>
      <mesh castShadow position={[0, MESA.alto / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.04, MESA.alto - 0.03, 16]} />
        <Mat color="#6f4e35" rough={0.6} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.03, 32]} />
        <Mat color="#6f4e35" rough={0.6} />
      </mesh>
    </group>
    {/* lámpara de pie */}
    <group position={[-0.8, 0, -0.75]}>
      <mesh castShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.04, 24]} />
        <Mat color="#2b2f33" rough={0.4} metal={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 10]} />
        <Mat color="#2b2f33" rough={0.4} metal={0.5} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 0.28, 32, 1, true]} />
        <meshStandardMaterial color="#f3e7cf" emissive="#ffe3b0" emissiveIntensity={0.35} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
    {/* planta */}
    <group position={[-1.75, 0, -0.85]}>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.17, 0.13, 0.4, 24]} />
        <Mat color="#d7d0c4" rough={0.7} />
      </mesh>
      {[[0, 0.62, 0, 0.26], [0.16, 0.78, 0.05, 0.2], [-0.15, 0.82, -0.04, 0.22], [0.02, 0.98, 0.02, 0.18], [-0.05, 0.7, 0.15, 0.17]].map(([x, y, z, r], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <Mat color={i % 2 ? "#4f7d4a" : "#3f6e3f"} rough={0.9} />
        </mesh>
      ))}
    </group>
  </group>
);
