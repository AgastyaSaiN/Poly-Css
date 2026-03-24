# PolyCss

Three small browser apps that work together:

1. **Low‑poly generator** — import an image and export a triangle JSON file (plus PNG preview).
2. **JSON physics viewer** — load that JSON and interact with it; triangles push away from the cursor and spring back.
3. **Correct Low Poly JSON** — load JSON, inspect/select triangles, fix colors, export corrected JSON.

## Projects

### 1) Low‑poly generator
Location: `lowpoly-master from github/`

What it does:
- Takes an image input
- Generates a low‑poly triangle mesh
- Exports a **PNG** and **JSON** (triangle coordinates, centroid, color)

Run it:
```bash
cd "lowpoly-master from github"
npm install
npm start
```
Open `http://localhost:8080`.

### 2) JSON physics viewer
Location: `json-physics-viewer/`

What it does:
- Loads a JSON export from the generator
- Applies hover physics (repel + spring back)

Run it:
```bash
cd "json-physics-viewer"
python -m http.server 5173
```
Open `http://localhost:5173` and load a JSON file.

### 3) Correct Low Poly JSON
Location: `json-editor/`

What it does:
- Loads a JSON export from the generator
- Lets you select triangles and inspect properties
- Edit triangle color and export corrected JSON

Run it:
```bash
cd "json-editor"
python -m http.server 5174
```
Open `http://localhost:5174`.

## JSON format (export)
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
- `canvas.width/height` is the native resolution used by the viewer/editor.
- Triangles are currently grid‑generated (not Delaunay).

## Credits
Original work by Charles Ojukwu (cojdev). Links kept in the UI header/footer and in this repo:
- https://github.com/cojdev
- https://cojdev.github.io/lowpoly

## What We Changed
- Added JSON export for triangle metadata (vertices, centroid, color)
- Built a separate JSON physics viewer with hover‑repel and spring‑back
- Built a JSON editor to correct individual triangle colors
- Adjusted styling to differentiate the UI
- Updated documentation and project structure
