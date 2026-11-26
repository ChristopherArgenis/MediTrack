# MediTrack · Video para médicos (ES / EN)

**Estado:** ✅ aprobado el 23/11/2026, con las 3 sugerencias incluidas y la voz en inglés **fenrir**. El texto definitivo vive en `src/guiones/es.json` y `src/guiones/en.json`.

| | |
|---|---|
| Público | Médicos, enfermería y farmacéuticos |
| Duración estimada | ≈ 2:30 (se ajusta con la voz real) |
| Formato | 1920×1080, 30 fps, MP4 (H.264 + AAC) |
| Motor | Remotion 4.0.541 + Three.js (`@remotion/three`), igual que Py_UniversoDC_YT |
| Voz ES | **Alex** (`alex_nicola`, Kokoro local, la del canal) |
| Voz EN | **fenrir** (`am_fenrir`, Kokoro, voz entrenada en inglés de EE. UU.) |
| Versiones | El mismo video en dos idiomas: cambian la narración, los subtítulos y los textos en pantalla |
| Reglas heredadas | 100 % gratis, sin imágenes ni audio de internet y con las cifras citadas con su fuente. Los ejemplos se marcan como “ejemplo ficticio” |

## Personajes 3D

Figuras **humanoides articuladas tipo maniquí, sin rostro**, hechas en Three.js con piezas torneadas (torso, extremidades que se adelgazan como las reales y manos con dedos), con proporciones realistas, ropa, cabello y orejas. No se usan modelos descargados de internet.

- **Rafael, 72:** canas, lentes y suéter. Está sentado en un sillón junto a una mesita con el frasco y un vaso de agua, y lleva un smartwatch redondo en la muñeca izquierda.
- **Laura, 44, su hija:** cabello recogido y blusa. Está en su escritorio, con laptop y su teléfono.

Hay 18 articulaciones (pelvis, columna, cabeza, hombros, codos, muñecas, caderas, rodillas y tobillos) y las poses clave están en `src/three/poses.ts`. La coreografía se ancla al inicio de cada frase de la narración, así queda sincronizada en los dos idiomas.

## Escenas

| # | Tiempo | Pantalla | Narración ES (Alex) | Narration EN |
|---|---|---|---|---|
| 1 · Gancho | 0:00–0:12 | Cifra grande **≈50 %** con la fuente “OMS, 2003”. Ya se ve en el cuadro 0 | Doctor, doctora: ¿cómo sabe si su paciente realmente tomó su medicamento? Según la OMS, en enfermedades crónicas la adherencia ronda apenas el cincuenta por ciento. | Doctor, how do you know if your patient actually took their medication? According to the WHO, adherence in chronic diseases is only around fifty percent. |
| 2 · Problema | 0:12–0:28 | Tres tarjetas: polifarmacia, duda, sin datos en consulta | Con varios medicamentos y horarios, el olvido es fácil. Aparece la duda de si ya se tomó, y en consulta solo queda el autorreporte. A veces se sube una dosis cuando el problema real era la toma. | With several medications and schedules, it's easy to forget. Patients doubt whether they already took a dose, and in clinic all you have is self-report. Sometimes a dose is increased when the real problem was adherence. |
| 3 · Presentación | 0:28–0:36 | Logo MediTrack y frase | Por eso creamos MediTrack: recordatorios en el reloj, confirmación con evidencia y un aviso al cuidador solo cuando hace falta. | That's why we built MediTrack: reminders on the watch, confirmation with evidence, and an alert to the caregiver only when it's needed. |
| 4 · **3D: Rafael** | 0:36–1:12 | Son las 8:00 y el reloj vibra con ondas que salen de la muñeca. En la pantalla del reloj se lee “Metformina 850 mg”. Rafael abre el frasco, se lleva la pastilla a la boca y bebe agua. A la derecha se van llenando las evidencias: gesto, secuencia, horario, NFC opcional. Al final aparece **P = 0.93 → Confirmada** | Son las ocho. El reloj de Rafael vibra: es hora de su metformina. Mientras la toma, el sistema reúne evidencias: el gesto de llevarse la mano a la boca, la secuencia de abrir el frasco y beber agua, y que sea su horario habitual. Ninguna señal sola es prueba; juntas suman confianza. Con evidencia fuerte, la toma se confirma sola. Si hay duda, el reloj le pregunta. | It's eight o'clock. Rafael's watch vibrates: time for his metformin. As he takes it, the system gathers evidence: the hand-to-mouth gesture, the sequence of opening the bottle and drinking water, and his usual schedule. No single signal is proof; together they build confidence. With strong evidence, the dose is confirmed automatically. If in doubt, the watch asks him. |
| 5 · **3D: Laura** | 1:12–1:38 | La cámara viaja de la casa de Rafael a la oficina de Laura. Su teléfono vibra con la notificación “✓ Rafael tomó su Metformina · 8:06”. Después, en pantalla dividida, el caso contrario: “Sin confirmación a las 20:30 → aviso” | En otro lugar, su hija Laura recibe la confirmación en su teléfono. Y si una toma queda sin evidencia después de treinta minutos, ella recibe un aviso para llamarle. Así el cuidador no tiene que vigilar todo el día. | Elsewhere, his daughter Laura gets the confirmation on her phone. And if a dose has no evidence after thirty minutes, she gets an alert to give him a call. So caregivers don't have to keep watch all day. |
| 6 · Lo que ve usted | 1:38–1:58 | Reporte de consulta marcado como “ejemplo ficticio”: hora real, retraso, fuente y confianza. Se resalta “la dosis de las 20:00 falla con más frecuencia” | En consulta, usted ve cada dosis con su hora real, su retraso, cómo se confirmó y con qué confianza. Y los patrones: por ejemplo, que la dosis de la noche es la que más falla. Así puede ajustar el esquema antes de subir la dosis. | In clinic, you see every dose with its actual time, delay, how it was confirmed and with what confidence. And the patterns: for example, that the evening dose is the one most often missed. So you can adjust the regimen before increasing the dose. |
| 7 · Evidencia y límites | 1:58–2:14 | Tarjeta DoseMate (2024): 20 participantes, 94–95 % de exactitud balanceada. Abajo: “Sin confirmar ≠ no tomada · No es un dispositivo médico” | El reconocimiento de la toma con reloj ya se probó en un estudio en vida real, DoseMate, con noventa y cuatro a noventa y cinco por ciento de exactitud balanceada. Aun así, sin confirmar no significa no tomada, y MediTrack no es un dispositivo médico: es un apoyo a la adherencia. | Wrist-based pill-taking detection has already been tested in a real-world study, DoseMate, with ninety-four to ninety-five percent balanced accuracy. Even so, unconfirmed doesn't mean not taken, and MediTrack is not a medical device: it supports adherence. |
| 8 · Pruébelo | 2:14–2:30 | Captura del prototipo, su dirección web, el QR y la invitación a explorar la app (sin registro) | Puede probar el prototipo en la web: christopher argenis punto github punto io, diagonal MediTrack. O escanee este código. Le invitamos a revisar la app y explorar cómo funciona MediTrack. Gracias. | You can try the prototype online at christopher argenis dot github dot io, slash MediTrack. Or scan this code. We invite you to explore the app and see how MediTrack works. Thank you. |

En pantalla, la dirección siempre aparece completa: **christopherargenis.github.io/MediTrack/prototipo.html**.

## Audio

- Narración con Kokoro local, con el mismo filtro y las mismas pausas que Alex en el repo.
- Música suave en bucle (sintetizada con `make_audio.py`, sin derechos de terceros) a −24 dB, más un efecto corto de vibración cuando vibran el reloj o el teléfono.

## Correcciones del 24/11/2026

- **Rafael:** al tomar la pastilla y el vaso, la mano estaba al revés. Se corrigió el giro de la muñeca (tapa 180°, pastilla 165°, vaso y beber 120°) y la postura para tomar el vaso: el brazo va al costado y el antebrazo hacia la mesita, así el vaso queda de pie. Los giros se eligieron con `src/PruebaManos.tsx`.
- **Laura:** el teléfono estaba al revés. Ahora tiene la pantalla hacia ella y la parte de arriba del teléfono hacia la punta de los dedos.
- **Escena de Laura:** se divide en 3 columnas; el teléfono ampliado ocupa el tercio izquierdo y la escena 3D los otros dos.
- **Cierre:** ya no se buscan médicos para un piloto. Ahora se invita a revisar y explorar la app.

## Sugerencias aprobadas

1. **Aviso de confirmación opcional al cuidador:** interruptor en *Ajustes* del prototipo, mencionado en los documentos y con el campo `Caregiver.notify_on_confirm` en el esquema.
2. **Subtítulos integrados en el video**, más un archivo `.srt` por idioma.
3. **Código QR** en la pantalla final, que lleva a `christopherargenis.github.io/MediTrack/prototipo.html`.

## Entregables

- `video/out/meditrack-medicos-es.mp4`
- `video/out/meditrack-medicos-en.mp4`
- `video/out/meditrack-medicos-es.srt` y `video/out/meditrack-medicos-en.srt`
- El código de Remotion queda en `video/` y no afecta GitHub Pages.
