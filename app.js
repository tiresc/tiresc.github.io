const canvas = document.querySelector("[data-canvas]");
const ctx = canvas.getContext("2d");

const ui = {
  kind: document.querySelector("[data-kind]"),
  size: document.querySelector("[data-size]"),
  view: document.querySelector("[data-view]"),
  status: document.querySelector("[data-status]"),
  autoButton: document.querySelector('[data-action="auto"]'),
  hiddenButton: document.querySelector('[data-action="hidden"]'),
  guidesButton: document.querySelector('[data-action="guides"]'),
};

const faceDefinitions = [
  { name: "near", indices: [0, 2, 3, 1] },
  { name: "far", indices: [4, 5, 7, 6] },
  { name: "left", indices: [0, 4, 6, 2] },
  { name: "right", indices: [1, 3, 7, 5] },
  { name: "top", indices: [2, 6, 7, 3] },
  { name: "bottom", indices: [0, 1, 5, 4] },
];

const edges = buildEdges(faceDefinitions);
const guideEdgePairs = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [0, 2],
  [1, 3],
  [4, 6],
  [5, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const state = {
  current: null,
  animation: null,
  autoShuffle: false,
  showHidden: true,
  showGuides: false,
  autoTimer: 0,
  rafId: 0,
  view: { width: 0, height: 0 },
};

function buildEdges(faces) {
  const map = new Map();

  for (const face of faces) {
    const { indices, name } = face;

    for (let i = 0; i < indices.length; i += 1) {
      const a = indices[i];
      const b = indices[(i + 1) % indices.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;

      if (!map.has(key)) {
        map.set(key, { key, indices: [a, b], faces: [] });
      }

      map.get(key).faces.push(name);
    }
  }

  return Array.from(map.values());
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  const tau = Math.PI * 2;
  let delta = (b - a) % tau;

  if (delta > Math.PI) {
    delta -= tau;
  } else if (delta < -Math.PI) {
    delta += tau;
  }

  return a + delta * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(vector, amount) {
  return { x: vector.x * amount, y: vector.y * amount, z: vector.z * amount };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function magnitude(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function normalize(vector) {
  const length = magnitude(vector);

  if (length < 0.00001) {
    return { x: 0, y: 0, z: 0 };
  }

  return scale(vector, 1 / length);
}

function isPointInside(point, bounds) {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

function averagePoints(points) {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      z: sum.z + point.z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
    z: total.z / points.length,
  };
}

function rotatePoint(point, rotation) {
  let { x, y, z } = point;

  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  let nextY = y * cosX - z * sinX;
  let nextZ = y * sinX + z * cosX;
  y = nextY;
  z = nextZ;

  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  let nextX = x * cosY + z * sinY;
  nextZ = -x * sinY + z * cosY;
  x = nextX;
  z = nextZ;

  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);
  nextX = x * cosZ - y * sinZ;
  nextY = x * sinZ + y * cosZ;

  return { x: nextX, y: nextY, z };
}

function createBoxVertices(dimensions) {
  const hx = dimensions.x / 2;
  const hy = dimensions.y / 2;
  const hz = dimensions.z / 2;

  return [
    { x: -hx, y: -hy, z: -hz },
    { x: hx, y: -hy, z: -hz },
    { x: -hx, y: hy, z: -hz },
    { x: hx, y: hy, z: -hz },
    { x: -hx, y: -hy, z: hz },
    { x: hx, y: -hy, z: hz },
    { x: -hx, y: hy, z: hz },
    { x: hx, y: hy, z: hz },
  ];
}

function projectPoint(point, focalLength, origin) {
  const safeZ = Math.max(point.z, 1);
  const scale = focalLength / safeZ;

  return {
    x: origin.x + point.x * scale,
    y: origin.y - point.y * scale,
    z: point.z,
  };
}

function describeView(rotation) {
  const tilt = Math.abs(rotation.x);
  const roll = Math.abs(rotation.z);

  if (tilt > 0.38) {
    return roll > 0.08 ? "Three-point drift" : "Three-point tilt";
  }

  return roll > 0.08 ? "Two-point drift" : "Two-point view";
}

function formatStatus() {
  if (state.showHidden && state.showGuides) {
    return "Hidden lines + guides";
  }

  if (state.showHidden) {
    return "Hidden lines visible";
  }

  if (state.showGuides) {
    return "Perspective guides visible";
  }

  return "Clean silhouette view";
}

function formatKind(kind) {
  if (kind === "cube") {
    return "Cube";
  }

  if (kind === "cylinder") {
    return "Cylinder";
  }

  return "Box";
}

function countVisibleFaces(exercise) {
  const worldVertices = createBoxVertices(exercise.dimensions).map((vertex) =>
    add(rotatePoint(vertex, exercise.rotation), exercise.center),
  );
  const visibility = classifyFaces(worldVertices);

  return Array.from(visibility.values()).filter(Boolean).length;
}

function isReadableCylinder(exercise) {
  const axis = normalize(rotatePoint({ x: 0, y: 1, z: 0 }, exercise.rotation));
  const viewer = normalize(scale(exercise.center, -1));

  return Math.abs(dot(axis, viewer)) > 0.28;
}

function getRenderFamily(kind) {
  return kind === "cylinder" ? "cylinder" : "box";
}

function resolveExerciseKind(mode) {
  if (mode === "cube" || mode === "box" || mode === "cylinder") {
    return mode;
  }

  const roll = Math.random();

  if (roll < 0.26) {
    return "cube";
  }

  if (roll < 0.56) {
    return "cylinder";
  }

  return "box";
}

function buildExerciseCandidate(mode = "random") {
  const kind = resolveExerciseKind(mode);
  const base = randomBetween(170, 290);

  let dimensions;

  if (kind === "cube") {
    dimensions = { x: base, y: base, z: base };
  } else if (kind === "cylinder") {
    dimensions = {
      x: randomBetween(130, 235),
      y: randomBetween(190, 330),
      z: 0,
    };
    dimensions.z = dimensions.x;
  } else {
    dimensions = {
      x: base,
      y: randomBetween(130, 300),
      z: randomBetween(140, 300),
    };
  }

  const xTilt = randomBetween(0.34, 0.82) * randomFrom([-1, 1]);
  const yTurn = randomBetween(0.58, 1.08) * randomFrom([-1, 1]);
  const zRoll = randomBetween(-0.14, 0.14);

  return {
    kind,
    dimensions,
    rotation: { x: xTilt, y: yTurn, z: zRoll },
    center: {
      x: randomBetween(-45, 45),
      y: randomBetween(-28, 28),
      z: randomBetween(780, 1080),
    },
  };
}

function createExercise(mode = "random") {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = buildExerciseCandidate(mode);

    const isReadable =
      candidate.kind === "cylinder"
        ? isReadableCylinder(candidate)
        : countVisibleFaces(candidate) === 3;

    if (isReadable) {
      return candidate;
    }
  }

  return buildExerciseCandidate(mode);
}

function interpolateExercise(from, to, t, kind = t < 0.5 ? from.kind : to.kind) {
  return {
    kind,
    dimensions: {
      x: lerp(from.dimensions.x, to.dimensions.x, t),
      y: lerp(from.dimensions.y, to.dimensions.y, t),
      z: lerp(from.dimensions.z, to.dimensions.z, t),
    },
    rotation: {
      x: lerpAngle(from.rotation.x, to.rotation.x, t),
      y: lerpAngle(from.rotation.y, to.rotation.y, t),
      z: lerpAngle(from.rotation.z, to.rotation.z, t),
    },
    center: {
      x: lerp(from.center.x, to.center.x, t),
      y: lerp(from.center.y, to.center.y, t),
      z: lerp(from.center.z, to.center.z, t),
    },
  };
}

function updateInfo(exercise) {
  ui.kind.textContent = formatKind(exercise.kind);
  ui.size.textContent =
    exercise.kind === "cylinder"
      ? `${Math.round(exercise.dimensions.x)} dia × ${Math.round(exercise.dimensions.y)} h`
      : `${Math.round(exercise.dimensions.x)} × ${Math.round(exercise.dimensions.y)} × ${Math.round(exercise.dimensions.z)}`;
  ui.view.textContent = describeView(exercise.rotation);
  ui.status.textContent = formatStatus();
  ui.hiddenButton.textContent = state.showHidden ? "Hidden Lines On" : "Hidden Lines Off";
  ui.hiddenButton.setAttribute("aria-pressed", String(state.showHidden));
  ui.guidesButton.textContent = state.showGuides ? "Guides On" : "Guides Off";
  ui.guidesButton.setAttribute("aria-pressed", String(state.showGuides));
  ui.autoButton.setAttribute("aria-pressed", String(state.autoShuffle));
}

function ensureCanvasSize() {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.view = { width, height };
}

function getAnimationFrame(now) {
  if (!state.animation) {
    return state.current
      ? {
          mode: "single",
          exercise: state.current,
        }
      : null;
  }

  const elapsed = now - state.animation.start;
  const rawT = clamp(elapsed / state.animation.duration, 0, 1);
  const eased = easeInOutCubic(rawT);

  if (rawT >= 1) {
    state.current = state.animation.to;
    state.animation = null;
    return {
      mode: "single",
      exercise: state.current,
    };
  }

  requestRender();

  if (getRenderFamily(state.animation.from.kind) === getRenderFamily(state.animation.to.kind)) {
    return {
      mode: "single",
      exercise: interpolateExercise(state.animation.from, state.animation.to, eased),
    };
  }

  return {
    mode: "blend",
    fromExercise: interpolateExercise(
      state.animation.from,
      state.animation.to,
      eased,
      state.animation.from.kind,
    ),
    toExercise: interpolateExercise(
      state.animation.from,
      state.animation.to,
      eased,
      state.animation.to.kind,
    ),
    fromAlpha: 1 - eased,
    toAlpha: eased,
    infoExercise:
      eased < 0.5
        ? interpolateExercise(state.animation.from, state.animation.to, eased, state.animation.from.kind)
        : interpolateExercise(state.animation.from, state.animation.to, eased, state.animation.to.kind),
  };
}

function getAnimationSnapshot(now = performance.now()) {
  const frame = getAnimationFrame(now);

  if (!frame) {
    return null;
  }

  if (frame.mode === "blend") {
    return frame.toAlpha >= frame.fromAlpha ? frame.toExercise : frame.fromExercise;
  }

  return frame.exercise;
}

function classifyFaces(vertices) {
  const visibility = new Map();

  for (const face of faceDefinitions) {
    const points = face.indices.map((index) => vertices[index]);
    const normal = cross(subtract(points[1], points[0]), subtract(points[2], points[0]));
    const center = averagePoints(points);
    visibility.set(face.name, dot(normal, { x: -center.x, y: -center.y, z: -center.z }) > 0);
  }

  return visibility;
}

function getBounds(view, margin = 0) {
  return {
    minX: -margin,
    maxX: view.width + margin,
    minY: -margin,
    maxY: view.height + margin,
  };
}

function clipLineToBounds(point, direction, bounds) {
  const intersections = [];
  const epsilon = 0.00001;

  if (Math.abs(direction.x) > epsilon) {
    for (const x of [bounds.minX, bounds.maxX]) {
      const t = (x - point.x) / direction.x;
      const y = point.y + direction.y * t;

      if (y >= bounds.minY - epsilon && y <= bounds.maxY + epsilon) {
        intersections.push({ x, y, t });
      }
    }
  }

  if (Math.abs(direction.y) > epsilon) {
    for (const y of [bounds.minY, bounds.maxY]) {
      const t = (y - point.y) / direction.y;
      const x = point.x + direction.x * t;

      if (x >= bounds.minX - epsilon && x <= bounds.maxX + epsilon) {
        intersections.push({ x, y, t });
      }
    }
  }

  if (intersections.length < 2) {
    return null;
  }

  intersections.sort((left, right) => left.t - right.t);

  const unique = [];

  for (const pointCandidate of intersections) {
    const isDuplicate = unique.some(
      (entry) =>
        Math.abs(entry.x - pointCandidate.x) < 0.5 &&
        Math.abs(entry.y - pointCandidate.y) < 0.5,
    );

    if (!isDuplicate) {
      unique.push(pointCandidate);
    }
  }

  if (unique.length < 2) {
    return null;
  }

  return [unique[0], unique[unique.length - 1]];
}

function clipRayToBounds(point, direction, bounds) {
  const epsilon = 0.00001;
  const intersections = [];

  if (Math.abs(direction.x) > epsilon) {
    for (const x of [bounds.minX, bounds.maxX]) {
      const t = (x - point.x) / direction.x;
      const y = point.y + direction.y * t;

      if (t > 0 && y >= bounds.minY - epsilon && y <= bounds.maxY + epsilon) {
        intersections.push({ x, y, t });
      }
    }
  }

  if (Math.abs(direction.y) > epsilon) {
    for (const y of [bounds.minY, bounds.maxY]) {
      const t = (y - point.y) / direction.y;
      const x = point.x + direction.x * t;

      if (t > 0 && x >= bounds.minX - epsilon && x <= bounds.maxX + epsilon) {
        intersections.push({ x, y, t });
      }
    }
  }

  if (intersections.length === 0) {
    return null;
  }

  intersections.sort((left, right) => left.t - right.t);
  return intersections[0];
}

function computeVanishingPoint(direction, focalLength, origin) {
  const safeZ =
    Math.abs(direction.z) < 0.00001 ? (direction.z >= 0 ? 0.00001 : -0.00001) : direction.z;

  return {
    x: origin.x + (focalLength * direction.x) / safeZ,
    y: origin.y - (focalLength * direction.y) / safeZ,
  };
}

function drawPaper(view) {
  const background = ctx.createLinearGradient(0, 0, view.width, view.height);
  background.addColorStop(0, "#fff9ee");
  background.addColorStop(0.55, "#f9edd3");
  background.addColorStop(1, "#f1dfbb");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, view.width, view.height);

  const glow = ctx.createRadialGradient(view.width * 0.24, view.height * 0.18, 20, view.width * 0.24, view.height * 0.18, view.width * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.8)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, view.width, view.height);

  ctx.strokeStyle = "rgba(123, 94, 44, 0.09)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 11]);
  ctx.beginPath();
  ctx.moveTo(view.width / 2, 18);
  ctx.lineTo(view.width / 2, view.height - 18);
  ctx.moveTo(18, view.height / 2);
  ctx.lineTo(view.width - 18, view.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(123, 94, 44, 0.12)";
  ctx.strokeRect(18.5, 18.5, view.width - 37, view.height - 37);
}

function drawLineSegments(segments, lineWidth, strokeStyle, dashPattern = []) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dashPattern);

  for (const [a, b] of segments) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawSingleLine(start, end, lineWidth, strokeStyle, dashPattern = []) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dashPattern);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawPerspectiveGuides(exercise, alpha = 1) {
  const { width, height } = state.view;
  const focalLength = Math.min(width, height) * 1.16;
  const origin = { x: width / 2, y: height / 2 };
  const guideDimensions =
    exercise.kind === "cylinder"
      ? { x: exercise.dimensions.x, y: exercise.dimensions.y, z: exercise.dimensions.x }
      : exercise.dimensions;
  const projectedVertices = createBoxVertices(guideDimensions).map((vertex) =>
    projectPoint(add(rotatePoint(vertex, exercise.rotation), exercise.center), focalLength, origin),
  );
  const bounds = getBounds(state.view, 70);
  const axisX = normalize(rotatePoint({ x: 1, y: 0, z: 0 }, exercise.rotation));
  const axisY = normalize(rotatePoint({ x: 0, y: 1, z: 0 }, exercise.rotation));
  const axisZ = normalize(rotatePoint({ x: 0, y: 0, z: 1 }, exercise.rotation));
  const vpX = computeVanishingPoint(axisX, focalLength, origin);
  const vpY = computeVanishingPoint(axisY, focalLength, origin);
  const vpZ = computeVanishingPoint(axisZ, focalLength, origin);
  const horizon = clipLineToBounds(vpX, { x: vpZ.x - vpX.x, y: vpZ.y - vpX.y }, bounds);
  const guideWidth = 1.1;

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (horizon) {
    drawSingleLine(horizon[0], horizon[1], 1.5, "rgba(160, 79, 29, 0.28)", [14, 10]);
  }

  for (const [startIndex, endIndex] of guideEdgePairs) {
    const start = projectedVertices[startIndex];
    const end = projectedVertices[endIndex];
    const clipped = clipLineToBounds(start, { x: end.x - start.x, y: end.y - start.y }, bounds);

    if (clipped) {
      drawSingleLine(clipped[0], clipped[1], guideWidth, "rgba(160, 79, 29, 0.18)", [6, 10]);
    }
  }

  const vanishingPoints = [vpX, vpY, vpZ];

  for (const vanishingPoint of vanishingPoints) {
    if (!isPointInside(vanishingPoint, bounds)) {
      continue;
    }

    ctx.fillStyle = "rgba(160, 79, 29, 0.34)";
    ctx.beginPath();
    ctx.arc(vanishingPoint.x, vanishingPoint.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBox(exercise, origin, focalLength) {
  const { width, height } = state.view;
  const baseVertices = createBoxVertices(exercise.dimensions);
  const worldVertices = baseVertices.map((vertex) => add(rotatePoint(vertex, exercise.rotation), exercise.center));
  const projectedVertices = worldVertices.map((vertex) => projectPoint(vertex, focalLength, origin));
  const faceVisibility = classifyFaces(worldVertices);

  const hiddenEdges = [];
  const visibleEdges = [];

  for (const edge of edges) {
    const [aIndex, bIndex] = edge.indices;
    const isVisible = edge.faces.some((name) => faceVisibility.get(name));
    const points = [projectedVertices[aIndex], projectedVertices[bIndex]];

    if (isVisible) {
      visibleEdges.push(points);
    } else {
      hiddenEdges.push(points);
    }
  }

  const visibleWidth = clamp(Math.min(width, height) * 0.005, 2.4, 4.3);
  const hiddenWidth = Math.max(1.5, visibleWidth * 0.76);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (state.showHidden) {
    drawLineSegments(hiddenEdges, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
  }

  drawLineSegments(visibleEdges, visibleWidth, "#2b1d11");
}

function buildRingSegments(worldPoints, projectedPoints, nearDirection) {
  const visibleSegments = [];
  const hiddenSegments = [];

  for (let index = 0; index < worldPoints.length; index += 1) {
    const nextIndex = (index + 1) % worldPoints.length;
    const radialMidpoint = normalize(add(worldPoints[index].radial, worldPoints[nextIndex].radial));
    const segment = [projectedPoints[index], projectedPoints[nextIndex]];

    if (dot(radialMidpoint, nearDirection) >= 0) {
      visibleSegments.push(segment);
    } else {
      hiddenSegments.push(segment);
    }
  }

  return { visibleSegments, hiddenSegments };
}

function drawCylinder(exercise, origin, focalLength) {
  const { width, height } = state.view;
  const radius = exercise.dimensions.x / 2;
  const heightValue = exercise.dimensions.y;
  const rotation = exercise.rotation;
  const segmentCount = 72;
  const axis = normalize(rotatePoint({ x: 0, y: 1, z: 0 }, rotation));
  const basisX = normalize(rotatePoint({ x: 1, y: 0, z: 0 }, rotation));
  const basisZ = normalize(rotatePoint({ x: 0, y: 0, z: 1 }, rotation));
  const topCenter = add(rotatePoint({ x: 0, y: heightValue / 2, z: 0 }, rotation), exercise.center);
  const bottomCenter = add(rotatePoint({ x: 0, y: -heightValue / 2, z: 0 }, rotation), exercise.center);
  const viewer = normalize(scale(exercise.center, -1));
  let nearDirection = subtract(viewer, scale(axis, dot(viewer, axis)));

  if (magnitude(nearDirection) < 0.00001) {
    nearDirection = basisZ;
  }

  nearDirection = normalize(nearDirection);

  let sideDirection = cross(axis, nearDirection);

  if (magnitude(sideDirection) < 0.00001) {
    sideDirection = basisX;
  }

  sideDirection = normalize(sideDirection);

  const topWorld = [];
  const bottomWorld = [];
  const topProjected = [];
  const bottomProjected = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const angle = (index / segmentCount) * Math.PI * 2;
    const radial = add(scale(basisX, Math.cos(angle)), scale(basisZ, Math.sin(angle)));
    const topPoint = add(topCenter, scale(radial, radius));
    const bottomPoint = add(bottomCenter, scale(radial, radius));

    topWorld.push({ point: topPoint, radial });
    bottomWorld.push({ point: bottomPoint, radial });
    topProjected.push(projectPoint(topPoint, focalLength, origin));
    bottomProjected.push(projectPoint(bottomPoint, focalLength, origin));
  }

  const topRing = buildRingSegments(topWorld, topProjected, nearDirection);
  const bottomRing = buildRingSegments(bottomWorld, bottomProjected, nearDirection);
  const visibleWidth = clamp(Math.min(width, height) * 0.005, 2.4, 4.3);
  const hiddenWidth = Math.max(1.5, visibleWidth * 0.76);
  const sideSegments = [-1, 1].map((direction) => {
    const topPoint = add(topCenter, scale(sideDirection, radius * direction));
    const bottomPoint = add(bottomCenter, scale(sideDirection, radius * direction));

    return [projectPoint(topPoint, focalLength, origin), projectPoint(bottomPoint, focalLength, origin)];
  });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (state.showHidden) {
    drawLineSegments(topRing.hiddenSegments, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
    drawLineSegments(bottomRing.hiddenSegments, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
  }

  drawLineSegments(topRing.visibleSegments, visibleWidth, "#2b1d11");
  drawLineSegments(bottomRing.visibleSegments, visibleWidth, "#2b1d11");
  drawLineSegments(sideSegments, visibleWidth, "#2b1d11");
}

function drawExercise(exercise, alpha = 1) {
  const { width, height } = state.view;
  const focalLength = Math.min(width, height) * 1.16;
  const origin = { x: width / 2, y: height / 2 };

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  if (exercise.kind === "cylinder") {
    drawCylinder(exercise, origin, focalLength);
    ctx.restore();
    return;
  }

  drawBox(exercise, origin, focalLength);
  ctx.restore();
}

function render(now = performance.now()) {
  ensureCanvasSize();
  drawPaper(state.view);

  const frame = getAnimationFrame(now);

  if (!frame) {
    return;
  }

  if (frame.mode === "blend") {
    updateInfo(frame.infoExercise);
    if (state.showGuides) {
      drawPerspectiveGuides(frame.fromExercise, frame.fromAlpha);
      drawPerspectiveGuides(frame.toExercise, frame.toAlpha);
    }
    drawExercise(frame.fromExercise, frame.fromAlpha);
    drawExercise(frame.toExercise, frame.toAlpha);
    return;
  }

  updateInfo(frame.exercise);
  if (state.showGuides) {
    drawPerspectiveGuides(frame.exercise);
  }
  drawExercise(frame.exercise);
}

function requestRender() {
  if (state.rafId) {
    return;
  }

  state.rafId = requestAnimationFrame((now) => {
    state.rafId = 0;
    render(now);
  });
}

function setExercise(mode = "random") {
  const from = getAnimationSnapshot() || state.current;
  const next = createExercise(mode);

  if (!from) {
    state.current = next;
    requestRender();
    return;
  }

  state.animation = {
    from,
    to: next,
    start: performance.now(),
    duration: 560,
  };

  requestRender();
}

function toggleAutoShuffle() {
  state.autoShuffle = !state.autoShuffle;

  if (state.autoShuffle) {
    state.autoTimer = window.setInterval(() => {
      setExercise("random");
    }, 2800);
  } else if (state.autoTimer) {
    window.clearInterval(state.autoTimer);
    state.autoTimer = 0;
  }

  updateInfo(state.current || createExercise("random"));
}

function toggleHiddenEdges() {
  state.showHidden = !state.showHidden;

  const infoExercise = state.animation ? state.animation.to : state.current;

  if (infoExercise) {
    updateInfo(infoExercise);
  }

  requestRender();
}

function toggleGuides() {
  state.showGuides = !state.showGuides;

  const infoExercise = state.animation ? state.animation.to : state.current;

  if (infoExercise) {
    updateInfo(infoExercise);
  }

  requestRender();
}

document.querySelector(".controls").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === "auto") {
    toggleAutoShuffle();
    return;
  }

  if (action === "hidden") {
    toggleHiddenEdges();
    return;
  }

  if (action === "guides") {
    toggleGuides();
    return;
  }

  setExercise(action);
});

window.addEventListener("resize", () => {
  requestRender();
});

window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLElement && /input|textarea|select|button/i.test(event.target.tagName)) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === " ") {
    event.preventDefault();
    setExercise("random");
  } else if (key === "c") {
    setExercise("cube");
  } else if (key === "b") {
    setExercise("box");
  } else if (key === "l") {
    setExercise("cylinder");
  } else if (key === "h") {
    toggleHiddenEdges();
  } else if (key === "g") {
    toggleGuides();
  } else if (key === "a") {
    toggleAutoShuffle();
  }
});

setExercise("random");
