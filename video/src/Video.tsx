import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, interpolate, continueRender, delayRender } from "remotion";
import { Audio } from "@remotion/media";
import es from "./guiones/es.json";
import en from "./guiones/en.json";
import tiempos from "./tiempos.json";
import { C, FONT, fuentes } from "./theme";
import { Logo, type PropsEscena } from "./scenes/comunes";
import { Cierre, Evidencia, Gancho, Presenta, Problema, Reporte } from "./scenes/Escenas2D";
import { EscenaRafael } from "./scenes/EscenaRafael";
import { EscenaLaura } from "./scenes/EscenaLaura";

type Lang = "es" | "en";
const GUIONES = { es, en } as const;
const ESCENAS: Record<string, React.FC<PropsEscena>> = {
  gancho: Gancho, problema: Problema, presenta: Presenta, rafael: EscenaRafael,
  laura: EscenaLaura, reporte: Reporte, evidencia: Evidencia, cierre: Cierre,
};
const TRANS = 12; // fotogramas de fundido entre escenas

export const duracionVideo = (lang: Lang) => (tiempos as any)[lang].total as number;

const Subtitulos: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const g = GUIONES[lang];
  const t = (tiempos as any)[lang];
  for (const e of t.escenas) for (const fr of e.frases) {
    if (f >= fr.from && f < fr.from + fr.dur + 6) {
      const sub = g.escenas.find((x) => x.id === e.id)!.frases.find((x) => x.id === fr.id)!.sub;
      const o = interpolate(f, [fr.from, fr.from + 5, fr.from + fr.dur, fr.from + fr.dur + 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center", opacity: o }}>
          <div style={{ maxWidth: 1500, background: "rgba(15,34,48,.86)", color: "#fff", font: `700 36px ${FONT}`, lineHeight: 1.3, padding: "14px 30px", borderRadius: 18, textAlign: "center" }}>{sub}</div>
        </div>
      );
    }
  }
  return null;
};

const Marca: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${(f / total) * 100}%`, background: C.ac }} />
      <div style={{ position: "absolute", right: 56, top: 40, display: "flex", alignItems: "center", gap: 12, font: `800 28px ${FONT}`, color: C.fg, background: "rgba(255,255,255,.88)", padding: "8px 18px 8px 10px", borderRadius: 999 }}>
        <Logo size={38} />MediTrack
      </div>
    </>
  );
};

export const Video: React.FC<{ lang: Lang }> = ({ lang }) => {
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { fuentes.then(() => continueRender(h)); }, [h]);
  const g = GUIONES[lang];
  const t = (tiempos as any)[lang];
  return (
    <AbsoluteFill style={{ background: C.page }}>
      {t.escenas.map((e: any, i: number) => {
        const Comp = ESCENAS[e.id];
        const ultimo = i === t.escenas.length - 1;
        const frases = e.frases.map((fr: any) => ({ ...fr, from: fr.from - e.from }));
        return (
          <Sequence key={e.id} from={e.from} durationInFrames={e.dur + (ultimo ? 0 : TRANS)} name={e.id}>
            <Fundido dur={e.dur + (ultimo ? 0 : TRANS)} primero={i === 0} ultimo={ultimo}>
              <Comp ui={g.ui} frases={frases} dur={e.dur} lang={lang} />
            </Fundido>
          </Sequence>
        );
      })}
      {t.escenas.flatMap((e: any) => e.frases.map((fr: any) => (
        <Sequence key={fr.id} from={fr.from} durationInFrames={fr.dur + 2} layout="none">
          <Audio src={staticFile(`voz/${lang}/${fr.id}.wav`)} volume={1} />
        </Sequence>
      )))}
      <Audio
        src={staticFile("musica/calma.wav")}
        loop
        volume={(f) => interpolate(f, [0, 30, t.total - 60, t.total], [0, 0.07, 0.07, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Marca total={t.total} />
      <Subtitulos lang={lang} />
    </AbsoluteFill>
  );
};

/** Fundido de entrada/salida de cada escena (la primera ya se ve en el cuadro 0). */
const Fundido: React.FC<{ dur: number; primero: boolean; ultimo: boolean; children: React.ReactNode }> = ({ dur, primero, ultimo, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, TRANS], [primero ? 1 : 0, 1], { extrapolateRight: "clamp" }) * (ultimo ? interpolate(f, [dur - 20, dur], [1, 0], { extrapolateLeft: "clamp" }) : 1);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
