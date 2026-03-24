const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const exportBtn = document.getElementById('export');
const hint = document.getElementById('hint');
const canvasWrap = document.querySelector('.canvas-wrap');

const selectionEmpty = document.getElementById('selection-empty');
const selectionDetails = document.getElementById('selection-details');
const propId = document.getElementById('prop-id');
const propCentroid = document.getElementById('prop-centroid');
const propVertices = document.getElementById('prop-vertices');
const propColor = document.getElementById('prop-color');
const colorInput = document.getElementById('color-input');
const applyColorBtn = document.getElementById('apply-color');
const copyColorBtn = document.getElementById('copy-color');
const pasteColorBtn = document.getElementById('paste-color');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const deleteBtn = document.getElementById('delete-triangle');
const clipboardStatus = document.getElementById('clipboard-status');

let data = null;
let triangles = [];
let selectedIndex = -1;

let scale = 1;
let focusPoint = { x: 0, y: 0 };
let panAnim = null;
let panStart = 0;
let panFrom = { x: 0, y: 0 };
let panTo = { x: 0, y: 0 };

let clipboardColor = '';
let statusTimer = null;
let history = [];
let redoStack = [];

const setCanvasSize = (width, height) => {
  canvas.width = width;
  canvas.height = height;
  applyScale();
};

const applyScale = () => {
  const scaledWidth = Math.round(canvas.width * scale);
  const scaledHeight = Math.round(canvas.height * scale);
  canvas.style.width = `${scaledWidth}px`;
  canvas.style.height = `${scaledHeight}px`;
};

const clampScroll = () => {
  const maxX = Math.max(0, canvasWrap.scrollWidth - canvasWrap.clientWidth);
  const maxY = Math.max(0, canvasWrap.scrollHeight - canvasWrap.clientHeight);
  canvasWrap.scrollLeft = Math.min(Math.max(canvasWrap.scrollLeft, 0), maxX);
  canvasWrap.scrollTop = Math.min(Math.max(canvasWrap.scrollTop, 0), maxY);
};

const setStatus = (message) => {
  clipboardStatus.textContent = message;
  if (statusTimer) {
    clearTimeout(statusTimer);
  }
  statusTimer = setTimeout(() => {
    clipboardStatus.textContent = '';
  }, 1400);
};

const draw = () => {
  if (!data) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i];
    ctx.beginPath();
    ctx.moveTo(tri.vertices[0][0], tri.vertices[0][1]);
    ctx.lineTo(tri.vertices[1][0], tri.vertices[1][1]);
    ctx.lineTo(tri.vertices[2][0], tri.vertices[2][1]);
    ctx.closePath();
    ctx.fillStyle = `rgba(${tri.color.r}, ${tri.color.g}, ${tri.color.b}, ${tri.color.a / 255})`;
    ctx.fill();

    if (i === selectedIndex) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#111827';
      ctx.stroke();
    }
  }
};

const updateSelectionUI = () => {
  if (selectedIndex === -1) {
    selectionEmpty.classList.remove('hidden');
    selectionDetails.classList.add('hidden');
    return;
  }

  const tri = triangles[selectedIndex];
  selectionEmpty.classList.add('hidden');
  selectionDetails.classList.remove('hidden');

  propId.textContent = tri.id ?? selectedIndex;
  propCentroid.textContent = `${tri.centroid[0].toFixed(1)}, ${tri.centroid[1].toFixed(1)}`;
  propVertices.textContent = JSON.stringify(tri.vertices, null, 2);
  propColor.textContent = `rgba(${tri.color.r}, ${tri.color.g}, ${tri.color.b}, ${tri.color.a})`;
  colorInput.value = rgbToHex(tri.color);
};

const rgbToHex = (color) => {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
};

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    a: 255,
  };
};

const pointInTriangle = (p, a, b, c) => {
  const area = (p1, p2, p3) =>
    (p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1])) / 2;

  const A = Math.abs(area(a, b, c));
  const A1 = Math.abs(area(p, b, c));
  const A2 = Math.abs(area(a, p, c));
  const A3 = Math.abs(area(a, b, p));

  return Math.abs(A - (A1 + A2 + A3)) < 0.01;
};

const pickTriangle = (x, y) => {
  for (let i = triangles.length - 1; i >= 0; i--) {
    const tri = triangles[i];
    if (pointInTriangle([x, y], tri.vertices[0], tri.vertices[1], tri.vertices[2])) {
      return i;
    }
  }
  return -1;
};

const setFocusPoint = (worldX, worldY) => {
  focusPoint.x = worldX;
  focusPoint.y = worldY;

  const targetLeft = worldX * scale - canvasWrap.clientWidth / 2;
  const targetTop = worldY * scale - canvasWrap.clientHeight / 2;

  panFrom.x = canvasWrap.scrollLeft;
  panFrom.y = canvasWrap.scrollTop;
  panTo.x = targetLeft;
  panTo.y = targetTop;
  panStart = performance.now();

  if (panAnim) cancelAnimationFrame(panAnim);
  panAnim = requestAnimationFrame(animatePan);
};

const animatePan = (now) => {
  const duration = 180;
  const t = Math.min((now - panStart) / duration, 1);
  const ease = t * (2 - t);

  canvasWrap.scrollLeft = panFrom.x + (panTo.x - panFrom.x) * ease;
  canvasWrap.scrollTop = panFrom.y + (panTo.y - panFrom.y) * ease;
  clampScroll();

  if (t < 1) {
    panAnim = requestAnimationFrame(animatePan);
  } else {
    panAnim = null;
  }
};

const handleCanvasClick = (event) => {
  const rect = canvasWrap.getBoundingClientRect();
  const cursorX = event.clientX - rect.left;
  const cursorY = event.clientY - rect.top;
  const x = (canvasWrap.scrollLeft + cursorX) / scale;
  const y = (canvasWrap.scrollTop + cursorY) / scale;

  selectedIndex = pickTriangle(x, y);
  updateSelectionUI();
  draw();

  setFocusPoint(x, y);
};

const handleWheel = (event) => {
  if (!data) return;
  event.preventDefault();

  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
  const nextScale = Math.min(Math.max(scale * zoomFactor, 0.2), 6);
  if (nextScale === scale) return;

  scale = nextScale;
  applyScale();

  const targetLeft = focusPoint.x * scale - canvasWrap.clientWidth / 2;
  const targetTop = focusPoint.y * scale - canvasWrap.clientHeight / 2;

  canvasWrap.scrollLeft = targetLeft;
  canvasWrap.scrollTop = targetTop;
  clampScroll();
};

const setTriangleColor = (index, rgb, record = true) => {
  if (index === -1) return;

  const prev = triangles[index].color;
  if (
    prev.r === rgb.r &&
    prev.g === rgb.g &&
    prev.b === rgb.b &&
    prev.a === rgb.a
  ) {
    return;
  }

  if (record) {
    history.push({ type: 'color', index, prev: { ...prev }, next: { ...rgb } });
    redoStack = [];
  }

  triangles[index].color = { ...rgb };
  data.triangles[index].color = { ...rgb };
  updateSelectionUI();
  draw();
};

const deleteTriangle = (index, record = true) => {
  if (index === -1) return;
  const removed = triangles[index];
  if (!removed) return;

  if (record) {
    history.push({
      type: 'delete',
      index,
      triangle: JSON.parse(JSON.stringify(removed)),
    });
    redoStack = [];
  }

  triangles.splice(index, 1);
  data.triangles.splice(index, 1);

  selectedIndex = -1;
  updateSelectionUI();
  draw();
};

const applyColorFromHex = (hex) => {
  if (selectedIndex === -1) return;
  const rgb = hexToRgb(hex);
  setTriangleColor(selectedIndex, rgb, true);
};

const loadJson = async (file) => {
  const text = await file.text();
  data = JSON.parse(text);

  if (!data?.triangles || !data?.canvas) {
    throw new Error('Invalid JSON format.');
  }

  triangles = data.triangles.map((tri) => ({
    ...tri,
    vertices: tri.vertices.map((v) => [v[0], v[1]]),
  }));

  scale = 1;
  setCanvasSize(data.canvas.width, data.canvas.height);
  focusPoint = { x: data.canvas.width / 2, y: data.canvas.height / 2 };
  canvasWrap.scrollLeft = focusPoint.x * scale - canvasWrap.clientWidth / 2;
  canvasWrap.scrollTop = focusPoint.y * scale - canvasWrap.clientHeight / 2;
  clampScroll();

  selectedIndex = -1;
  updateSelectionUI();
  draw();

  hint.style.display = 'none';
};

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  loadJson(file).catch((err) => {
    hint.textContent = err.message;
    hint.style.display = 'block';
  });
});

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('wheel', handleWheel, { passive: false });

applyColorBtn.addEventListener('click', () => {
  if (selectedIndex === -1) return;
  applyColorFromHex(colorInput.value);
});

copyColorBtn.addEventListener('click', async () => {
  if (selectedIndex === -1) return;
  const hex = rgbToHex(triangles[selectedIndex].color);
  clipboardColor = hex;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(hex);
      setStatus('Color copied.');
      return;
    } catch (err) {
      // fallback to in-app clipboard
    }
  }

  setStatus('Color copied (local).');
});

pasteColorBtn.addEventListener('click', async () => {
  if (selectedIndex === -1) return;

  let hex = clipboardColor;

  if (!hex && navigator.clipboard?.readText) {
    try {
      hex = await navigator.clipboard.readText();
    } catch (err) {
      // ignore
    }
  }

  if (!hex) {
    setStatus('Clipboard empty.');
    return;
  }

  applyColorFromHex(hex);
  setStatus('Color pasted.');
});

undoBtn.addEventListener('click', () => {
  const last = history.pop();
  if (!last) return;
  redoStack.push(last);
  if (last.type === 'color') {
    setTriangleColor(last.index, last.prev, false);
  } else if (last.type === 'delete') {
    triangles.splice(last.index, 0, last.triangle);
    data.triangles.splice(last.index, 0, last.triangle);
    selectedIndex = last.index;
    updateSelectionUI();
    draw();
  }
});

redoBtn.addEventListener('click', () => {
  const item = redoStack.pop();
  if (!item) return;
  history.push(item);
  if (item.type === 'color') {
    setTriangleColor(item.index, item.next, false);
  } else if (item.type === 'delete') {
    deleteTriangle(item.index, false);
  }
});

deleteBtn.addEventListener('click', () => {
  if (selectedIndex === -1) return;
  deleteTriangle(selectedIndex, true);
});

window.addEventListener('keydown', (event) => {
  if (selectedIndex === -1) return;
  if (event.key === 'Delete' || event.key === 'Backspace') {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    deleteTriangle(selectedIndex, true);
  }
});

exportBtn.addEventListener('click', () => {
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'corrected-lowpoly.json';
  a.click();
  URL.revokeObjectURL(url);
});

setCanvasSize(1200, 800);
