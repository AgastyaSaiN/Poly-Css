# Correct Low Poly JSON

Browser editor to inspect and fix triangle colors in low‑poly JSON exports.

## Features
- Load JSON export from the generator
- Click a triangle to see its properties
- Zoom with mouse wheel
- Edit triangle color and export corrected JSON

## Run
```bash
python -m http.server 5174
```
Open `http://localhost:5174`.

## Expected JSON shape
```json
{
  "canvas": { "width": 1200, "height": 800 },
  "triangles": [
    {
      "id": 0,
      "vertices": [[x1,y1,z1],[x2,y2,z2],[x3,y3,z3]],
      "centroid": [cx, cy],
      "color": { "r": 120, "g": 98, "b": 210, "a": 255 }
    }
  ]
}
```
