import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./theme";
import { Prueba } from "./Prueba";
import { N_PRUEBAS, PruebaManos } from "./PruebaManos";
import { duracionVideo, Video } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MediTrack-Medicos-ES" component={Video} durationInFrames={duracionVideo("es")} fps={FPS} width={W} height={H} defaultProps={{ lang: "es" as const }} />
    <Composition id="MediTrack-Medicos-EN" component={Video} durationInFrames={duracionVideo("en")} fps={FPS} width={W} height={H} defaultProps={{ lang: "en" as const }} />
    <Composition id="PruebaManos" component={PruebaManos} durationInFrames={N_PRUEBAS} fps={FPS} width={W} height={H} />
    <Composition id="Prueba" component={Prueba} durationInFrames={30} fps={FPS} width={W} height={H} />
  </>
);
