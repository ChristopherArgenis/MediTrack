import React from "react";
import * as THREE from "three";
import { Caja, Mat } from "./Objetos";

/** Oficina de Laura. Ella se sienta en el origen mirando a +Z; el escritorio está frente a ella. */
export const ESCRITORIO = { z: 0.5, alto: 0.74 };
export const TEL_MESA: [number, number, number] = [-0.34, ESCRITORIO.alto + 0.006, 0.42]; // teléfono a su derecha (-X)

export const Oficina: React.FC<{ noche: number }> = ({ noche }) => {
  const cielo = new THREE.Color("#dfeef8").lerp(new THREE.Color("#f0a35e"), noche);
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <Mat color="#8e9aa3" rough={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 1.6, -1.1]}>
        <planeGeometry args={[12, 3.2]} />
        <Mat color="#dfe6ea" rough={0.95} />
      </mesh>
      <mesh receiveShadow position={[2.2, 1.6, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 3.2]} />
        <Mat color="#d4dde3" rough={0.95} />
      </mesh>
      {/* ventanal con ciudad lejana */}
      <group position={[-0.9, 1.5, -1.09]}>
        <mesh>
          <planeGeometry args={[2.2, 1.5]} />
          <meshStandardMaterial color={cielo} emissive={cielo} emissiveIntensity={0.85} />
        </mesh>
        {[[-0.8, -0.45, 0.22, 0.55], [-0.5, -0.38, 0.18, 0.7], [-0.2, -0.5, 0.26, 0.45], [0.15, -0.35, 0.2, 0.78], [0.45, -0.47, 0.24, 0.52], [0.78, -0.4, 0.2, 0.66]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y - 0.75 + h / 2 + 0.3, 0.005]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color={noche > 0.5 ? "#3b4252" : "#b7c6d3"} emissive={noche > 0.5 ? "#ffd27a" : "#000"} emissiveIntensity={noche * 0.15} />
          </mesh>
        ))}
        {[[-1.12, 0, 0.05, 1.6], [1.12, 0, 0.05, 1.6], [0, 0.77, 2.3, 0.05], [0, -0.77, 2.3, 0.05], [0, 0, 0.035, 1.5]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.012]}>
            <boxGeometry args={[w, h, 0.03]} />
            <Mat color="#3a434b" rough={0.5} />
          </mesh>
        ))}
      </group>
      {/* repisa con libros */}
      <group position={[1.2, 1.35, -1.0]}>
        <Caja s={[0.9, 0.03, 0.22]} p={[0, 0, 0]} r={0.008} color="#7a5a40" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Caja key={i} s={[0.05, 0.22 + (i % 3) * 0.03, 0.17]} p={[-0.32 + i * 0.07, 0.13 + (i % 3) * 0.015, 0]} r={0.006} color={["#2f6fd6", "#d98a12", "#0d8a84", "#a23b4c", "#6b4fe0", "#5b6b78"][i]} />
        ))}
      </group>
      {/* escritorio */}
      <group position={[0, 0, ESCRITORIO.z]}>
        <Caja s={[1.5, 0.04, 0.72]} p={[0, ESCRITORIO.alto - 0.02, 0.1]} r={0.01} color="#e9e2d6" />
        {[[-0.7, -0.22], [0.7, -0.22], [-0.7, 0.42], [0.7, 0.42]].map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, ESCRITORIO.alto / 2, z]}>
            <boxGeometry args={[0.04, ESCRITORIO.alto - 0.04, 0.04]} />
            <Mat color="#3a434b" rough={0.5} metal={0.4} />
          </mesh>
        ))}
      </group>
      {/* laptop */}
      <group position={[0.05, ESCRITORIO.alto, ESCRITORIO.z + 0.06]}>
        <Caja s={[0.34, 0.016, 0.23]} p={[0, 0.008, 0]} r={0.006} color="#b9c0c6" />
        <group position={[0, 0.016, 0.115]} rotation={[0.32, 0, 0]}>
          <Caja s={[0.34, 0.22, 0.01]} p={[0, 0.11, 0]} r={0.006} color="#b9c0c6" />
          <mesh position={[0, 0.112, -0.006]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.31, 0.19]} />
            <meshStandardMaterial color="#cfe3f2" emissive="#cfe3f2" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>
      {/* taza y planta */}
      <group position={[0.45, ESCRITORIO.alto, ESCRITORIO.z + 0.05]}>
        <mesh castShadow position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.038, 0.034, 0.09, 24]} />
          <Mat color="#0d8a84" rough={0.4} />
        </mesh>
      </group>
      <group position={[0.62, ESCRITORIO.alto, ESCRITORIO.z - 0.12]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.12, 20]} />
          <Mat color="#f2efe9" rough={0.7} />
        </mesh>
        {[[0, 0.2, 0, 0.09], [0.05, 0.27, 0.02, 0.07], [-0.05, 0.25, -0.02, 0.07]].map(([x, y, z, r], i) => (
          <mesh key={i} castShadow position={[x, y, z]}>
            <icosahedronGeometry args={[r, 1]} />
            <Mat color="#4f7d4a" rough={0.9} />
          </mesh>
        ))}
      </group>
      {/* silla */}
      <group position={[0, 0, -0.05]}>
        <Caja s={[0.5, 0.08, 0.48]} p={[0, 0.43, 0]} r={0.03} color="#2b3138" />
        <Caja s={[0.46, 0.55, 0.07]} p={[0, 0.78, -0.25]} r={0.04} color="#2b3138" rot={[-0.08, 0, 0]} />
        <mesh castShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <Mat color="#5b6b78" rough={0.3} metal={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} castShadow position={[Math.sin((i * 2 * Math.PI) / 5) * 0.2, 0.04, Math.cos((i * 2 * Math.PI) / 5) * 0.2]} rotation={[0, (i * 2 * Math.PI) / 5, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.4]} />
            <Mat color="#3a434b" rough={0.4} metal={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
