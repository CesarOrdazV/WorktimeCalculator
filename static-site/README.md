# Horas laborales

Sitio estático para calcular **cuántas horas deberías llevar** entre dos fechas: 8 horas por cada día laborable (lunes a viernes, sin los festivos de la lista).

No hay backend, build ni dependencias. GitHub Pages sirve los archivos tal cual.

## Uso local

Abre `index.html` en el navegador, o desde la carpeta del repo:

```bash
python3 -m http.server 8080
```

Luego ve a `http://localhost:8080`.

## GitHub Pages

Después del primer push a `main`:

1. Repo → **Settings** → **Pages**.
2. **Source**: GitHub Actions (este repo incluye `.github/workflows/pages.yml`).
3. Espera el workflow **Deploy to GitHub Pages**.
4. La URL queda en:

   `https://<usuario>.github.io/<nombre-del-repo>/`

Si prefieres no usar Actions: Source → **Deploy from a branch** → `main` → folder `/` (root).

Los enlaces del sitio son relativos (`styles.css`, `worktime.js`). Funciona como *project site* (`usuario.github.io/repo/`) o como sitio de usuario si el repo se llama `<usuario>.github.io`.

## Reglas

- Rango de fechas **inclusive**.
- Laborable = lunes–viernes y **no** está en `HOLIDAYS` (`worktime.js`).
- Horas esperadas = `8 × días laborables`.
- Diferencia = horas trabajadas − esperadas (rojo y signo menos si vas atrasado).
- Promedio diario = trabajadas ÷ días laborables (`—` si no hay días).
- Formato de tiempo: `h:mm` (minutos con dos dígitos).

Festivos actuales (año 2025, lista de la app MAUI original):

```
2025-01-01
2025-02-03
2025-03-17
2025-04-17
2025-04-18
2025-05-01
2025-09-16
2025-11-18
2025-12-25
```

Para 2026 u otro país, añade fechas ISO (`YYYY-MM-DD`) al arreglo `HOLIDAYS` en `worktime.js`.

Para cambiar las 8 horas/día, edita `HOURS_PER_DAY` en el mismo archivo.

## Archivos

| Archivo | Rol |
|---------|-----|
| `index.html` | Página |
| `styles.css` | Estilos |
| `worktime.js` | Cálculo (sin DOM) |
| `app.js` | Formulario |
| `.nojekyll` | Evita que Pages pase Jekyll |
| `.github/workflows/pages.yml` | Publicación |

## Comprobar el cálculo (Node)

```bash
node --test worktime.test.js
```
