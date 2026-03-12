const canvas = document.querySelector("[data-canvas]");
const ctx = canvas.getContext("2d");

const ui = {
  kind: document.querySelector("[data-kind]"),
  size: document.querySelector("[data-size]"),
  view: document.querySelector("[data-view]"),
  status: document.querySelector("[data-status]"),
  stageLabel: document.querySelector("[data-stage-label]"),
  stageTitle: document.querySelector("[data-stage-title]"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  panels: Array.from(document.querySelectorAll("[data-panel]")),
  stages: Array.from(document.querySelectorAll("[data-stage]")),
  shapeButtons: Array.from(document.querySelectorAll("[data-shape]")),
  perspectiveButtons: Array.from(document.querySelectorAll("[data-perspective-mode]")),
  toggleButtons: {
    auto: document.querySelector('[data-toggle="auto"]'),
    hidden: document.querySelector('[data-toggle="hidden"]'),
    guides: document.querySelector('[data-toggle="guides"]'),
    zoom: document.querySelector('[data-toggle="zoom"]'),
  },
  gesture: {
    durationButtons: Array.from(document.querySelectorAll("[data-duration]")),
    refCountButtons: Array.from(document.querySelectorAll("[data-ref-count]")),
    startButton: document.querySelector('[data-gesture-action="start"]'),
    nextButton: document.querySelector('[data-gesture-action="next"]'),
    endButton: document.querySelector('[data-gesture-action="end"]'),
    time: document.querySelector("[data-gesture-time]"),
    progress: document.querySelector("[data-gesture-progress]"),
    sourceName: document.querySelector("[data-gesture-source-name]"),
    sourceTitle: document.querySelector("[data-gesture-source-title]"),
    sourceLink: document.querySelector("[data-gesture-source-link]"),
    note: document.querySelector("[data-gesture-note]"),
    summary: document.querySelector("[data-gesture-summary]"),
    gallery: document.querySelector("[data-gesture-gallery]"),
    image: document.querySelector("[data-gesture-image]"),
    placeholder: document.querySelector("[data-gesture-placeholder]"),
    timerPill: document.querySelector("[data-gesture-timer-pill]"),
    counterPill: document.querySelector("[data-gesture-counter-pill]"),
  },
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
  mode: "perspective",
  selectedShape: "random",
  perspectiveMode: "three",
  autoShuffle: false,
  showHidden: true,
  showGuides: false,
  zoomedOut: false,
  autoTimer: 0,
  rafId: 0,
  view: { width: 0, height: 0 },
  gesture: {
    duration: 120000,
    refCount: 10,
    active: false,
    loading: false,
    complete: false,
    remaining: 120000,
    deadline: 0,
    timerId: 0,
    requestId: 0,
    currentRef: null,
    used: [],
    error: "",
  },
};

const gestureNote =
  "Gesture references are pulled from Wikimedia Commons so the app works without API keys or local setup.";
const gestureSearchTerms = [
  "dancer full body photograph",
  "athlete movement photograph",
  "martial arts pose photograph",
  "standing figure photograph",
  "human body pose photograph",
];

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
  const details = [state.showHidden ? "Hidden lines on" : "Hidden lines off"];

  if (state.showGuides) {
    details.push("guides");
  }

  if (state.zoomedOut) {
    details.push("zoomed out");
  }

  if (state.autoShuffle) {
    details.push("auto");
  }

  return details.join(" / ");
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

function formatPerspectiveMode(mode) {
  if (mode === "one") {
    return "1-point";
  }

  if (mode === "two") {
    return "2-point";
  }

  return "3-point";
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatGestureProgress(count = state.gesture.used.length) {
  if (state.gesture.refCount === 0) {
    return `${count} / unlimited`;
  }

  return `${Math.min(count, state.gesture.refCount)} / ${state.gesture.refCount}`;
}

function setButtonState(button, isActive) {
  if (!button) {
    return;
  }

  button.setAttribute("aria-pressed", String(isActive));
  button.classList.toggle("button-primary", isActive);
}

function updateModeButtons() {
  for (const button of ui.modeButtons) {
    setButtonState(button, button.dataset.mode === state.mode);
  }
}

function updatePerspectiveButtons() {
  for (const button of ui.shapeButtons) {
    setButtonState(button, button.dataset.shape === state.selectedShape);
  }

  for (const button of ui.perspectiveButtons) {
    setButtonState(button, button.dataset.perspectiveMode === state.perspectiveMode);
  }

  ui.toggleButtons.hidden.textContent = state.showHidden ? "Hidden Lines On" : "Hidden Lines Off";
  setButtonState(ui.toggleButtons.hidden, state.showHidden);

  ui.toggleButtons.guides.textContent = state.showGuides ? "Guides On" : "Guides Off";
  setButtonState(ui.toggleButtons.guides, state.showGuides);

  ui.toggleButtons.zoom.textContent = state.zoomedOut ? "Zoom In" : "Zoom Out";
  setButtonState(ui.toggleButtons.zoom, state.zoomedOut);

  ui.toggleButtons.auto.textContent = state.autoShuffle ? "Auto Shuffle On" : "Auto Shuffle";
  setButtonState(ui.toggleButtons.auto, state.autoShuffle);
}

function updateGestureButtons() {
  for (const button of ui.gesture.durationButtons) {
    setButtonState(button, Number(button.dataset.duration) === state.gesture.duration);
  }

  for (const button of ui.gesture.refCountButtons) {
    setButtonState(button, Number(button.dataset.refCount) === state.gesture.refCount);
  }

  ui.gesture.startButton.textContent =
    state.gesture.active || state.gesture.used.length > 0 ? "Restart Session" : "Start Session";
  ui.gesture.startButton.classList.add("button-primary");
  ui.gesture.nextButton.disabled = state.gesture.loading;
  ui.gesture.endButton.disabled = state.gesture.loading;
}

function updateStageCopy() {
  if (state.mode === "gesture") {
    ui.stageLabel.textContent = "Gesture Session";
    ui.stageTitle.textContent = state.gesture.currentRef?.title ?? "Timed reference drawing";

    if (state.gesture.loading) {
      ui.status.textContent = "Loading reference";
    } else if (state.gesture.complete) {
      ui.status.textContent = "Session complete";
    } else if (state.gesture.active) {
      ui.status.textContent = formatGestureProgress();
    } else if (state.gesture.used.length > 0) {
      ui.status.textContent = "Session paused";
    } else {
      ui.status.textContent = "Session idle";
    }

    return;
  }

  ui.stageLabel.textContent = "Perspective Drill";
  ui.stageTitle.textContent = "Draw through the full form";
  ui.status.textContent = formatStatus();
}

function renderGestureGallery() {
  ui.gesture.gallery.replaceChildren();

  for (const [index, reference] of state.gesture.used.entries()) {
    const card = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const number = document.createElement("span");
    const title = document.createElement("span");

    card.className = "reference-card";
    number.className = "reference-index";
    title.className = "reference-title";

    link.href = reference.sourceUrl;
    link.target = "_blank";
    link.rel = "noreferrer";

    image.src = reference.thumbUrl || reference.imageUrl;
    image.alt = reference.title;
    image.loading = "lazy";

    number.textContent = `Ref ${index + 1}`;
    title.textContent = reference.title;

    link.append(image, number, title);
    card.append(link);
    ui.gesture.gallery.append(card);
  }

  ui.gesture.summary.hidden = state.gesture.used.length === 0;
}

function updateGestureDisplay() {
  const remaining = state.gesture.currentRef ? state.gesture.remaining : state.gesture.duration;
  const timeLabel = formatDuration(remaining);
  const progressLabel = formatGestureProgress();
  const reference = state.gesture.currentRef;

  ui.gesture.time.textContent = timeLabel;
  ui.gesture.timerPill.textContent = timeLabel;
  ui.gesture.progress.textContent = progressLabel;
  ui.gesture.counterPill.textContent = progressLabel;
  ui.gesture.sourceName.textContent = reference?.sourceName ?? "Internet";
  ui.gesture.sourceTitle.textContent =
    state.gesture.loading && !reference
      ? "Loading next reference..."
      : reference?.title ?? "No pose loaded yet";
  ui.gesture.sourceLink.hidden = !reference;

  if (reference) {
    ui.gesture.sourceLink.href = reference.sourceUrl;
    ui.gesture.image.src = reference.imageUrl;
    ui.gesture.image.alt = reference.title;
  }

  ui.gesture.image.hidden = !reference;
  ui.gesture.placeholder.hidden = Boolean(reference);

  if (!reference) {
    ui.gesture.placeholder.textContent = state.gesture.loading
      ? "Loading the next Wikimedia Commons reference..."
      : state.gesture.error || "Select a time limit, choose how many references you want, and start a session.";
  }

  ui.gesture.note.textContent = state.gesture.error || gestureNote;

  renderGestureGallery();
  updateGestureButtons();
  updateStageCopy();
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

function buildExerciseCandidate(mode = "random", perspectiveMode = state.perspectiveMode) {
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

  let xTilt;
  let yTurn;
  let zRoll;

  if (perspectiveMode === "one") {
    xTilt = randomBetween(0.14, 0.32) * randomFrom([-1, 1]);
    yTurn = randomBetween(-0.16, 0.16);
    zRoll = randomBetween(-0.03, 0.03);
  } else if (perspectiveMode === "two") {
    xTilt = randomBetween(0.08, 0.24) * randomFrom([-1, 1]);
    yTurn = randomBetween(0.58, 1.04) * randomFrom([-1, 1]);
    zRoll = randomBetween(-0.05, 0.05);
  } else {
    xTilt = randomBetween(0.34, 0.82) * randomFrom([-1, 1]);
    yTurn = randomBetween(0.58, 1.08) * randomFrom([-1, 1]);
    zRoll = randomBetween(-0.14, 0.14);
  }

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

function createExercise(mode = state.selectedShape, perspectiveMode = state.perspectiveMode) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = buildExerciseCandidate(mode, perspectiveMode);

    const isReadable =
      candidate.kind === "cylinder"
        ? isReadableCylinder(candidate)
        : perspectiveMode === "one"
          ? countVisibleFaces(candidate) >= 2
          : countVisibleFaces(candidate) === 3;

    if (isReadable) {
      return candidate;
    }
  }

  return buildExerciseCandidate(mode, perspectiveMode);
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
  ui.view.textContent = `${formatPerspectiveMode(state.perspectiveMode)} / ${describeView(exercise.rotation)}`;
  updatePerspectiveButtons();
  updateStageCopy();
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

function getFocalLength(width, height) {
  return Math.min(width, height) * (state.zoomedOut ? 0.88 : 1.16);
}

function drawPerspectiveGuides(exercise, alpha = 1) {
  const { width, height } = state.view;
  const focalLength = getFocalLength(width, height);
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
  const focalLength = getFocalLength(width, height);
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
  if (state.mode !== "perspective") {
    return;
  }

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
  if (state.mode !== "perspective") {
    return;
  }

  if (state.rafId) {
    return;
  }

  state.rafId = requestAnimationFrame((now) => {
    state.rafId = 0;
    render(now);
  });
}

function setExercise(mode = state.selectedShape) {
  const from = getAnimationSnapshot() || state.current;
  const next = createExercise(mode, state.perspectiveMode);

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
      setExercise(state.selectedShape);
    }, 2800);
  } else if (state.autoTimer) {
    window.clearInterval(state.autoTimer);
    state.autoTimer = 0;
  }

  updateInfo(state.current || createExercise(state.selectedShape, state.perspectiveMode));
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

function toggleZoom() {
  state.zoomedOut = !state.zoomedOut;

  const infoExercise = state.animation ? state.animation.to : state.current;

  if (infoExercise) {
    updateInfo(infoExercise);
  }

  requestRender();
}

function stopGestureTimer() {
  if (!state.gesture.timerId) {
    return;
  }

  window.clearInterval(state.gesture.timerId);
  state.gesture.timerId = 0;
}

function finishGestureSession({ complete = false } = {}) {
  state.gesture.requestId += 1;
  stopGestureTimer();
  state.gesture.loading = false;
  state.gesture.active = false;
  state.gesture.complete = complete;
  state.gesture.remaining = complete ? 0 : state.gesture.remaining || state.gesture.duration;
  updateGestureDisplay();
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = url;
  });
}

async function fetchGestureReference() {
  const searchPool = [...gestureSearchTerms].sort(() => Math.random() - 0.5);

  for (const term of searchPool) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "search",
      gsrsearch: term,
      gsrnamespace: "6",
      gsrlimit: "20",
      prop: "imageinfo|info",
      inprop: "url",
      iiprop: "url",
      iiurlwidth: "1400",
      origin: "*",
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const pages = (data.query?.pages ?? []).filter((page) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);

    if (pages.length === 0) {
      continue;
    }

    const page = randomFrom(pages);
    const info = page.imageinfo[0];

    return {
      title: page.title.replace(/^File:/, "").replace(/_/g, " "),
      imageUrl: info.thumburl || info.url,
      thumbUrl: info.thumburl || info.url,
      sourceUrl: page.fullurl || info.descriptionurl,
      sourceName: "Wikimedia Commons",
    };
  }

  throw new Error("No Wikimedia references were returned.");
}

function startGestureTimer() {
  stopGestureTimer();
  state.gesture.remaining = state.gesture.duration;
  state.gesture.deadline = Date.now() + state.gesture.duration;
  state.gesture.timerId = window.setInterval(() => {
    state.gesture.remaining = Math.max(0, state.gesture.deadline - Date.now());
    updateGestureDisplay();

    if (state.gesture.remaining > 0) {
      return;
    }

    stopGestureTimer();

    if (state.gesture.refCount > 0 && state.gesture.used.length >= state.gesture.refCount) {
      finishGestureSession({ complete: true });
      return;
    }

    void nextGesturePose();
  }, 250);
}

async function loadGestureReference() {
  const requestId = state.gesture.requestId + 1;
  state.gesture.requestId = requestId;
  state.gesture.loading = true;
  state.gesture.active = false;
  state.gesture.complete = false;
  state.gesture.error = "";
  updateGestureDisplay();

  try {
    const reference = await fetchGestureReference();
    await preloadImage(reference.imageUrl);

    if (requestId !== state.gesture.requestId) {
      return;
    }

    state.gesture.currentRef = reference;
    state.gesture.used = [...state.gesture.used, reference];
    state.gesture.loading = false;
    state.gesture.active = true;
    state.gesture.remaining = state.gesture.duration;
    startGestureTimer();
    updateGestureDisplay();
  } catch (error) {
    if (requestId !== state.gesture.requestId) {
      return;
    }

    state.gesture.loading = false;
    state.gesture.active = false;
    state.gesture.error = "Could not load a Wikimedia reference right now. Try again.";
    updateGestureDisplay();
  }
}

async function startGestureSession() {
  setMode("gesture");
  stopGestureTimer();
  state.gesture.used = [];
  state.gesture.currentRef = null;
  state.gesture.loading = false;
  state.gesture.complete = false;
  state.gesture.remaining = state.gesture.duration;
  state.gesture.error = "";
  updateGestureDisplay();
  await loadGestureReference();
}

async function nextGesturePose() {
  setMode("gesture");

  if (state.gesture.loading) {
    return;
  }

  if (state.gesture.refCount > 0 && state.gesture.used.length >= state.gesture.refCount) {
    finishGestureSession({ complete: true });
    return;
  }

  stopGestureTimer();
  await loadGestureReference();
}

function endGestureSession() {
  finishGestureSession();
}

function setMode(mode) {
  if (mode !== "perspective" && mode !== "gesture") {
    return;
  }

  if (state.mode === "gesture" && mode !== "gesture" && state.gesture.active) {
    stopGestureTimer();
    state.gesture.active = false;
  }

  state.mode = mode;

  for (const panel of ui.panels) {
    panel.hidden = panel.dataset.panel !== mode;
  }

  for (const stage of ui.stages) {
    stage.hidden = stage.dataset.stage !== mode;
  }

  updateModeButtons();

  if (mode === "gesture") {
    updateGestureDisplay();
    return;
  }

  const infoExercise = state.animation ? state.animation.to : state.current;

  if (infoExercise) {
    updateInfo(infoExercise);
  } else {
    updateStageCopy();
  }

  requestRender();
}

function setShapeMode(mode) {
  state.selectedShape = mode;
  updatePerspectiveButtons();
  setExercise(mode);
}

function setPerspectiveMode(mode) {
  state.perspectiveMode = mode;
  updatePerspectiveButtons();
  setExercise(state.selectedShape);
}

function setGestureDuration(duration) {
  state.gesture.duration = duration;
  state.gesture.complete = false;

  if (state.gesture.active) {
    void nextGesturePose();
    return;
  }

  updateGestureDisplay();
}

function setGestureRefCount(refCount) {
  state.gesture.refCount = refCount;

  if (refCount > 0 && state.gesture.active && state.gesture.used.length >= refCount) {
    finishGestureSession({ complete: true });
    return;
  }

  if (refCount > 0 && state.gesture.used.length >= refCount) {
    state.gesture.complete = true;
  } else {
    state.gesture.complete = false;
  }

  updateGestureDisplay();
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.mode) {
    setMode(button.dataset.mode);
    return;
  }

  if (button.dataset.shape) {
    setMode("perspective");
    setShapeMode(button.dataset.shape);
    return;
  }

  if (button.dataset.perspectiveMode) {
    setMode("perspective");
    setPerspectiveMode(button.dataset.perspectiveMode);
    return;
  }

  if (button.dataset.toggle === "auto") {
    toggleAutoShuffle();
    return;
  }

  if (button.dataset.toggle === "hidden") {
    toggleHiddenEdges();
    return;
  }

  if (button.dataset.toggle === "guides") {
    toggleGuides();
    return;
  }

  if (button.dataset.toggle === "zoom") {
    toggleZoom();
    return;
  }

  if (button.dataset.duration) {
    setMode("gesture");
    setGestureDuration(Number(button.dataset.duration));
    return;
  }

  if (button.dataset.refCount) {
    setMode("gesture");
    setGestureRefCount(Number(button.dataset.refCount));
    return;
  }

  if (button.dataset.gestureAction === "start") {
    void startGestureSession();
    return;
  }

  if (button.dataset.gestureAction === "next") {
    void nextGesturePose();
    return;
  }

  if (button.dataset.gestureAction === "end") {
    endGestureSession();
  }
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
    setMode("perspective");
    setExercise(state.selectedShape);
  } else if (key === "c") {
    setMode("perspective");
    setShapeMode("cube");
  } else if (key === "b") {
    setMode("perspective");
    setShapeMode("box");
  } else if (key === "l") {
    setMode("perspective");
    setShapeMode("cylinder");
  } else if (key === "1") {
    setMode("perspective");
    setPerspectiveMode("one");
  } else if (key === "2") {
    setMode("perspective");
    setPerspectiveMode("two");
  } else if (key === "3") {
    setMode("perspective");
    setPerspectiveMode("three");
  } else if (key === "h" && state.mode === "perspective") {
    toggleHiddenEdges();
  } else if (key === "g" && state.mode === "perspective") {
    toggleGuides();
  } else if (key === "z" && state.mode === "perspective") {
    toggleZoom();
  } else if (key === "a" && state.mode === "perspective") {
    toggleAutoShuffle();
  } else if (key === "s" && state.mode === "gesture") {
    void startGestureSession();
  } else if (key === "n" && state.mode === "gesture") {
    void nextGesturePose();
  } else if (key === "e" && state.mode === "gesture") {
    endGestureSession();
  }
});

updateModeButtons();
updatePerspectiveButtons();
updateGestureDisplay();
setMode("perspective");
setExercise(state.selectedShape);
