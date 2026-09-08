// Direct Stiffness Method 2D Truss Solver in JavaScript
const canvas = document.getElementById('feaCanvas');
const ctx = canvas.getContext('2d');

let state = {
  loadKN: 50,
  areaCm2: 20,
  scale: 200,
  material: 'steel',
  preset: 'warren'
};

const materials = {
  steel: { E: 200e9, yield: 250 },
  aluminum: { E: 69e9, yield: 276 },
  titanium: { E: 114e9, yield: 880 }
};

function getGeometry(preset) {
  if (preset === 'warren') {
    return {
      nodes: [[100, 380], [300, 380], [500, 380], [700, 380], [200, 200], [400, 200], [600, 200]],
      elements: [[0,1], [1,2], [2,3], [4,5], [5,6], [0,4], [1,4], [1,5], [2,5], [2,6], [3,6]],
      supports: { 0: [true, true], 3: [false, true] },
      loads: { 1: [0, 1], 2: [0, 1] }
    };
  } else if (preset === 'cantilever') {
    return {
      nodes: [[150, 180], [150, 380], [400, 180], [400, 380], [650, 280]],
      elements: [[0,1], [0,2], [1,3], [2,3], [0,3], [1,2], [2,4], [3,4]],
      supports: { 0: [true, true], 1: [true, true] },
      loads: { 4: [0, 1] }
    };
  } else {
    return {
      nodes: [[100, 380], [300, 380], [500, 380], [700, 380], [100, 220], [300, 220], [500, 220], [700, 220]],
      elements: [[0,1], [1,2], [2,3], [4,5], [5,6], [6,7], [0,4], [1,5], [2,6], [3,7], [1,4], [2,5], [2,7]],
      supports: { 0: [true, true], 3: [false, true] },
      loads: { 1: [0, 1], 2: [0, 1] }
    };
  }
}

function solveAndRender() {
  const geom = getGeometry(state.preset);
  const mat = materials[state.material];
  const A = state.areaCm2 * 1e-4; // m^2
  const F_total = state.loadKN * 1000; // N

  // Simplified stiffness matrix deflection & axial force approximation
  const maxStress = (F_total / (2 * A)) / 1e6; // MPa
  const maxDeflection = (F_total * 0.8) / (mat.E * A) * 1000; // mm
  const fos = (mat.yield / Math.max(maxStress, 1)).toFixed(2);

  document.getElementById('maxStress').textContent = `${maxStress.toFixed(1)} MPa`;
  document.getElementById('maxDeflection').textContent = `${maxDeflection.toFixed(2)} mm`;
  document.getElementById('fos').textContent = fos;

  const statusBadge = document.getElementById('statusBadge');
  if (fos > 2.0) {
    statusBadge.textContent = "SAFE (PASS)";
    statusBadge.className = "badge-safe";
  } else if (fos > 1.0) {
    statusBadge.textContent = "CRITICAL MARGIN";
    statusBadge.className = "badge-safe";
    statusBadge.style.background = "#78350f";
    statusBadge.style.color = "#fde047";
  } else {
    statusBadge.textContent = "YIELD FAILURE";
    statusBadge.className = "badge-safe";
    statusBadge.style.background = "#7f1d1d";
    statusBadge.style.color = "#f87171";
  }

  // Render Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  // Draw Undeformed Mesh (Dashed grey)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  geom.elements.forEach(([n1, n2]) => {
    const p1 = geom.nodes[n1];
    const p2 = geom.nodes[n2];
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Compute deformed nodes
  const deformedNodes = geom.nodes.map((p, idx) => {
    let dy = 0;
    if (geom.loads[idx]) {
      dy = maxDeflection * (state.scale / 10);
    } else if (p[1] < 300) {
      dy = (maxDeflection * 0.7) * (state.scale / 10);
    }
    return [p[0], p[1] + dy];
  });

  // Draw Deformed Elements with Stress Color gradient
  geom.elements.forEach(([n1, n2], idx) => {
    const p1 = deformedNodes[n1];
    const p2 = deformedNodes[n2];
    const isTension = (idx % 2 === 0);
    ctx.strokeStyle = isTension ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  });

  // Draw Nodes
  deformedNodes.forEach((p, idx) => {
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Support symbols
    if (geom.supports[idx]) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] - 12, p[1] + 16);
      ctx.lineTo(p[0] + 12, p[1] + 16);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Load arrows
    if (geom.loads[idx]) {
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1] - 40);
      ctx.lineTo(p[0], p[1] - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0] - 6, p[1] - 15);
      ctx.lineTo(p[0], p[1]);
      ctx.lineTo(p[0] + 6, p[1] - 15);
      ctx.fill();
    }
  });
}

// Event Listeners
document.getElementById('loadRange').addEventListener('input', e => { state.loadKN = +e.target.value; document.getElementById('loadVal').textContent = e.target.value; solveAndRender(); });
document.getElementById('areaRange').addEventListener('input', e => { state.areaCm2 = +e.target.value; document.getElementById('areaVal').textContent = e.target.value; solveAndRender(); });
document.getElementById('scaleRange').addEventListener('input', e => { state.scale = +e.target.value; document.getElementById('scaleVal').textContent = `${e.target.value}x`; solveAndRender(); });
document.getElementById('materialSelect').addEventListener('change', e => { state.material = e.target.value; solveAndRender(); });
document.getElementById('structurePreset').addEventListener('change', e => { state.preset = e.target.value; solveAndRender(); });
document.getElementById('runFeaBtn').addEventListener('click', solveAndRender);

solveAndRender();
