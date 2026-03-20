const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const resetBtn = document.getElementById('reset');
const hint = document.getElementById('hint');

let baseTriangles = [];
let bodies = [];
let canvasWidth = 0;
let canvasHeight = 0;

const mouse = {
  x: 0,
  y: 0,
  active: false,
};

const physics = {
  radius: 160,
  pushStrength: 0.8,
  returnStrength: 0.08,
  damping: 0.82,
  maxOffset: 120,
};

const resizeCanvas = (width, height, lockToJsonSize = false) => {
  const dpr = window.devicePixelRatio || 1;
  if (lockToJsonSize) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  canvas.width = Math.floor(displayWidth * dpr);
  canvas.height = Math.floor(displayHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  canvasWidth = width;
  canvasHeight = height;
};

const clear = () => {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
};

const drawTriangle = (triangle, offset) => {
  const { vertices, color } = triangle;

  ctx.beginPath();
  ctx.moveTo(vertices[0][0] + offset.x, vertices[0][1] + offset.y);
  ctx.lineTo(vertices[1][0] + offset.x, vertices[1][1] + offset.y);
  ctx.lineTo(vertices[2][0] + offset.x, vertices[2][1] + offset.y);
  ctx.closePath();
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fill();
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const updatePhysics = () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.save();
  ctx.scale(width / canvasWidth, height / canvasHeight);

  clear();

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    const base = baseTriangles[i];

    let fx = 0;
    let fy = 0;

    if (mouse.active) {
      const dx = body.centroid.x + body.offset.x - mouse.x;
      const dy = body.centroid.y + body.offset.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < physics.radius && dist > 0.001) {
        const force = (1 - dist / physics.radius) * physics.pushStrength * 10;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
    }

    fx += -body.offset.x * physics.returnStrength;
    fy += -body.offset.y * physics.returnStrength;

    body.velocity.x = (body.velocity.x + fx) * physics.damping;
    body.velocity.y = (body.velocity.y + fy) * physics.damping;

    body.offset.x = clamp(
      body.offset.x + body.velocity.x,
      -physics.maxOffset,
      physics.maxOffset
    );
    body.offset.y = clamp(
      body.offset.y + body.velocity.y,
      -physics.maxOffset,
      physics.maxOffset
    );

    drawTriangle(base, body.offset);
  }

  ctx.restore();
  requestAnimationFrame(updatePhysics);
};

const loadJson = async (file) => {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data?.triangles || !data?.canvas) {
    throw new Error('Invalid JSON format.');
  }

  baseTriangles = data.triangles.map((tri) => ({
    vertices: tri.vertices.map((v) => [v[0], v[1]]),
    centroid: { x: tri.centroid[0], y: tri.centroid[1] },
    color: tri.color,
  }));

  bodies = baseTriangles.map((tri) => ({
    centroid: { ...tri.centroid },
    offset: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  }));

  resizeCanvas(data.canvas.width, data.canvas.height, true);
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

resetBtn.addEventListener('click', () => {
  bodies.forEach((body) => {
    body.offset.x = 0;
    body.offset.y = 0;
    body.velocity.x = 0;
    body.velocity.y = 0;
  });
});

const updateMouse = (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvasWidth / rect.width;
  const scaleY = canvasHeight / rect.height;

  mouse.x = (event.clientX - rect.left) * scaleX;
  mouse.y = (event.clientY - rect.top) * scaleY;
};

canvas.addEventListener('mousemove', (event) => {
  mouse.active = true;
  updateMouse(event);
});

canvas.addEventListener('mouseleave', () => {
  mouse.active = false;
});

canvas.addEventListener('touchmove', (event) => {
  if (!event.touches[0]) return;
  mouse.active = true;
  updateMouse(event.touches[0]);
});

canvas.addEventListener('touchend', () => {
  mouse.active = false;
});

window.addEventListener('resize', () => {
  if (!canvasWidth || !canvasHeight) return;
  resizeCanvas(canvasWidth, canvasHeight);
});

resizeCanvas(1200, 800);
requestAnimationFrame(updatePhysics);
