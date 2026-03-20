# Low Poly Generator (PolyCss)

Browser‑based low‑poly generator. Import an image and export:
- `lowpoly.png` (preview)
- `lowpoly.json` (triangle metadata)

## Setup

Install dependencies:
```bash
npm install
```

Run dev server:
```bash
npm start
```

Open `http://localhost:8080`.

## JSON Export
The export includes canvas size, triangulation settings, and triangle data:
```json
{
  "canvas": { "width": 1200, "height": 800 },
  "triangulation": { "type": "grid", "variance": 0.15, "cellSize": 90, "depth": 0, "dither": 0, "seed": 42 },
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
- Triangulation is grid‑based in this fork.
- `canvas.width/height` is the native resolution used by the physics viewer.

## Credits
Original work by Charles Ojukwu (cojdev):
- https://github.com/cojdev
- https://cojdev.github.io/lowpoly

## What We Changed
- Added JSON export for triangle metadata (vertices, centroid, color)
- Added a separate JSON physics viewer in this repo
- Tweaked UI styling to differentiate this fork
