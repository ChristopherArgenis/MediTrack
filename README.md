# MediTrack
Adherencia a medicamentos con smartwatch: recordatorio en la muñeca, confirmación
automática por gesto de ingesta (ML) y aviso escalonado al cuidador.

**Sitio (GitHub Pages):** https://christopherargenis.github.io/MediTrack/

## Contenido

| Ruta | Qué es |
|---|---|
| `index.html` | Portada del sitio con enlaces a todo |
| `prototipo.html` | Prototipo interactivo: smartwatch (tipo Fitbit Sense 2) + app móvil + señal IMU simulada + clasificador + aviso al cuidador. Datos en memoria |
| `documento.html` / `documento.pdf` | Documento de proyecto: problema, objetivos, público objetivo, lineamientos, hardware, arquitectura, datos, modelo, BD, métricas, riesgos y hoja de ruta |
| `presentacion.html` / `presentacion.pdf` | Presentación de 16 diapositivas (← → para navegar, F para pantalla completa) |
| `flujo.html` / `img/flujo.png` | Diapositiva única con el flujo de una toma y sus conexiones |
| `db/schema.sql` | Esquema SQLite (tablas originales + correcciones) |
| `db/test_schema.py` | Prueba del esquema con datos de ejemplo |
| `assets/` | Tema visual compartido y logo |

## Publicar en GitHub Pages

Settings → Pages → *Build and deployment* → Source: **Deploy from a branch** → Branch: `main` / `(root)`.

## Probar el esquema

```bash
python3 db/test_schema.py
```

## Regenerar PDF y PNG

Las exportaciones se hacen con Playwright (Chromium): `flujo.html?raw=1` a 1920×1080 para el PNG
y la vista de impresión de `presentacion.html` y `documento.html` para los PDF.
