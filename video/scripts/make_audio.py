"""Música en bucle y efectos originales (sintetizados, sin derechos de terceros).

    python3 scripts/make_audio.py

Basado en scripts/make_audio.py de Py_UniversoDC_YT (bucle exacto de 16 compases).
Salida: public/musica/calma.wav, public/sfx/vibra.wav, public/sfx/notif.wav.
"""
import os, wave
import numpy as np

SR = 44100
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")


def save(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(out, start, sig):
    idx = (start + np.arange(len(sig))) % len(out)
    np.add.at(out, idx, sig)


def loop(bpm, chords, compases=16):
    beat = 60 / bpm; bar = beat * 4
    out = np.zeros(int(round(compases * bar * SR)))
    for i in range(compases):
        ch = chords[i % len(chords)]
        s = int(i * bar * SR)
        L = int(bar * SR) + int(0.6 * SR); t = np.arange(L) / SR
        pad = sum(np.sin(2 * np.pi * note(m) * t) + 0.25 * np.sin(2 * np.pi * note(m) * 2.003 * t) for m in ch)
        fade = np.minimum(1, t / 0.6) * np.clip((bar + 0.6 - t) / 0.6, 0, 1)
        add(out, s, 0.05 * pad * fade)
        for k in range(2):  # bajo cada dos tiempos
            L2 = int(2 * beat * SR); t2 = np.arange(L2) / SR
            add(out, s + int(k * 2 * beat * SR), 0.12 * np.sin(2 * np.pi * note(ch[0] - 12) * t2) * np.exp(-t2 / 0.8))
        for k in range(8):  # arpegio suave tipo piano
            m = ch[(k * 2 + i) % len(ch)] + 12
            L3 = int(0.6 * SR); t3 = np.arange(L3) / SR
            tono = np.sin(2 * np.pi * note(m) * t3) + 0.3 * np.sin(2 * np.pi * note(m) * 2 * t3)
            add(out, s + int(k * beat / 2 * SR), 0.035 * tono * env(L3, 0.003, 0.25))
    return out / max(1e-9, np.abs(out).max()) * 0.8


def vibra():
    """Dos pulsos de vibración (motor háptico): zumbido grave con modulación."""
    d = 0.75; t = np.arange(int(d * SR)) / SR
    pulso = ((t % 0.4) < 0.22).astype(float)
    pulso = np.convolve(pulso, np.ones(300) / 300, "same")
    z = np.sin(2 * np.pi * 165 * t) + 0.5 * np.sin(2 * np.pi * 330 * t + 0.3) + 0.2 * np.sign(np.sin(2 * np.pi * 165 * t))
    return 0.55 * z * pulso


def notif():
    """Aviso suave de dos notas (sol5 → do6)."""
    out = np.zeros(int(0.9 * SR))
    for k, m in enumerate((79, 84)):
        L = int(0.6 * SR); t = np.arange(L) / SR
        s = int(k * 0.14 * SR)
        out[s:s + L] += 0.35 * (np.sin(2 * np.pi * note(m) * t) + 0.2 * np.sin(2 * np.pi * note(m) * 3 * t)) * env(L, 0.004, 0.18)
    return out


save(os.path.join(ROOT, "musica", "calma.wav"), loop(80, [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]))
save(os.path.join(ROOT, "sfx", "vibra.wav"), vibra())
save(os.path.join(ROOT, "sfx", "notif.wav"), notif())
print("audio ok")
