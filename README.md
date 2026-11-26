# MediTrack
Adherencia a medicamentos con smartwatch: recordatorio en la muñeca, confirmación
automática por gesto de ingesta (ML) y aviso escalonado al cuidador.

**Sitio (GitHub Pages):** https://christopherargenis.github.io/MediTrack/

## Contenido

| Ruta | Qué es |
|---|---|
| `index.html` | Portada del sitio con enlaces a todo |
| `prototipo.html` | Prototipo interactivo: 6 modelos de smartwatch, fusión de evidencias (gesto, secuencia, NFC, horario), app móvil, aviso al cuidador y comparativa de 8 relojes. Datos en memoria. `?reloj=fs2` abre un modelo concreto |
| `documentos.html` | Índice de los dos documentos |
| `doc-conceptual.html` / `.pdf` | Documento 1, conceptual/teórico: problema, objetivos, público, lineamientos, trabajos relacionados, validación y verificación de fuentes |
| `doc-tecnico.html` / `.pdf` | Documento 2, técnico/tecnológico: arquitectura, comparativa de relojes, APIs, fusión de evidencias, modelo, motor de estados, BD y código |
| `presentaciones.html` | Índice de las 4 presentaciones por público |
| `pres-academica.html` / `.pdf` | Académico: estado del arte, metodología, datos, BD, validación y verificación de fuentes (18 diapositivas) |
| `pres-medica.html` / `.pdf` | Médicos: reporte de consulta, alcance clínico, evidencia, privacidad y piloto (9) |
| `pres-inversion.html` / `.pdf` | Inversionistas: costo del problema, mercado, ventaja, costo de entrada, modelo de negocio (hipótesis), riesgos (10) |
| `pres-general.html` / `.pdf` | Público general: lenguaje sencillo, 3 pasos, familia, privacidad y qué reloj necesito (9) |
| `flujo.html` / `img/flujo.png` | Diapositiva única con el flujo de una toma y sus conexiones |
| `documento.html`, `presentacion.html` | Redirecciones de los enlaces antiguos |
| `notebooks/meditrack_modelo_cnn_lstm.ipynb` | Notebook ejecutado: datos de DoseMate (se descargan al correrlo), segmentación como el artículo, modelo CNN-LSTM, evaluación aleatoria y LOSO, personalización y fusión de evidencias. Abre en Google Colab sin instalar nada |
| `db/schema.sql` | Esquema SQLite (Device, IntakeRecord, Evidence, FusionDecision, ...) |
| `db/test_schema.py` | Prueba del esquema y de la fusión de evidencias |
| `assets/` | Tema visual, estilos de documentos, motor de presentaciones (`deck.css`, `deck.js`), `nav.js` y logo |

## Publicar en GitHub Pages

Settings → Pages → *Build and deployment* → Source: **Deploy from a branch** → Branch: `main` / `(root)`.

## Probar el esquema

```bash
python3 db/test_schema.py
```

## Regenerar PDF y PNG

Las exportaciones se hacen con Playwright (Chromium): `flujo.html?raw=1` a 1920×1080 para el PNG
y la vista de impresión de `pres-*.html`, `doc-conceptual.html` y `doc-tecnico.html` para los PDF.
