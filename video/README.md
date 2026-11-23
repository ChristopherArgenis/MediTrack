# MediTrack · videos para médicos (ES / EN)

El mismo video en dos idiomas, hecho con **Remotion 4.0.541 + Three.js** (`@remotion/three`), con la misma forma de trabajo que `ChristopherArgenis/Py_UniversoDC_YT`.

| Archivo | Qué es |
|---|---|
| `out/meditrack-medicos-es.mp4` / `.srt` | Video en español (voz Alex: `alex_nicola`) y sus subtítulos |
| `out/meditrack-medicos-en.mp4` / `.srt` | Video en inglés (voz `am_fenrir`, inglés nativo) y sus subtítulos |
| `GUION.md` | Guion aprobado, escenas y decisiones |
| `src/guiones/{es,en}.json` | Única fuente del texto: `voz` (lo que se dice) y `sub` (lo que se lee), más los textos en pantalla (`ui`) |
| `src/three/` | Humanoides articulados sin rostro (`Humanoide.tsx`), poses, sala, oficina y objetos |
| `src/scenes/` | Escenas 2D y 3D |
| `scripts/` | Voz y línea de tiempo (`make_voice.py`), música y efectos (`make_audio.py`), render (`render.py`) y revisión de fotogramas (`fotogramas.mjs`) |

## Regenerar

Todo es gratis y local: Kokoro, ffmpeg y Chromium headless con WebGL por software.

```bash
npm install
pip install kokoro-onnx soundfile
python3 scripts/make_audio.py
python3 scripts/make_voice.py
python3 scripts/render.py
```

El modelo de Kokoro (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) va en `~/.cache/hyperframes/tts` (ver la cabecera de `make_voice.py`). `public/voz/` no se sube al repositorio porque se regenera.
