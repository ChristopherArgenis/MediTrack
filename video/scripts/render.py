"""Renderiza el video de un idioma (o ambos) y lo verifica.

    python3 scripts/render.py          # es y en
    python3 scripts/render.py en

1. Se niega si el guion no tiene "aprobado": true o si falta la voz de alguna frase.
2. Renderiza out/meditrack-medicos-<idioma>.mp4 con Remotion (WebGL por software para Three.js).
3. Revisa con ffprobe: 1920×1080, con audio, y duración igual a la línea de tiempo.
"""
import json, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
COMP = {"es": "MediTrack-Medicos-ES", "en": "MediTrack-Medicos-EN"}


def main():
    t = json.load(open(os.path.join(ROOT, "src", "tiempos.json")))
    for lang in sys.argv[1:] or ["es", "en"]:
        g = json.load(open(os.path.join(ROOT, "src", "guiones", f"{lang}.json"), encoding="utf-8"))
        if not g.get("aprobado"):
            sys.exit(f"El guion {lang} no está aprobado.")
        faltan = [f["id"] for e in g["escenas"] for f in e["frases"] if not os.path.exists(os.path.join(ROOT, "public", "voz", lang, f["id"] + ".wav"))]
        if faltan:
            sys.exit(f"Falta la voz ({lang}) de: {', '.join(faltan)}. Corre scripts/make_voice.py {lang}")
        out = os.path.join(ROOT, "out", f"meditrack-medicos-{lang}.mp4")
        subprocess.run(["npx", "remotion", "render", COMP[lang], out, "--gl=swangle", "--concurrency=4", "--crf=20", "--log=error"], cwd=ROOT, check=True)
        info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration,size", "-of", "json", out], capture_output=True, text=True, check=True).stdout)
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        audio = any(s["codec_type"] == "audio" for s in info["streams"])
        dur = float(info["format"]["duration"])
        esperado = t[lang]["total"] / 30
        print(f"{out}\n  {v['width']}×{v['height']} · {dur:.1f} s (esperado {esperado:.1f}) · audio: {'sí' if audio else 'NO'} · {int(info['format']['size']) / 1e6:.1f} MB")
        assert (v["width"], v["height"]) == (1920, 1080) and audio and abs(dur - esperado) < 0.5


if __name__ == "__main__":
    main()
