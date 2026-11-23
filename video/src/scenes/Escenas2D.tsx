import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, MONO } from "../theme";
import { Chip, Kicker, Logo, type PropsEscena, suave, Tarjeta, useEntrada } from "./comunes";

const at = (frases: PropsEscena["frases"], id: string, extra = 0) => (frases.find((x) => x.id === id)?.from ?? 0) + extra;
const Fondo: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.page }) => (
  <AbsoluteFill style={{ background: color, padding: "120px 130px 190px", fontFamily: FONT, color: C.fg }}>{children}</AbsoluteFill>
);

/** 1 · Gancho: la cifra se ve desde el cuadro 0. */
export const Gancho: React.FC<PropsEscena> = ({ ui, frases }) => {
  // Cuadro 0 lleno: la cifra y la pregunta ya se ven desde el primer fotograma.
  const fuente = useEntrada(at(frases, "g2"));
  return (
    <Fondo>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", height: "100%" }}>
        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ font: `800 210px ${FONT}`, letterSpacing: "-.05em", color: C.acDk, lineHeight: 0.9 }}>≈50<span style={{ fontSize: 110 }}>%</span></div>
          <div style={{ ...fuente, font: `700 34px ${FONT}`, color: C.fg }}>{ui.adherencia}</div>
          <div style={{ ...fuente, font: `600 24px ${FONT}`, color: C.mu }}>{ui.fuente_oms}</div>
        </div>
        <Tarjeta style={{ padding: "46px 50px", display: "grid", gap: 26 }}>
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke={C.ac} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.8M12 17h.01" /></svg>
          <div style={{ font: `800 54px ${FONT}`, lineHeight: 1.15, letterSpacing: "-.02em" }}>{frasesTexto(ui, "pregunta")}</div>
        </Tarjeta>
      </div>
    </Fondo>
  );
};
const frasesTexto = (ui: Record<string, any>, k: string) => (k === "pregunta" ? (ui.p_label === "P(tomó)" ? "¿Su paciente tomó su medicamento?" : "Did your patient take their medication?") : "");

/** 2 · Problema: cuatro tarjetas que entran al ritmo de las frases. */
export const Problema: React.FC<PropsEscena> = ({ ui, frases }) => {
  const momentos = [at(frases, "p1"), at(frases, "p2"), at(frases, "p2", 20), at(frases, "p3")];
  const colores = [[C.miss, C.missSoft], [C.late, C.lateSoft], [C.blue, C.blueSoft], [C.ges, C.gesSoft]];
  return (
    <Fondo>
      <Kicker>{ui.prob_titulo}</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 30, marginTop: 90 }}>
        {ui.prob.map(([t, d]: [string, string], i: number) => (
          <Item key={i} at={momentos[i]} n={i + 1} t={t} d={d} c={colores[i]} />
        ))}
      </div>
    </Fondo>
  );
};
const Item: React.FC<{ at: number; n: number; t: string; d: string; c: string[] }> = ({ at: a, n, t, d, c }) => {
  const st = useEntrada(a, 40);
  return (
    <Tarjeta style={{ ...st, minHeight: 470, display: "grid", alignContent: "start", gap: 24, padding: "40px 36px" }}>
      <div style={{ width: 84, height: 84, borderRadius: 24, background: c[1], color: c[0], display: "grid", placeItems: "center", font: `800 40px ${MONO}` }}>{n}</div>
      <div style={{ font: `800 48px ${FONT}`, lineHeight: 1.1 }}>{t}</div>
      <div style={{ font: `600 32px ${FONT}`, color: C.mu, lineHeight: 1.3 }}>{d}</div>
    </Tarjeta>
  );
};

/** 3 · Presentación de MediTrack. */
export const Presenta: React.FC<PropsEscena> = ({ ui }) => {
  const f = useCurrentFrame();
  const a = useEntrada(0, 0);
  const b = useEntrada(14, 30);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg,#14a39b,#06615d)", color: "#fff", fontFamily: FONT, display: "grid", placeItems: "center", paddingBottom: 120 }}>
      <div style={{ position: "absolute", right: -160, top: -160, width: 720, height: 720, borderRadius: "50%", border: "3px solid rgba(255,255,255,.14)", transform: `rotate(${f * 0.2}deg)` }} />
      <div style={{ display: "grid", justifyItems: "center", gap: 34, textAlign: "center" }}>
        <div style={{ ...a, display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ borderRadius: 30, boxShadow: "0 0 0 4px rgba(255,255,255,.3)" }}><Logo size={140} /></div>
          <div style={{ font: `800 150px ${FONT}`, letterSpacing: "-.04em" }}>MediTrack</div>
        </div>
        <div style={{ ...b, font: `700 44px ${FONT}`, maxWidth: 1300, opacity: (b.opacity as number) * 0.95 }}>{ui.lema}</div>
      </div>
    </AbsoluteFill>
  );
};

/** 6 · Reporte de consulta (ejemplo ficticio). */
export const Reporte: React.FC<PropsEscena> = ({ ui, frases }) => {
  const f = useCurrentFrame();
  const patron = suave(f, at(frases, "d2"), at(frases, "d2", 15));
  const colEstado = (e: string) => (/tiempo|on time/.test(e) ? "#13703b" : /retraso|late/.test(e) ? "#8a5600" : "#a3261d");
  return (
    <Fondo>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}><Kicker>{ui.rep_titulo}</Kicker><Chip bg={C.lateSoft} color="#8a5600">{ui.rep_ficticio}</Chip></div>
      <Tarjeta style={{ marginTop: 44, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", font: `600 28px ${FONT}` }}>
          <thead><tr>{ui.rep_cols.map((c: string) => <th key={c} style={{ textAlign: "left", padding: "20px 26px", background: C.bg, font: `800 19px ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: C.mu }}>{c}</th>)}</tr></thead>
          <tbody>
            {ui.rep_filas.map((r: string[], i: number) => {
              const st = useEntradaFila(f, 6 + i * 10);
              const nocturna = i === 1 || i === 3;
              return (
                <tr key={i} style={{ ...st, background: nocturna ? `rgba(253,241,220,${patron})` : "transparent" }}>
                  {r.map((c, j) => (
                    <td key={j} style={{ padding: "22px 26px", borderTop: `1px solid ${C.line}`, fontFamily: j === 1 || j === 4 ? MONO : FONT, fontWeight: j === 3 ? 800 : 600, color: j === 3 ? colEstado(c) : C.fg }}>{c}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tarjeta>
      <div style={{ marginTop: 34, opacity: patron, transform: `translateY(${(1 - patron) * 20}px)` }}>
        <Chip bg={C.lateSoft} color="#6b4300" style={{ font: `800 30px ${FONT}`, padding: "14px 24px" }}>⚑ {ui.rep_patron}</Chip>
      </div>
    </Fondo>
  );
};
const useEntradaFila = (f: number, a: number): React.CSSProperties => {
  const p = suave(f, a, a + 14);
  return { opacity: p, transform: `translateY(${(1 - p) * 14}px)` };
};

/** 7 · Evidencia científica y límites. */
export const Evidencia: React.FC<PropsEscena> = ({ ui, frases }) => {
  const f = useCurrentFrame();
  const a = useEntrada(0);
  const lim = useEntrada(at(frases, "e2"));
  const pct = Math.round(interpolate(f, [10, 50], [0, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Fondo>
      <Kicker>{ui.ev2_titulo}</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, marginTop: 50 }}>
        <Tarjeta style={{ ...a, display: "grid", gap: 18, padding: "40px 46px" }}>
          <Chip bg={C.acSoft} color={C.acDk} style={{ justifySelf: "start" }}>{ui.dosemate}</Chip>
          <div style={{ font: `800 170px ${FONT}`, color: C.acDk, letterSpacing: "-.04em", lineHeight: 1 }}>94–{pct}<span style={{ fontSize: 90 }}>%</span></div>
          <div style={{ font: `800 36px ${FONT}` }}>{ui.ba}</div>
          <div style={{ font: `600 26px ${FONT}`, color: C.mu }}>{ui.dosemate_txt}</div>
        </Tarjeta>
        <div style={{ ...lim, display: "grid", gap: 26, alignContent: "center" }}>
          {[ui.limite1, ui.limite2].map((t: string, i: number) => (
            <Tarjeta key={i} style={{ display: "flex", gap: 22, alignItems: "center", borderLeft: `10px solid ${i ? C.miss : C.late}` }}>
              <span style={{ font: `800 46px ${FONT}`, color: i ? C.miss : C.late }}>!</span>
              <span style={{ font: `800 38px ${FONT}` }}>{t}</span>
            </Tarjeta>
          ))}
        </div>
      </div>
    </Fondo>
  );
};

/** 8 · Cierre: prototipo, QR e invitación al piloto. */
export const Cierre: React.FC<PropsEscena> = ({ ui, frases }) => {
  const a = useEntrada(0);
  const qr = useEntrada(8, 30);
  const piloto = useEntrada(at(frases, "c2"));
  return (
    <AbsoluteFill style={{ background: C.dark, color: "#fff", fontFamily: FONT, padding: "110px 130px 190px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 760px", gap: 70, alignItems: "center", height: "100%" }}>
        <div style={{ display: "grid", gap: 30 }}>
          <div style={{ ...a, display: "flex", alignItems: "center", gap: 18 }}><Logo size={64} /><span style={{ font: `800 40px ${FONT}` }}>MediTrack</span></div>
          <div style={{ ...a, font: `800 76px ${FONT}`, letterSpacing: "-.02em", lineHeight: 1.05 }}>{ui.cta}</div>
          <div style={{ ...a, font: `700 32px ${MONO}`, color: "#8fe0d8" }}>christopherargenis.github.io/MediTrack</div>
          <div style={{ ...qr, display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ background: "#fff", padding: 14, borderRadius: 20 }}><Img src={staticFile("qr.svg")} style={{ width: 210, height: 210, display: "block" }} /></div>
            <span style={{ font: `700 28px ${FONT}`, color: "#c8d6de", maxWidth: 320 }}>{ui.escanea}</span>
          </div>
          <div style={{ ...piloto, font: `800 36px ${FONT}`, color: "#fff", background: "rgba(255,255,255,.08)", padding: "20px 26px", borderRadius: 20, justifySelf: "start" }}>{ui.piloto}</div>
        </div>
        <Img src={staticFile("prototipo.png")} style={{ ...a, width: "100%", borderRadius: 26, boxShadow: "0 40px 80px -40px rgba(0,0,0,.8)" }} />
      </div>
    </AbsoluteFill>
  );
};

export const segundos = (frames: number) => frames / FPS;
