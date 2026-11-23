import { conPose, D, SENTADO, type Pose } from "./Humanoide";

const r = (d: number) => (d * Math.PI) / 180;

// Convención (comprobada con fotogramas): hombro X negativo = brazo hacia adelante;
// hombro Z positivo = brazo izquierdo hacia afuera (+X), en el derecho es al revés;
// codo negativo = flexión hacia adelante; muñeca Y = prono-supinación; cabeza X positivo = mirar abajo.
const BASE: Pose = {
  ...SENTADO,
  hombroI: D(-12, 0, -5), codoI: r(-62), munecaI: D(0, 180, 0),
  hombroD: D(-12, 0, 5), codoD: r(-62), munecaD: D(0, 180, 0),
};

/** Poses clave de Rafael (brazo izquierdo = el del reloj; la mesita está a su izquierda, +X). */
export const RAFAEL = {
  reposo: BASE,
  // antebrazo izquierdo horizontal frente al pecho, reloj hacia arriba, mira hacia abajo
  mirar: conPose(BASE, { hombroI: D(-30, 42, -12), codoI: r(-96), munecaI: D(0, 180, 0), cabeza: D(30, 18, 0), columna: D(6) }),
  // alcanza la tapa del frasco en la mesita
  frasco: conPose(BASE, { hombroI: D(-26, 0, 44), codoI: r(-22), munecaI: D(-10, 110, 0), columna: D(4, 8, -10), cabeza: D(20, 24, 0), agarreI: 0.7 }),
  // mano dentro del frasco (un poco más abajo)
  frascoBajo: conPose(BASE, { hombroI: D(-22, 0, 44), codoI: r(-18), munecaI: D(-18, 110, 0), columna: D(5, 8, -12), cabeza: D(22, 24, 0), agarreI: 0.9 }),
  // deja la tapa junto al frasco
  aLado: conPose(BASE, { hombroI: D(-30, 0, 40), codoI: r(-26), munecaI: D(-8, 110, 0), columna: D(4, 10, -9), cabeza: D(18, 26, 0), agarreI: 0.5 }),
  // pastilla a la boca
  boca: conPose(BASE, { hombroI: D(-46, -34, -20), codoI: r(-142), munecaI: D(-25, 60, 0), cabeza: D(-8, 0, 0), columna: D(-2), agarreI: 0.95 }),
  // alcanza el vaso
  vaso: conPose(BASE, { hombroI: D(-34, 0, 40), codoI: r(-24), munecaI: D(0, 90, 0), columna: D(4, 8, -9), cabeza: D(16, 20, 0), agarreI: 0.62 }),
  // bebe: vaso a la boca e inclinado, cabeza hacia atrás
  beber: conPose(BASE, { hombroI: D(-50, -20, -12), codoI: r(-122), munecaI: D(-62, 90, 0), cabeza: D(-20, 0, 0), columna: D(-6), agarreI: 0.62 }),
} satisfies Record<string, Pose>;

const SENTADA: Pose = {
  ...SENTADO,
  pos: [0, 0.53, 0],
  columna: D(6),
  cabeza: D(12),
  hombroI: D(-42, 0, -6), codoI: r(-58), munecaI: D(-10, 180, 0),
  hombroD: D(-42, 0, 6), codoD: r(-58), munecaD: D(-10, 180, 0),
  agarreI: 0.35, agarreD: 0.35,
};

/** Poses clave de Laura (el teléfono está a su derecha, -X; usa la mano derecha). */
export const LAURA = {
  teclear: SENTADA,
  // alcanza el teléfono sobre el escritorio
  tomarTel: conPose(SENTADA, { hombroD: D(-46, 0, -26), codoD: r(-30), munecaD: D(-20, 90, 0), cabeza: D(22, -22, 0), columna: D(8, -8, 4), agarreD: 0.7 }),
  // mira el teléfono frente a su pecho
  verTel: conPose(SENTADA, { hombroD: D(-30, 20, -6), codoD: r(-112), munecaD: D(-45, 0, 0), cabeza: D(26, -6, 0), columna: D(4), agarreD: 0.7 }),
  // teléfono al oído derecho para llamar
  llamar: conPose(SENTADA, { hombroD: D(-24, 0, -58), codoD: r(-150), munecaD: D(-10, 70, 0), cabeza: D(4, -8, -10), columna: D(0), agarreD: 0.7 }),
} satisfies Record<string, Pose>;
