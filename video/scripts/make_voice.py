"""Narración con Kokoro (local y gratis) + línea de tiempo + subtítulos .srt.

    python3 scripts/make_voice.py            # ambos idiomas
    python3 scripts/make_voice.py es         # solo español

Escribe:
  public/voz/<idioma>/<frase>.wav     audio de cada frase (44.1 kHz, filtrado)
  src/tiempos.json                    inicio y duración de cada escena y frase, en fotogramas (30 fps)
  out/meditrack-medicos-<idioma>.srt  subtítulos

Voces (mismas reglas que Py_UniversoDC_YT):
  es · alex_nicola = 70 % em_alex + 30 % im_nicola, español, pausas naturales, filtro limpio
  en · fenrir      = am_fenrir, inglés de EE. UU. (voz entrenada en inglés nativo), mismo filtro
Modelo: kokoro-v1.0.onnx y voices-v1.0.bin en ~/.cache/hyperframes/tts
(https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
"""
import json, os, subprocess, sys
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FPS = 30
FILTRO = ("highpass=f=70,equalizer=f=200:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.5:g=-1.5,"
          "highshelf=f=7000:g=-5,acompressor=threshold=-20dB:ratio=2:attack=12:release=180,"
          "loudnorm=I=-16:TP=-1.5")
PAUSAS = {"clause_pause": 0.15, "sentence_pause": 0.35}
PERFILES = {
    "alex_nicola": {"voz": {"em_alex": 0.7, "im_nicola": 0.3}, "lang": "es", "velocidad": 0.9},
    "fenrir": {"voz": "am_fenrir", "lang": "en-us", "velocidad": 0.92},
}
# Tiempo mínimo por escena (segundos) para que quepa la animación 3D, y silencios.
MINIMO = {"rafael": 34, "laura": 22}
ENTRADA, ENTRE, SALIDA = 0.5, 0.45, 0.8


def estilo(k, voz):
    if isinstance(voz, str):
        return voz
    t = sum(voz.values())
    return sum(k.get_voice_style(n) * (w / t) for n, w in voz.items())


def srt_t(seg):
    ms = int(round(seg * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    idiomas = sys.argv[1:] or ["es", "en"]
    M = os.path.expanduser("~/.cache/hyperframes/tts")
    k = Kokoro(os.path.join(M, "kokoro-v1.0.onnx"), os.path.join(M, "voices-v1.0.bin"))
    tpath = os.path.join(ROOT, "src", "tiempos.json")
    tiempos = json.load(open(tpath)) if os.path.exists(tpath) else {}
    for lang in idiomas:
        g = json.load(open(os.path.join(ROOT, "src", "guiones", f"{lang}.json"), encoding="utf-8"))
        pf = PERFILES[g["voz"]]
        carpeta = os.path.join(ROOT, "public", "voz", lang)
        os.makedirs(carpeta, exist_ok=True)
        t = 0.0
        escenas, srt, n = [], [], 1
        for e in g["escenas"]:
            ini = t
            t += ENTRADA
            frases = []
            for f in e["frases"]:
                destino = os.path.join(carpeta, f["id"] + ".wav")
                s, sr = k.create(f["voz"], voice=estilo(k, pf["voz"]), speed=pf["velocidad"], lang=pf["lang"], **PAUSAS)
                crudo = destino + ".raw.wav"
                sf.write(crudo, s, sr)
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", crudo, "-af", FILTRO, "-ar", "44100", destino], check=True)
                os.remove(crudo)
                dur = sf.info(destino).duration
                frases.append({"id": f["id"], "from": round(t * FPS), "dur": round(dur * FPS)})
                srt.append(f"{n}\n{srt_t(t)} --> {srt_t(t + dur)}\n{f['sub']}\n")
                n += 1
                t += dur + ENTRE
            t += SALIDA - ENTRE
            t = max(t, ini + MINIMO.get(e["id"], 0))
            escenas.append({"id": e["id"], "from": round(ini * FPS), "dur": round(t * FPS) - round(ini * FPS), "frases": frases})
            print(f"{lang} {e['id']:<10} {t - ini:5.1f} s")
        tiempos[lang] = {"total": round(t * FPS), "escenas": escenas}
        os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
        with open(os.path.join(ROOT, "out", f"meditrack-medicos-{lang}.srt"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(srt))
        print(f"{lang}: total {t:.1f} s ({t / 60:.2f} min)")
    json.dump(tiempos, open(tpath, "w"), indent=1)


if __name__ == "__main__":
    main()
