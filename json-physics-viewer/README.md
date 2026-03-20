# JSON Physics Viewer

Loads a low‑poly JSON export and applies hover physics: the cursor pushes triangles away and they spring back to their base positions.

## Run
```bash
python -m http.server 5173
```
Open `http://localhost:5173`.

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

Notes:
- The viewer locks its canvas size to `canvas.width/height` from the JSON.
- Colors are rendered using RGBA from the export.

## Credits
The JSON format is produced by our fork of Charles Ojukwu (cojdev)’s low‑poly generator:
- https://github.com/cojdev
- https://cojdev.github.io/lowpoly
