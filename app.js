const canvas = document.querySelector("[data-canvas]");
const ctx = canvas.getContext("2d");

const ui = {
  modeButtons: document.querySelectorAll("[data-mode]"),
  panels: document.querySelectorAll("[data-panel]"),
  stages: document.querySelectorAll("[data-stage]"),
  stageLabel: document.querySelector("[data-stage-label]"),
  stageTitle: document.querySelector("[data-stage-title]"),
  status: document.querySelector("[data-status]"),
  kind: document.querySelector("[data-kind]"),
  size: document.querySelector("[data-size]"),
  view: document.querySelector("[data-view]"),
  shapeButtons: document.querySelectorAll("[data-shape]"),
  perspectiveButtons: document.querySelectorAll("[data-perspective-mode]"),
  toggleButtons: document.querySelectorAll("[data-toggle]"),
  rotateButtons: document.querySelectorAll("[data-rotate]"),
  liftButtons: document.querySelectorAll("[data-lift]"),
  durationButtons: document.querySelectorAll("[data-duration]"),
  countButtons: document.querySelectorAll("[data-ref-count]"),
  gestureSourceButtons: document.querySelectorAll("[data-gesture-source]"),
  gestureActionButtons: document.querySelectorAll("[data-gesture-action]"),
  gestureTime: document.querySelector("[data-gesture-time]"),
  gestureProgress: document.querySelector("[data-gesture-progress]"),
  gestureSourceName: document.querySelector("[data-gesture-source-name]"),
  gestureTimerPill: document.querySelector("[data-gesture-timer-pill]"),
  gestureCounterPill: document.querySelector("[data-gesture-counter-pill]"),
  gesturePlaceholder: document.querySelector("[data-gesture-placeholder]"),
  gestureImage: document.querySelector("[data-gesture-image]"),
  gestureSourceTitle: document.querySelector("[data-gesture-source-title]"),
  gestureSourceLink: document.querySelector("[data-gesture-source-link]"),
  gestureSummary: document.querySelector("[data-gesture-summary]"),
  gestureGallery: document.querySelector("[data-gesture-gallery]"),
  gestureNote: document.querySelector("[data-gesture-note]"),
  customPerspectiveButtons: document.querySelectorAll("[data-custom-perspective]"),
  customAddButtons: document.querySelectorAll("[data-custom-add]"),
  customToggleButtons: document.querySelectorAll("[data-custom-toggle]"),
  customActionButtons: document.querySelectorAll("[data-custom-action]"),
  customGuide: document.querySelector("[data-custom-guide]"),
  customCount: document.querySelector("[data-custom-count]"),
  customSelection: document.querySelector("[data-custom-selection]"),
  customPhotoInput: document.querySelector("[data-custom-photo-input]"),
};

const faceDefinitions = [
  { name: "near", indices: [0, 2, 3, 1] },
  { name: "far", indices: [4, 5, 7, 6] },
  { name: "left", indices: [0, 4, 6, 2] },
  { name: "right", indices: [1, 3, 7, 5] },
  { name: "top", indices: [2, 6, 7, 3] },
  { name: "bottom", indices: [0, 1, 5, 4] },
];

const facesByName = new Map(faceDefinitions.map((face) => [face.name, face]));
const faceQuadIndices = {
  near: [0, 1, 3, 2],
  far: [4, 5, 7, 6],
  left: [0, 4, 6, 2],
  right: [1, 5, 7, 3],
  top: [2, 3, 7, 6],
  bottom: [0, 1, 5, 4],
};

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

const cylinderGuidePairs = [
  { axis: "depth", faces: ["near", "far"] },
  { axis: "width", faces: ["left", "right"] },
  { axis: "height", faces: ["top", "bottom"] },
];

const unitCircleConic = [
  [1, 0, -0.5],
  [0, 1, -0.5],
  [-0.5, -0.5, 0.25],
];

const gestureSearchTerms = [
  "single figure skater jump",
  "solo ice skater spin",
  "basketball player jump shot full body",
  "soccer player kicking ball full body",
  "tennis player serve full body",
  "single gymnast balance pose",
  "martial artist kick full body",
  "yoga standing pose full body",
  "dancer leap full body",
  "parkour athlete jump full body",
  "track sprinter start full body",
  "skateboarder trick full body",
  "rock climber full body action",
  "surfer standing pose action",
  "ballet arabesque full body",
  "boxer fighting stance full body",
  "breakdancer freeze pose",
  "single wrestler stance full body",
];

const gestureQueryStopWords = new Set([
  "single",
  "solo",
  "full",
  "body",
  "person",
  "people",
  "action",
  "photo",
  "photograph",
  "real",
  "one",
]);

const gestureBlockedTerms = [
  "anime",
  "icon",
  "logo",
  "diagram",
  "coat of arms",
  "flag",
  "map",
  "symbol",
  "silhouette",
  "pictogram",
  "clip art",
  "clipart",
  "vector",
];

const gesturePositiveTerms = [
  "athlete",
  "arabesque",
  "basketball",
  "boxer",
  "boxing",
  "breakdance",
  "breakdancer",
  "climber",
  "dancer",
  "dance",
  "figure skating",
  "gymnast",
  "gymnastics",
  "ice skating",
  "jump",
  "jumping",
  "karate",
  "kick",
  "kicking",
  "leap",
  "martial",
  "martial artist",
  "parkour",
  "pose",
  "posing",
  "runner",
  "serve",
  "serving",
  "skater",
  "skateboarder",
  "soccer",
  "sprinter",
  "stance",
  "surfer",
  "surfing",
  "tennis",
  "vault",
  "wrestler",
  "yoga",
  "asana",
  "photograph",
];

const gestureStrongPositiveTerms = [
  "single figure skater",
  "solo ice skater",
  "figure skating",
  "ice skating",
  "basketball player",
  "jump shot",
  "soccer kick",
  "tennis serve",
  "single gymnast",
  "martial artist kick",
  "fighting stance",
  "yoga standing pose",
  "parkour jump",
  "track sprinter",
  "dancer leap",
  "rock climber",
  "surfer standing",
  "ballet arabesque",
  "breakdancer freeze",
  "boxer fighting stance",
  "single wrestler stance",
  "sports photography",
  "action photograph",
];

const gesturePluralBlockers = [
  "group",
  "crowd",
  "people",
  "team",
  "audience",
  "couple",
  "duo",
  "pair",
  "selfie",
  "delegation",
  "officials",
  "spectators",
  "fans",
  "guests",
  "committee",
  "ceremony",
  "podium",
  "stands",
];

const gestureNegativeTerms = [
  "anime",
  "artwork",
  "automobile",
  "book",
  "bust",
  "car",
  "cover",
  "clipart",
  "crowd",
  "delegation",
  "diagram",
  "drawing",
  "drapery",
  "engraving",
  "gallery",
  "glyph",
  "illustration",
  "icon",
  "line art",
  "lithograph",
  "manga",
  "manual",
  "map",
  "met",
  "motorsport",
  "museum",
  "painting",
  "pdf",
  "pictogram",
  "poster",
  "protocol",
  "recto",
  "racing",
  "rules",
  "sculpture",
  "sketch",
  "selfie",
  "silhouette",
  "statue",
  "study",
  "symbol",
  "team",
  "verso",
  "vehicle",
  "vector",
  "yamaha",
  "yale",
];

const gesturePreferredPhotoProviders = new Set(["flickr", "smugmug", "stocksnap", "rawpixel"]);

const edges = buildEdges(faceDefinitions);
const gestureQueryCache = new Map();
const quickposesManifest = Array.isArray(window.CUBY_QUICKPOSES_MANIFEST)
  ? window.CUBY_QUICKPOSES_MANIFEST
  : [];

const state = {
  mode: "perspective",
  view: { width: 0, height: 0 },
  perspective: {
    selectedShape: "random",
    selectedMode: "three",
    current: null,
    animation: null,
    interaction: null,
    spin: null,
    autoShuffle: false,
    autoTimer: 0,
    showHidden: true,
    showGuides: false,
    showCylinderGuides: false,
    zoomedOut: false,
    rafId: 0,
  },
  gesture: {
    selectedDuration: 120000,
    selectedCount: 10,
    selectedSource: "quickposes",
    active: false,
    loading: false,
    ended: false,
    currentRef: null,
    usedRefs: [],
    remainingMs: 120000,
    timerId: 0,
    endsAt: 0,
    requestToken: 0,
    error: "",
  },
  custom: {
    perspectiveMode: "one",
    shapes: [],
    selectedShapeId: null,
    showHidden: true,
    showCylinderGuides: false,
    guides: null,
    photo: null,
    analysisReady: false,
    placementKind: null,
    autoCorrecting: false,
    interaction: null,
    nextShapeId: 1,
  },
};

function buildEdges(faces) {
  const map = new Map();

  for (const face of faces) {
    const { indices, name } = face;

    for (let index = 0; index < indices.length; index += 1) {
      const a = indices[index];
      const b = indices[(index + 1) % indices.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;

      if (!map.has(key)) {
        map.set(key, { indices: [a, b], faces: [] });
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

function wrapAngle(angle) {
  const tau = Math.PI * 2;
  let next = angle % tau;

  if (next <= -Math.PI) {
    next += tau;
  } else if (next > Math.PI) {
    next -= tau;
  }

  return next;
}

function add2(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract2(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale2(vector, amount) {
  return { x: vector.x * amount, y: vector.y * amount };
}

function distance2(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function lerpPoint(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

function getPointFromEvent(event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

function getLineIntersection(a, b, c, d) {
  const denominator = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);

  if (Math.abs(denominator) < 0.00001) {
    return null;
  }

  const determinantA = a.x * b.y - a.y * b.x;
  const determinantB = c.x * d.y - c.y * d.x;

  return {
    x: (determinantA * (c.x - d.x) - (a.x - b.x) * determinantB) / denominator,
    y: (determinantA * (c.y - d.y) - (a.y - b.y) * determinantB) / denominator,
  };
}

function getVerticalLineIntersection(columnPoint, rayStart, rayTarget) {
  return getLineIntersection(
    columnPoint,
    { x: columnPoint.x, y: columnPoint.y + 1 },
    rayStart,
    rayTarget,
  );
}

function getRayParameter(start, target, point) {
  const ray = subtract2(target, start);
  const lengthSquared = ray.x * ray.x + ray.y * ray.y;

  if (lengthSquared < 0.00001) {
    return 0;
  }

  return ((point.x - start.x) * ray.x + (point.y - start.y) * ray.y) / lengthSquared;
}

function clampRayPoint(start, target, point, minT = 0.06, maxT = 0.82) {
  return lerpPoint(start, target, clamp(getRayParameter(start, target, point), minT, maxT));
}

function pointInBounds(point, width, height, margin = 24) {
  return (
    point.x >= -margin &&
    point.x <= width + margin &&
    point.y >= -margin &&
    point.y <= height + margin
  );
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

function shuffle(list) {
  const next = [...list];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function chunkArray(list, size) {
  const chunks = [];

  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }

  return chunks;
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
  const scaleFactor = focalLength / safeZ;

  return {
    x: origin.x + point.x * scaleFactor,
    y: origin.y - point.y * scaleFactor,
    z: point.z,
  };
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
    return "One-point";
  }

  if (mode === "two") {
    return "Two-point";
  }

  return "Three-point";
}

function formatPerspectiveStatus() {
  const fragments = [formatPerspectiveMode(state.perspective.selectedMode)];

  if (state.perspective.showHidden) {
    fragments.push("draw-through");
  }

  if (state.perspective.showGuides) {
    fragments.push("guides");
  }

  if (state.perspective.showCylinderGuides) {
    fragments.push("cylinder guides");
  }

  if (state.perspective.zoomedOut) {
    fragments.push("zoomed out");
  }

  return fragments.join(" • ");
}

function formatGestureProgress() {
  if (state.gesture.selectedCount === 0) {
    return `${state.gesture.usedRefs.length} used`;
  }

  return `${Math.min(state.gesture.usedRefs.length, state.gesture.selectedCount)} / ${state.gesture.selectedCount}`;
}

function formatStatus() {
  if (state.mode === "gesture") {
    if (state.gesture.loading) {
      return "Loading next pose";
    }

    if (state.gesture.ended) {
      return "Session ended";
    }

    if (state.gesture.active) {
      return `Live • ${formatDuration(state.gesture.remainingMs)}`;
    }

    return "Waiting to start";
  }

  if (state.mode === "custom") {
    return formatCustomStatus();
  }

  return formatPerspectiveStatus();
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function cleanGestureTitle(title) {
  return title
    .replace(/^File:/, "")
    .replace(/\.(jpe?g|png|webp|svg|gif|tif|tiff|pdf|djvu)$/i, "")
    .replace(/[_-]+/g, " ");
}

function formatGestureSourceChoice(source) {
  if (source === "quickposes") {
    return "QuickPoses";
  }

  if (source === "commons") {
    return "Wikimedia";
  }

  if (source === "openverse") {
    return "Openverse";
  }

  return "Mixed";
}

function buildGestureNoteText() {
  const label = formatGestureSourceChoice(state.gesture.selectedSource);
  const quickposesCount = quickposesManifest.length.toLocaleString();

  if (state.gesture.selectedSource === "quickposes") {
    return `Gesture references use a bundled QuickPoses pose library with ${quickposesCount} references, so the app has a much larger non-repeating pool.`;
  }

  if (state.gesture.selectedSource === "mixed") {
    return `Gesture references use the bundled ${quickposesCount}-image QuickPoses library first, with Openverse and Wikimedia as fallback sources when needed.`;
  }

  return `Gesture references are pulled from ${label}, filtered toward single-person action photos, and not reused within the same session.`;
}

function getGestureQueryTokens(query) {
  return [...new Set(query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !gestureQueryStopWords.has(token)))];
}

function getGestureReferenceKey(reference) {
  return reference.uniqueKey || `${reference.sourceKind || "internet"}:${reference.sourceUrl || reference.imageUrl}`;
}

function dedupeGestureReferences(references) {
  const unique = new Map();

  for (const reference of references) {
    const key = getGestureReferenceKey(reference);
    const previous = unique.get(key);

    if (!previous || (reference.score || 0) > (previous.score || 0)) {
      unique.set(key, reference);
    }
  }

  return [...unique.values()];
}

function getQuickposesCandidates() {
  return quickposesManifest.map((reference) => ({
    ...reference,
    score: 60,
  }));
}

function hasSupportedGestureImageUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();

    if (/\.(jpe?g|png|webp)$/.test(path)) {
      return true;
    }

    return parsed.hostname === "api.openverse.org" && path.includes("/thumb/");
  } catch (error) {
    return /\.(jpe?g|png|webp)(?:$|[?#])/i.test(url);
  }
}

function describePerspectiveView() {
  return formatPerspectiveMode(state.perspective.selectedMode);
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

function countVisibleFaces(exercise) {
  const worldVertices = createBoxVertices(exercise.dimensions).map((vertex) =>
    add(rotatePoint(vertex, exercise.rotation), exercise.center),
  );
  const visibility = classifyFaces(worldVertices);
  return Array.from(visibility.values()).filter(Boolean).length;
}

function getRenderFamily(kind) {
  return kind === "cylinder" ? "cylinder" : "box";
}

function resolveExerciseKind(shapeMode) {
  if (shapeMode !== "random") {
    return shapeMode;
  }

  const roll = Math.random();

  if (roll < 0.3) {
    return "cube";
  }

  if (roll < 0.58) {
    return "cylinder";
  }

  return "box";
}

function buildRotationForPerspective(mode) {
  if (mode === "one") {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  if (mode === "two") {
    return {
      x: 0,
      y: randomBetween(0.5, 1.04) * randomFrom([-1, 1]),
      z: 0,
    };
  }

  return {
    x: randomBetween(0.3, 0.82) * randomFrom([-1, 1]),
    y: randomBetween(0.58, 1.08) * randomFrom([-1, 1]),
    z: 0,
  };
}

function buildExerciseCandidate(shapeMode, perspectiveMode) {
  const kind = resolveExerciseKind(shapeMode);
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

  const center =
    perspectiveMode === "one"
      ? {
          x: randomBetween(-70, 70),
          y: randomBetween(-45, 45),
          z: randomBetween(760, 1040),
        }
      : {
          x: randomBetween(-45, 45),
          y: randomBetween(-28, 28),
          z: randomBetween(780, 1080),
        };

  return {
    kind,
    dimensions,
    rotation: buildRotationForPerspective(perspectiveMode),
    center,
  };
}

function isReadableExercise(exercise, perspectiveMode) {
  if (exercise.kind === "cylinder") {
    return true;
  }

  const expectedFaces = perspectiveMode === "one" ? 1 : perspectiveMode === "two" ? 2 : 3;
  return countVisibleFaces(exercise) === expectedFaces;
}

function createExercise(shapeMode = state.perspective.selectedShape) {
  const perspectiveMode = state.perspective.selectedMode;

  for (let attempt = 0; attempt < 36; attempt += 1) {
    const candidate = buildExerciseCandidate(shapeMode, perspectiveMode);

    if (isReadableExercise(candidate, perspectiveMode)) {
      return candidate;
    }
  }

  return buildExerciseCandidate(shapeMode, perspectiveMode);
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

function cloneExercise(exercise) {
  return {
    kind: exercise.kind,
    dimensions: { ...exercise.dimensions },
    rotation: { ...exercise.rotation },
    center: { ...exercise.center },
  };
}

function ensureCanvasSize() {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  const previousView = { ...state.view };

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.view = { width, height };

  if (previousView.width !== width || previousView.height !== height) {
    scaleCustomLayout(previousView, state.view);
  }

  ensureCustomSetup();
}

function getProjectionSettings() {
  const focalFactor = state.perspective.zoomedOut ? 0.52 : 1.16;
  const guideMargin = state.perspective.zoomedOut ? 12 : 70;

  return {
    origin: { x: state.view.width / 2, y: state.view.height / 2 },
    focalLength: Math.min(state.view.width, state.view.height) * focalFactor,
    guideBounds: getBounds(state.view, guideMargin),
  };
}

function getAnimationFrame(now) {
  const perspectiveState = state.perspective;

  if (!perspectiveState.animation && perspectiveState.spin && perspectiveState.current) {
    const elapsedMs = Math.max(0, now - perspectiveState.spin.lastTime);

    if (elapsedMs > 0) {
      const elapsedSeconds = elapsedMs / 1000;
      perspectiveState.current.rotation.x = wrapAngle(
        perspectiveState.current.rotation.x + perspectiveState.spin.velocity.x * elapsedSeconds,
      );
      perspectiveState.current.rotation.y = wrapAngle(
        perspectiveState.current.rotation.y + perspectiveState.spin.velocity.y * elapsedSeconds,
      );
      perspectiveState.current.rotation.z = wrapAngle(
        perspectiveState.current.rotation.z + perspectiveState.spin.velocity.z * elapsedSeconds,
      );

      const damping = Math.exp(-4.2 * elapsedSeconds);
      perspectiveState.spin.velocity.x *= damping;
      perspectiveState.spin.velocity.y *= damping;
      perspectiveState.spin.velocity.z *= damping;
      perspectiveState.spin.lastTime = now;
    }

    const speed = Math.hypot(
      perspectiveState.spin.velocity.x,
      perspectiveState.spin.velocity.y,
      perspectiveState.spin.velocity.z,
    );

    if (speed < 0.08) {
      perspectiveState.spin = null;
    } else {
      requestRender();
    }
  }

  if (!perspectiveState.animation) {
    return perspectiveState.current
      ? {
          mode: "single",
          exercise: perspectiveState.current,
        }
      : null;
  }

  const elapsed = now - perspectiveState.animation.start;
  const rawT = clamp(elapsed / perspectiveState.animation.duration, 0, 1);
  const eased = easeInOutCubic(rawT);

  if (rawT >= 1) {
    perspectiveState.current = perspectiveState.animation.to;
    perspectiveState.animation = null;
    return {
      mode: "single",
      exercise: perspectiveState.current,
    };
  }

  requestRender();

  if (
    getRenderFamily(perspectiveState.animation.from.kind) ===
    getRenderFamily(perspectiveState.animation.to.kind)
  ) {
    return {
      mode: "single",
      exercise: interpolateExercise(perspectiveState.animation.from, perspectiveState.animation.to, eased),
    };
  }

  return {
    mode: "blend",
    fromExercise: interpolateExercise(
      perspectiveState.animation.from,
      perspectiveState.animation.to,
      eased,
      perspectiveState.animation.from.kind,
    ),
    toExercise: interpolateExercise(
      perspectiveState.animation.from,
      perspectiveState.animation.to,
      eased,
      perspectiveState.animation.to.kind,
    ),
    fromAlpha: 1 - eased,
    toAlpha: eased,
    infoExercise:
      eased < 0.5
        ? interpolateExercise(
            perspectiveState.animation.from,
            perspectiveState.animation.to,
            eased,
            perspectiveState.animation.from.kind,
          )
        : interpolateExercise(
            perspectiveState.animation.from,
            perspectiveState.animation.to,
            eased,
            perspectiveState.animation.to.kind,
          ),
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

function getBounds(view, margin = 0) {
  return {
    minX: -margin,
    maxX: view.width + margin,
    minY: -margin,
    maxY: view.height + margin,
  };
}

function isPointInside(point, bounds) {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
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

  for (const entry of intersections) {
    const duplicate = unique.some(
      (candidate) => Math.abs(candidate.x - entry.x) < 0.5 && Math.abs(candidate.y - entry.y) < 0.5,
    );

    if (!duplicate) {
      unique.push(entry);
    }
  }

  if (unique.length < 2) {
    return null;
  }

  return [unique[0], unique[unique.length - 1]];
}

function computeVanishingPoint(direction, focalLength, origin) {
  if (Math.abs(direction.z) < 0.06) {
    return null;
  }

  return {
    x: origin.x + (focalLength * direction.x) / direction.z,
    y: origin.y - (focalLength * direction.y) / direction.z,
  };
}

function formatCustomMode(mode) {
  return formatPerspectiveMode(mode);
}

function buildDefaultCustomGuides(view = state.view) {
  const horizonY = view.height * 0.42;

  return {
    horizonY,
    vp1: { x: view.width * 0.26, y: horizonY },
    vp2: { x: view.width * 0.78, y: horizonY },
    vp3: { x: view.width * 0.54, y: view.height * 1.08 },
  };
}

function ensureCustomSetup() {
  if (state.custom.guides || state.view.width <= 0 || state.view.height <= 0) {
    return;
  }

  state.custom.guides = buildDefaultCustomGuides();
}

function scaleCustomLayout(previousView, nextView) {
  if (previousView.width <= 0 || previousView.height <= 0) {
    return;
  }

  const scaleX = nextView.width / previousView.width;
  const scaleY = nextView.height / previousView.height;
  const guides = state.custom.guides;

  if (guides) {
    guides.horizonY *= scaleY;
    guides.vp1.x *= scaleX;
    guides.vp1.y = guides.horizonY;
    guides.vp2.x *= scaleX;
    guides.vp2.y = guides.horizonY;
    guides.vp3.x *= scaleX;
    guides.vp3.y *= scaleY;
  }

  for (const shape of state.custom.shapes) {
    shape.origin.x *= scaleX;
    shape.origin.y *= scaleY;

    if (shape.kind === "cube") {
      shape.size = (shape.size || getCustomCubeBaseSize(shape)) * averageNumbers([scaleX, scaleY]);
    } else {
      shape.width *= scaleX;
      shape.height *= scaleY;
    }

    normalizeCustomShape(shape);
  }
}

function resetCustomGuides() {
  state.custom.guides = buildDefaultCustomGuides();

  for (const shape of state.custom.shapes) {
    normalizeCustomShape(shape);
  }

  requestRender();
}

function averageNumbers(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCustomSelectedShape() {
  return state.custom.shapes.find((shape) => shape.id === state.custom.selectedShapeId) || null;
}

function getCustomVerticalSign() {
  const guides = state.custom.guides || buildDefaultCustomGuides();

  if (state.custom.perspectiveMode === "three") {
    return guides.vp3.y > guides.horizonY ? 1 : -1;
  }

  return guides.horizonY < state.view.height / 2 ? 1 : -1;
}

function createCustomShape(kind) {
  ensureCustomSetup();

  const sign = getCustomVerticalSign();
  const mode = state.custom.perspectiveMode;
  const offset = state.custom.shapes.length * 22;
  const width = kind === "cube" ? 160 : kind === "box" ? 188 : 152;
  const height = kind === "cube" ? 160 : kind === "box" ? 122 : 220;
  const origin =
    mode === "one"
      ? {
          x: state.view.width * 0.32 + offset,
          y: (sign > 0 ? state.view.height * 0.34 : state.view.height * 0.72) - offset * 0.35,
        }
      : {
          x: state.view.width * 0.48 + offset,
          y: (sign > 0 ? state.view.height * 0.38 : state.view.height * 0.74) - offset * 0.3,
        };

  const shape = {
    id: state.custom.nextShapeId,
    kind,
    origin,
    width,
    height,
    size: kind === "cube" ? width : undefined,
    verticalSign: sign,
    depthT: kind === "cube" ? 0.24 : 0.3,
    xT: kind === "cube" ? 0.22 : 0.27,
    zT: kind === "cube" ? 0.22 : 0.3,
    yT: kind === "cube" ? 0.22 : 0.28,
  };

  state.custom.nextShapeId += 1;
  state.custom.shapes.push(normalizeCustomShape(shape));
  state.custom.selectedShapeId = shape.id;
  requestRender();
}

function getCustomCubeBaseSize(shape) {
  const guides = state.custom.guides || buildDefaultCustomGuides();
  const mode = state.custom.perspectiveMode;
  const origin = shape.origin;

  if (Number.isFinite(shape.size)) {
    return shape.size;
  }

  if (mode === "one") {
    return averageNumbers([
      shape.width || 160,
      shape.height || 160,
      (shape.depthT || 0.24) * distance2(origin, guides.vp1),
    ]);
  }

  if (mode === "two") {
    return averageNumbers([
      shape.height || 160,
      (shape.xT || 0.22) * distance2(origin, guides.vp1),
      (shape.zT || 0.22) * distance2(origin, guides.vp2),
    ]);
  }

  return averageNumbers([
    (shape.xT || 0.22) * distance2(origin, guides.vp1),
    (shape.yT || 0.22) * distance2(origin, guides.vp3),
    (shape.zT || 0.22) * distance2(origin, guides.vp2),
  ]);
}

function getCustomCubeMetrics(shape) {
  const guides = state.custom.guides || buildDefaultCustomGuides();
  const mode = state.custom.perspectiveMode;
  const origin = shape.origin;
  const xDistance = Math.max(distance2(origin, guides.vp1), 1);
  const zDistance = Math.max(distance2(origin, guides.vp2), 1);
  const yDistance = Math.max(distance2(origin, guides.vp3), 1);
  const maxSize =
    mode === "one"
      ? Math.min(state.view.width * 0.45, state.view.height * 0.58, xDistance * 0.84)
      : mode === "two"
        ? Math.min(state.view.height * 0.58, xDistance * 0.82, zDistance * 0.82)
        : Math.min(xDistance * 0.82, yDistance * 0.82, zDistance * 0.82);
  const clampedMax = Math.max(32, maxSize);
  const size = clamp(getCustomCubeBaseSize(shape), Math.min(48, clampedMax), clampedMax);

  return {
    size,
    width: size,
    height: size,
    depthT: clamp(size / xDistance, 0.08, 0.84),
    xT: clamp(size / xDistance, 0.08, 0.82),
    yT: clamp(size / yDistance, 0.08, 0.82),
    zT: clamp(size / zDistance, 0.08, 0.82),
  };
}

function getCustomShapeGeometry(shape) {
  ensureCustomSetup();
  const { perspectiveMode, guides } = state.custom;
  const origin = { ...shape.origin };
  const cubeMetrics = shape.kind === "cube" ? getCustomCubeMetrics(shape) : null;
  const width = cubeMetrics ? cubeMetrics.width : shape.width;
  const height = cubeMetrics ? cubeMetrics.height : shape.height;
  const depthT = cubeMetrics ? cubeMetrics.depthT : shape.depthT;
  const xT = cubeMetrics ? cubeMetrics.xT : shape.xT;
  const yT = cubeMetrics ? cubeMetrics.yT : shape.yT;
  const zT = cubeMetrics ? cubeMetrics.zT : shape.zT;

  if (perspectiveMode === "one") {
    const xHandle = { x: origin.x + width, y: origin.y };
    const yHandle = { x: origin.x, y: origin.y + height * shape.verticalSign };
    const xyHandle = { x: xHandle.x, y: yHandle.y };
    const zHandle = lerpPoint(origin, guides.vp1, depthT);
    const xzHandle = lerpPoint(xHandle, guides.vp1, depthT);
    const yzHandle = lerpPoint(yHandle, guides.vp1, depthT);
    const xyzHandle = lerpPoint(xyHandle, guides.vp1, depthT);

    return {
      vertices: [origin, xHandle, yHandle, xyHandle, zHandle, xzHandle, yzHandle, xyzHandle],
      handles: {
        origin,
        x: xHandle,
        y: yHandle,
        z: zHandle,
      },
    };
  }

  if (perspectiveMode === "two") {
    const xHandle = lerpPoint(origin, guides.vp1, xT);
    const zHandle = lerpPoint(origin, guides.vp2, zT);
    const yHandle = { x: origin.x, y: origin.y + height * shape.verticalSign };
    const xzHandle =
      getLineIntersection(xHandle, guides.vp2, zHandle, guides.vp1) ||
      add2(lerpPoint(origin, guides.vp1, xT), subtract2(zHandle, origin));
    const xyHandle =
      getVerticalLineIntersection(xHandle, yHandle, guides.vp1) ||
      getLineIntersection(yHandle, guides.vp1, xHandle, { x: xHandle.x, y: xHandle.y + 1 }) ||
      { x: xHandle.x, y: yHandle.y };
    const yzHandle =
      getVerticalLineIntersection(zHandle, yHandle, guides.vp2) ||
      getLineIntersection(yHandle, guides.vp2, zHandle, { x: zHandle.x, y: zHandle.y + 1 }) ||
      { x: zHandle.x, y: yHandle.y };
    const xyzHandle =
      getVerticalLineIntersection(xzHandle, xyHandle, guides.vp2) ||
      getVerticalLineIntersection(xzHandle, yzHandle, guides.vp1) ||
      getLineIntersection(xyHandle, guides.vp2, yzHandle, guides.vp1) ||
      { x: xzHandle.x, y: yHandle.y };

    return {
      vertices: [origin, xHandle, yHandle, xyHandle, zHandle, xzHandle, yzHandle, xyzHandle],
      handles: {
        origin,
        x: xHandle,
        y: yHandle,
        z: zHandle,
      },
    };
  }

  const xHandle = lerpPoint(origin, guides.vp1, xT);
  const yHandle = lerpPoint(origin, guides.vp3, yT);
  const zHandle = lerpPoint(origin, guides.vp2, zT);
  const xyHandle =
    getLineIntersection(xHandle, guides.vp3, yHandle, guides.vp1) ||
    lerpPoint(xHandle, yHandle, 0.5);
  const xzHandle =
    getLineIntersection(xHandle, guides.vp2, zHandle, guides.vp1) ||
    lerpPoint(xHandle, zHandle, 0.5);
  const yzHandle =
    getLineIntersection(yHandle, guides.vp2, zHandle, guides.vp3) ||
    lerpPoint(yHandle, zHandle, 0.5);
  const xyzHandle =
    getLineIntersection(xyHandle, guides.vp2, xzHandle, guides.vp3) ||
    getLineIntersection(yzHandle, guides.vp1, xzHandle, guides.vp3) ||
    lerpPoint(xyHandle, yzHandle, 0.5);

  return {
    vertices: [origin, xHandle, yHandle, xyHandle, zHandle, xzHandle, yzHandle, xyzHandle],
    handles: {
      origin,
      x: xHandle,
      y: yHandle,
      z: zHandle,
    },
  };
}

function getCustomShapeBounds(geometry) {
  const xs = geometry.vertices.map((point) => point.x);
  const ys = geometry.vertices.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function getCustomPalette() {
  const overPhoto = Boolean(state.custom.photo?.image);

  return {
    visible: overPhoto ? "rgba(186, 42, 32, 0.72)" : "rgba(144, 36, 28, 0.9)",
    hidden: overPhoto ? "rgba(186, 42, 32, 0.34)" : "rgba(144, 36, 28, 0.45)",
    guide: overPhoto ? "rgba(210, 54, 42, 0.24)" : "rgba(160, 79, 29, 0.28)",
    guideStrong: overPhoto ? "rgba(210, 54, 42, 0.42)" : "rgba(160, 79, 29, 0.42)",
    handle: overPhoto ? "rgba(210, 54, 42, 0.9)" : "rgba(160, 79, 29, 0.84)",
    selection: overPhoto ? "rgba(186, 42, 32, 0.14)" : "rgba(160, 79, 29, 0.12)",
  };
}

function getCustomVisibleFaces() {
  const visibility = new Map(faceDefinitions.map((face) => [face.name, false]));

  visibility.set("near", true);
  visibility.set("bottom", true);

  if (state.custom.perspectiveMode !== "one") {
    visibility.set("left", true);
  }

  return visibility;
}

function solveLinearSystem(matrix, values) {
  const system = matrix.map((row, index) => [...row, values[index]]);

  for (let column = 0; column < system.length; column += 1) {
    let pivot = column;

    for (let row = column + 1; row < system.length; row += 1) {
      if (Math.abs(system[row][column]) > Math.abs(system[pivot][column])) {
        pivot = row;
      }
    }

    if (Math.abs(system[pivot][column]) < 0.00001) {
      return null;
    }

    [system[column], system[pivot]] = [system[pivot], system[column]];
    const pivotValue = system[column][column];

    for (let index = column; index <= system.length; index += 1) {
      system[column][index] /= pivotValue;
    }

    for (let row = 0; row < system.length; row += 1) {
      if (row === column) {
        continue;
      }

      const factor = system[row][column];

      for (let index = column; index <= system.length; index += 1) {
        system[row][index] -= factor * system[column][index];
      }
    }
  }

  return system.map((row) => row[system.length]);
}

function buildQuadHomography(quad) {
  const source = [
    { u: 0, v: 0, target: quad[0] },
    { u: 1, v: 0, target: quad[1] },
    { u: 1, v: 1, target: quad[2] },
    { u: 0, v: 1, target: quad[3] },
  ];
  const matrix = [];
  const values = [];

  for (const point of source) {
    matrix.push([point.u, point.v, 1, 0, 0, 0, -point.u * point.target.x, -point.v * point.target.x]);
    values.push(point.target.x);
    matrix.push([0, 0, 0, point.u, point.v, 1, -point.u * point.target.y, -point.v * point.target.y]);
    values.push(point.target.y);
  }

  const solution = solveLinearSystem(matrix, values);

  if (!solution) {
    return null;
  }

  const [a, b, c, d, e, f, g, h] = solution;

  return {
    matrix: [
      [a, b, c],
      [d, e, f],
      [g, h, 1],
    ],
    project(u, v) {
      const denominator = g * u + h * v + 1;

      return {
        x: (a * u + b * v + c) / denominator,
        y: (d * u + e * v + f) / denominator,
      };
    },
  };
}

function buildQuadProjector(quad) {
  const homography = buildQuadHomography(quad);
  return homography ? homography.project.bind(homography) : null;
}

function transpose3x3(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

function multiply3x3(left, right) {
  return left.map((row) =>
    right[0].map((_, column) =>
      row.reduce((sum, value, index) => sum + value * right[index][column], 0),
    ),
  );
}

function invert3x3(matrix) {
  const [
    [a, b, c],
    [d, e, f],
    [g, h, i],
  ] = matrix;
  const cofactor00 = e * i - f * h;
  const cofactor01 = -(d * i - f * g);
  const cofactor02 = d * h - e * g;
  const cofactor10 = -(b * i - c * h);
  const cofactor11 = a * i - c * g;
  const cofactor12 = -(a * h - b * g);
  const cofactor20 = b * f - c * e;
  const cofactor21 = -(a * f - c * d);
  const cofactor22 = a * e - b * d;
  const determinant = a * cofactor00 + b * cofactor01 + c * cofactor02;

  if (Math.abs(determinant) < 0.0000001) {
    return null;
  }

  const adjugate = [
    [cofactor00, cofactor10, cofactor20],
    [cofactor01, cofactor11, cofactor21],
    [cofactor02, cofactor12, cofactor22],
  ];

  return adjugate.map((row) => row.map((value) => value / determinant));
}

function symmetrize3x3(matrix) {
  return matrix.map((row, rowIndex) =>
    row.map((value, columnIndex) => (value + matrix[columnIndex][rowIndex]) / 2),
  );
}

function getFaceQuad(vertices, faceName) {
  const indices = faceQuadIndices[faceName];
  return indices ? indices.map((index) => vertices[index]) : null;
}

function getProjectedEllipseGuide(quad, segmentCount = 72) {
  const homography = buildQuadHomography(quad);

  if (!homography) {
    return null;
  }

  const project = homography.project.bind(homography);
  const points = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    const angle = (index / segmentCount) * Math.PI * 2;
    points.push(project(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)));
  }

  const contourPoints = {
    sideA: project(0, 0.5),
    sideB: project(1, 0.5),
    hiddenA: project(0.5, 0),
    hiddenB: project(0.5, 1),
  };
  const projectedCenter = project(0.5, 0.5);

  const fallbackGuide = () => {
    const horizontalSpan = distance2(contourPoints.sideA, contourPoints.sideB);
    const verticalSpan = distance2(contourPoints.hiddenA, contourPoints.hiddenB);
    const majorAxis =
      horizontalSpan >= verticalSpan
        ? [contourPoints.sideA, contourPoints.sideB]
        : [contourPoints.hiddenA, contourPoints.hiddenB];
    const minorAxis =
      horizontalSpan >= verticalSpan
        ? [contourPoints.hiddenA, contourPoints.hiddenB]
        : [contourPoints.sideA, contourPoints.sideB];

    return {
      points,
      center: projectedCenter,
      contourPoints,
      majorAxis,
      minorAxis,
    };
  };

  const inverse = invert3x3(homography.matrix);

  if (!inverse) {
    return fallbackGuide();
  }

  const conic = symmetrize3x3(multiply3x3(transpose3x3(inverse), multiply3x3(unitCircleConic, inverse)));
  const a = conic[0][0];
  const b = conic[0][1];
  const c = conic[1][1];
  const d = conic[0][2];
  const e = conic[1][2];
  const f = conic[2][2];
  const determinant = a * c - b * b;

  if (Math.abs(determinant) < 0.0000001) {
    return fallbackGuide();
  }

  const center = {
    x: (b * e - c * d) / determinant,
    y: (b * d - a * e) / determinant,
  };
  const centeredConstant =
    a * center.x * center.x +
    2 * b * center.x * center.y +
    c * center.y * center.y +
    2 * d * center.x +
    2 * e * center.y +
    f;
  const trace = a + c;
  const root = Math.sqrt((a - c) * (a - c) + 4 * b * b);
  let majorRadius = Math.sqrt(-centeredConstant / ((trace - root) / 2));
  let minorRadius = Math.sqrt(-centeredConstant / ((trace + root) / 2));

  if (!Number.isFinite(majorRadius) || !Number.isFinite(minorRadius)) {
    return fallbackGuide();
  }

  let majorDirection = {
    x: Math.cos(0.5 * Math.atan2(2 * b, a - c)),
    y: Math.sin(0.5 * Math.atan2(2 * b, a - c)),
  };
  let minorDirection = {
    x: -majorDirection.y,
    y: majorDirection.x,
  };

  if (minorRadius > majorRadius) {
    [majorRadius, minorRadius] = [minorRadius, majorRadius];
    [majorDirection, minorDirection] = [minorDirection, majorDirection];
  }

  return {
    points,
    center,
    contourPoints,
    majorAxis: [
      add2(center, scale2(majorDirection, -majorRadius)),
      add2(center, scale2(majorDirection, majorRadius)),
    ],
    minorAxis: [
      add2(center, scale2(minorDirection, -minorRadius)),
      add2(center, scale2(minorDirection, minorRadius)),
    ],
  };
}

function getProjectedEllipsePoints(quad, segmentCount = 60) {
  const projector = buildQuadProjector(quad);

  if (!projector) {
    return [];
  }

  const points = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    const angle = (index / segmentCount) * Math.PI * 2;
    points.push(projector(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)));
  }

  return points;
}

function getCustomPhotoLayout() {
  if (!state.custom.photo?.image) {
    return null;
  }

  const { image } = state.custom.photo;
  const scale = Math.min(state.view.width / image.naturalWidth, state.view.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;

  return {
    x: (state.view.width - width) / 2,
    y: (state.view.height - height) / 2,
    width,
    height,
  };
}

function buildPhotoAnalysis(image) {
  const maxSize = 960;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = width;
  analysisCanvas.height = height;
  const analysisCtx = analysisCanvas.getContext("2d", { willReadFrequently: true });
  analysisCtx.drawImage(image, 0, 0, width, height);
  const imageData = analysisCtx.getImageData(0, 0, width, height).data;
  const darkness = new Float32Array(width * height);

  for (let index = 0; index < width * height; index += 1) {
    const pixelIndex = index * 4;
    const value =
      (0.299 * imageData[pixelIndex] +
        0.587 * imageData[pixelIndex + 1] +
        0.114 * imageData[pixelIndex + 2]) /
      255;
    const ink = clamp((0.92 - value) / 0.92, 0, 1);
    darkness[index] = ink * ink;
  }

  return { width, height, darkness };
}

function samplePhotoDarkness(point) {
  const photo = state.custom.photo;
  const layout = getCustomPhotoLayout();

  if (!photo?.analysis || !layout) {
    return 0;
  }

  const u = (point.x - layout.x) / layout.width;
  const v = (point.y - layout.y) / layout.height;

  if (u < 0 || u > 1 || v < 0 || v > 1) {
    return 0;
  }

  const x = clamp(Math.round(u * (photo.analysis.width - 1)), 0, photo.analysis.width - 1);
  const y = clamp(Math.round(v * (photo.analysis.height - 1)), 0, photo.analysis.height - 1);
  return photo.analysis.darkness[y * photo.analysis.width + x];
}

function sampleAnalysisDarkness(analysis, point) {
  const x = clamp(Math.round(point.x), 0, analysis.width - 1);
  const y = clamp(Math.round(point.y), 0, analysis.height - 1);
  return analysis.darkness[y * analysis.width + x];
}

function scoreAnalysisLine(analysis, start, end, weight = 1) {
  const length = distance2(start, end);

  if (length < 6) {
    return 0;
  }

  const sampleCount = clamp(Math.ceil(length / 8), 8, 72);
  const normal = {
    x: -(end.y - start.y) / length,
    y: (end.x - start.x) / length,
  };
  let total = 0;

  for (let index = 0; index <= sampleCount; index += 1) {
    const t = index / sampleCount;
    const point = lerpPoint(start, end, t);
    let best = 0;

    for (const offset of [0, 1, -1, 2, -2]) {
      best = Math.max(
        best,
        sampleAnalysisDarkness(analysis, {
          x: point.x + normal.x * offset,
          y: point.y + normal.y * offset,
        }),
      );
    }

    total += best;
  }

  return (total / (sampleCount + 1)) * weight;
}

function mapAnalysisPointToCanvas(point) {
  const layout = getCustomPhotoLayout();
  const analysis = state.custom.photo?.analysis;

  if (!layout || !analysis) {
    return point;
  }

  return {
    x: layout.x + (point.x / analysis.width) * layout.width,
    y: layout.y + (point.y / analysis.height) * layout.height,
  };
}

function scoreAnalysisRayCandidate(analysis, vp, anchor) {
  const clipped = clipLineToBounds(anchor, { x: anchor.x - vp.x, y: anchor.y - vp.y }, {
    minX: 0,
    maxX: analysis.width - 1,
    minY: 0,
    maxY: analysis.height - 1,
  });

  if (!clipped) {
    return 0;
  }

  return scoreAnalysisLine(analysis, clipped[0], clipped[1]);
}

function detectAnalysisHorizon(analysis) {
  let best = {
    y: analysis.height * 0.42,
    score: -Infinity,
  };

  for (let y = Math.round(analysis.height * 0.16); y <= Math.round(analysis.height * 0.74); y += 2) {
    const score = scoreAnalysisLine(
      analysis,
      { x: 0, y },
      { x: analysis.width - 1, y },
      1.25,
    );

    if (score > best.score) {
      best = { y, score };
    }
  }

  return best;
}

function detectVanishingCandidate(analysis, horizonY, side) {
  const width = analysis.width;
  const height = analysis.height;
  const anchorsX =
    side === "left"
      ? [0.14, 0.26, 0.38, 0.5, 0.62]
      : side === "right"
        ? [0.38, 0.5, 0.62, 0.74, 0.86]
        : [0.22, 0.34, 0.46, 0.58, 0.7, 0.82];
  const anchorsY = [0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8];
  const minX = side === "left" ? -width * 1.8 : side === "right" ? width * 0.85 : width * 0.18;
  const maxX = side === "left" ? width * 0.15 : side === "right" ? width * 2.6 : width * 0.82;
  const step = Math.max(8, Math.round((maxX - minX) / 120));
  let best = {
    x: side === "left" ? -width * 0.9 : side === "right" ? width * 1.9 : width * 0.5,
    score: -Infinity,
  };

  for (let candidateX = minX; candidateX <= maxX; candidateX += step) {
    const vp = { x: candidateX, y: horizonY };
    const scores = [];

    for (const yRatio of anchorsY) {
      for (const xRatio of anchorsX) {
        const anchor = {
          x: width * xRatio,
          y: height * yRatio,
        };
        const angle = Math.abs(Math.atan2(anchor.y - horizonY, anchor.x - candidateX));

        if (angle < 0.1) {
          continue;
        }

        scores.push(scoreAnalysisRayCandidate(analysis, vp, anchor));
      }
    }

    scores.sort((left, right) => right - left);
    const score = scores.slice(0, 12).reduce((sum, value) => sum + value, 0);

    if (score > best.score) {
      best = { x: candidateX, score };
    }
  }

  return best;
}

function analyzePhotoPerspective() {
  const analysis = state.custom.photo?.analysis;

  if (!analysis) {
    return null;
  }

  const horizon = detectAnalysisHorizon(analysis);
  const left = detectVanishingCandidate(analysis, horizon.y, "left");
  const right = detectVanishingCandidate(analysis, horizon.y, "right");
  const center = detectVanishingCandidate(analysis, horizon.y, "center");
  const twoPointStrength = left.score + right.score;
  const onePointStrength = center.score * 1.2;
  const mode = twoPointStrength > onePointStrength ? "two" : "one";

  if (mode === "one") {
    return {
      mode,
      horizonY: horizon.y,
      vp1: { x: center.x, y: horizon.y },
      vp2: { x: right.x, y: horizon.y },
      vp3: { x: analysis.width * 0.5, y: analysis.height * 1.1 },
    };
  }

  return {
    mode,
    horizonY: horizon.y,
    vp1: { x: left.x, y: horizon.y },
    vp2: { x: right.x, y: horizon.y },
    vp3: { x: analysis.width * 0.5, y: analysis.height * 1.1 },
  };
}

function scoreLineAgainstPhoto(start, end, weight = 1) {
  const length = distance2(start, end);

  if (length < 6) {
    return 0;
  }

  const sampleCount = clamp(Math.ceil(length / 10), 8, 44);
  const normal = {
    x: -(end.y - start.y) / length,
    y: (end.x - start.x) / length,
  };
  let total = 0;

  for (let index = 0; index <= sampleCount; index += 1) {
    const t = index / sampleCount;
    const point = lerpPoint(start, end, t);
    let best = 0;

    for (const offset of [0, 1.5, -1.5, 3, -3]) {
      best = Math.max(
        best,
        samplePhotoDarkness({
          x: point.x + normal.x * offset,
          y: point.y + normal.y * offset,
        }),
      );
    }

    total += best;
  }

  return (total / (sampleCount + 1)) * weight;
}

function getCustomBoxSegments(geometry) {
  const faceVisibility = getCustomVisibleFaces();
  const hiddenEdges = [];
  const visibleEdges = [];

  for (const edge of edges) {
    const [aIndex, bIndex] = edge.indices;
    const segment = [geometry.vertices[aIndex], geometry.vertices[bIndex]];
    const isVisible = edge.faces.some((name) => faceVisibility.get(name));

    if (isVisible) {
      visibleEdges.push(segment);
    } else {
      hiddenEdges.push(segment);
    }
  }

  return { visibleEdges, hiddenEdges };
}

function cloneCustomShape(shape) {
  const clone = {
    ...shape,
    origin: { ...shape.origin },
  };

  if (clone.kind === "cube") {
    normalizeCustomShape(clone);
  }

  return clone;
}

function normalizeCustomShape(shape) {
  shape.origin.x = clamp(shape.origin.x, 28, state.view.width - 28);
  shape.origin.y = clamp(shape.origin.y, 28, state.view.height - 28);

  if (shape.kind === "cube") {
    const metrics = getCustomCubeMetrics(shape);
    shape.size = metrics.size;
    shape.width = metrics.width;
    shape.height = metrics.height;
    shape.depthT = metrics.depthT;
    shape.xT = metrics.xT;
    shape.zT = metrics.zT;
    shape.yT = metrics.yT;
    return shape;
  }

  shape.width = clamp(shape.width, 48, state.view.width * 0.55);
  shape.height = clamp(shape.height, 48, state.view.height * 0.62);
  shape.depthT = clamp(shape.depthT, 0.08, 0.84);
  shape.xT = clamp(shape.xT, 0.08, 0.84);
  shape.zT = clamp(shape.zT, 0.08, 0.84);
  shape.yT = clamp(shape.yT, 0.08, 0.84);
  return shape;
}

function scaleCustomShape(shape, factor) {
  const beforeGeometry = getCustomShapeGeometry(shape);
  const beforeBounds = getCustomShapeBounds(beforeGeometry);
  const beforeCenter = {
    x: (beforeBounds.minX + beforeBounds.maxX) / 2,
    y: (beforeBounds.minY + beforeBounds.maxY) / 2,
  };

  if (shape.kind === "cube") {
    shape.size = (shape.size || getCustomCubeBaseSize(shape)) * factor;
  } else {
    shape.width *= factor;
    shape.height *= factor;
    shape.depthT *= factor;
    shape.xT *= factor;
    shape.zT *= factor;
    shape.yT *= factor;
  }

  normalizeCustomShape(shape);

  const afterGeometry = getCustomShapeGeometry(shape);
  const afterBounds = getCustomShapeBounds(afterGeometry);
  const afterCenter = {
    x: (afterBounds.minX + afterBounds.maxX) / 2,
    y: (afterBounds.minY + afterBounds.maxY) / 2,
  };

  shape.origin = {
    x: clamp(shape.origin.x + (beforeCenter.x - afterCenter.x), 28, state.view.width - 28),
    y: clamp(shape.origin.y + (beforeCenter.y - afterCenter.y), 28, state.view.height - 28),
  };

  normalizeCustomShape(shape);
}

function getAutoCorrectParameters(shape) {
  if (shape.kind === "cube") {
    return [
      { key: "origin.x", step: 18 },
      { key: "origin.y", step: 18 },
      { key: "size", step: 18 },
    ];
  }

  if (state.custom.perspectiveMode === "one") {
    return [
      { key: "origin.x", step: 18 },
      { key: "origin.y", step: 18 },
      { key: "width", step: 16 },
      { key: "height", step: 16 },
      { key: "depthT", step: 0.055 },
    ];
  }

  if (state.custom.perspectiveMode === "two") {
    return [
      { key: "origin.x", step: 18 },
      { key: "origin.y", step: 18 },
      { key: "height", step: 18 },
      { key: "xT", step: 0.05 },
      { key: "zT", step: 0.05 },
    ];
  }

  return [
    { key: "origin.x", step: 18 },
    { key: "origin.y", step: 18 },
    { key: "xT", step: 0.05 },
    { key: "zT", step: 0.05 },
    { key: "yT", step: 0.05 },
  ];
}

function adjustCustomShape(shape, key, delta) {
  if (key === "origin.x") {
    shape.origin.x += delta;
  } else if (key === "origin.y") {
    shape.origin.y += delta;
  } else {
    shape[key] += delta;
  }
}

function optimizeBoxShapeAgainstPhoto(seedShape, focusPoint = null) {
  const baseline = cloneCustomShape(seedShape);
  let candidate = cloneCustomShape(seedShape);
  let bestScore = scoreBoxShapeAgainstPhoto(candidate, baseline, focusPoint);
  const parameters = getAutoCorrectParameters(candidate).map((parameter) => ({ ...parameter }));

  for (let round = 0; round < 6; round += 1) {
    let improved = true;

    while (improved) {
      improved = false;

      for (const parameter of parameters) {
        for (const direction of [-1, 1]) {
          const testShape = cloneCustomShape(candidate);
          adjustCustomShape(testShape, parameter.key, parameter.step * direction);
          normalizeCustomShape(testShape);
          const score = scoreBoxShapeAgainstPhoto(testShape, baseline, focusPoint);

          if (score > bestScore) {
            bestScore = score;
            candidate = testShape;
            improved = true;
          }
        }
      }
    }

    for (const parameter of parameters) {
      parameter.step *= 0.6;
    }
  }

  return {
    shape: candidate,
    score: bestScore,
  };
}

function createAnalyzedShapeSeed(kind, point, offset) {
  const sign = getCustomVerticalSign();
  const mode = state.custom.perspectiveMode;
  const baseWidth = kind === "cube" ? 138 : 168;
  const baseHeight = kind === "cube" ? 138 : 112;
  const origin =
    mode === "one"
      ? {
          x: point.x - baseWidth * 0.36 + offset.x,
          y: point.y - baseHeight * 0.34 + offset.y,
        }
      : {
          x: point.x - 10 + offset.x,
          y: point.y - baseHeight * 0.46 + offset.y,
        };

  return normalizeCustomShape({
    id: 0,
    kind,
    origin,
    width: baseWidth,
    height: baseHeight,
    size: kind === "cube" ? baseWidth : undefined,
    verticalSign: sign,
    depthT: kind === "cube" ? 0.24 : 0.32,
    xT: kind === "cube" ? 0.22 : 0.29,
    zT: kind === "cube" ? 0.22 : 0.31,
    yT: kind === "cube" ? 0.22 : 0.28,
  });
}

function fitAnalyzedShapeAtPoint(kind, point) {
  const seedOffsets = [
    { x: -56, y: -34 },
    { x: 0, y: -34 },
    { x: 56, y: -34 },
    { x: -28, y: 8 },
    { x: 28, y: 8 },
    { x: 0, y: 28 },
  ];
  let best = null;

  for (const offset of seedOffsets) {
    const seed = createAnalyzedShapeSeed(kind, point, offset);
    const optimized = optimizeBoxShapeAgainstPhoto(seed, point);

    if (!best || optimized.score > best.score) {
      best = optimized;
    }
  }

  if (!best) {
    return null;
  }

  const shape = best.shape;
  shape.id = state.custom.nextShapeId;
  state.custom.nextShapeId += 1;
  return shape;
}

function scoreBoxShapeAgainstPhoto(shape, baseline, focusPoint = null) {
  const geometry = getCustomShapeGeometry(shape);
  const { visibleEdges, hiddenEdges } = getCustomBoxSegments(geometry);
  let score = 0;

  for (const [start, end] of visibleEdges) {
    score += scoreLineAgainstPhoto(start, end, 1.2);
  }

  if (state.custom.showHidden) {
    for (const [start, end] of hiddenEdges) {
      score += scoreLineAgainstPhoto(start, end, 0.55);
    }
  }

  const dx = Math.abs(shape.origin.x - baseline.origin.x) / 120;
  const dy = Math.abs(shape.origin.y - baseline.origin.y) / 120;
  const dw = Math.abs(shape.width - baseline.width) / 120;
  const dh = Math.abs(shape.height - baseline.height) / 120;
  const dt =
    Math.abs(shape.depthT - baseline.depthT) +
    Math.abs(shape.xT - baseline.xT) +
    Math.abs(shape.zT - baseline.zT) +
    Math.abs(shape.yT - baseline.yT);

  if (focusPoint) {
    const bounds = getCustomShapeBounds(geometry);
    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };

    score -= distance2(center, focusPoint) / 180;

    if (
      focusPoint.x >= bounds.minX &&
      focusPoint.x <= bounds.maxX &&
      focusPoint.y >= bounds.minY &&
      focusPoint.y <= bounds.maxY
    ) {
      score += 0.7;
    }
  }

  return score - (dx + dy + dw + dh) * 0.34 - dt * 1.1;
}

function drawPolyline(points, lineWidth, strokeStyle, dashPattern = []) {
  if (points.length < 2) {
    return;
  }

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dashPattern);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }

  ctx.stroke();
}

function drawGuidePoint(point, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function getCylinderGuideConnectorSets(faceEntries) {
  const centerline = subtract2(faceEntries[1].guide.center, faceEntries[0].guide.center);
  const length = Math.hypot(centerline.x, centerline.y);
  const normal =
    length > 0.0001
      ? { x: -centerline.y / length, y: centerline.x / length }
      : { x: 0, y: 1 };
  const sideScore = faceEntries.reduce((sum, entry) => {
    const { contourPoints, center } = entry.guide;
    return (
      sum +
      Math.abs((contourPoints.sideA.x - center.x) * normal.x + (contourPoints.sideA.y - center.y) * normal.y) +
      Math.abs((contourPoints.sideB.x - center.x) * normal.x + (contourPoints.sideB.y - center.y) * normal.y)
    );
  }, 0);
  const hiddenScore = faceEntries.reduce((sum, entry) => {
    const { contourPoints, center } = entry.guide;
    return (
      sum +
      Math.abs((contourPoints.hiddenA.x - center.x) * normal.x + (contourPoints.hiddenA.y - center.y) * normal.y) +
      Math.abs((contourPoints.hiddenB.x - center.x) * normal.x + (contourPoints.hiddenB.y - center.y) * normal.y)
    );
  }, 0);
  const visibleKey = hiddenScore > sideScore ? "hidden" : "side";
  const hiddenKey = visibleKey === "side" ? "hidden" : "side";

  return {
    visibleSegments: [
      [
        faceEntries[0].guide.contourPoints[`${visibleKey}A`],
        faceEntries[1].guide.contourPoints[`${visibleKey}A`],
      ],
      [
        faceEntries[0].guide.contourPoints[`${visibleKey}B`],
        faceEntries[1].guide.contourPoints[`${visibleKey}B`],
      ],
    ],
    hiddenSegments: [
      [
        faceEntries[0].guide.contourPoints[`${hiddenKey}A`],
        faceEntries[1].guide.contourPoints[`${hiddenKey}A`],
      ],
      [
        faceEntries[0].guide.contourPoints[`${hiddenKey}B`],
        faceEntries[1].guide.contourPoints[`${hiddenKey}B`],
      ],
    ],
  };
}

function drawCylinderGuideOverlay(vertices, faceVisibility, options) {
  for (const pair of cylinderGuidePairs) {
    const faceEntries = pair.faces.map((faceName) => {
      const quad = getFaceQuad(vertices, faceName);
      const guide = quad ? getProjectedEllipseGuide(quad) : null;

      return guide
        ? {
            faceName,
            guide,
            visible: Boolean(faceVisibility.get(faceName)),
          }
        : null;
    });

    if (faceEntries.some((entry) => !entry)) {
      continue;
    }

    const connectorSets = getCylinderGuideConnectorSets(faceEntries);

    for (const entry of faceEntries) {
      if (!entry.visible && !options.showHidden) {
        continue;
      }

      const strokeStyle = entry.visible ? options.visibleStroke : options.hiddenStroke;
      const dashPattern = entry.visible ? [] : options.hiddenDash;
      const lineWidth = entry.visible ? options.ellipseWidth : options.hiddenWidth;

      drawPolyline(entry.guide.points, lineWidth, strokeStyle, dashPattern);
      drawSingleLine(entry.guide.majorAxis[0], entry.guide.majorAxis[1], options.axisWidth, strokeStyle, dashPattern);
      drawSingleLine(entry.guide.minorAxis[0], entry.guide.minorAxis[1], options.axisWidth, strokeStyle, dashPattern);
      drawGuidePoint(entry.guide.center, options.centerRadius, strokeStyle);
    }

    drawLineSegments(connectorSets.visibleSegments, options.contourWidth, options.contourStroke);

    if (options.showHidden) {
      drawLineSegments(connectorSets.hiddenSegments, options.hiddenWidth, options.hiddenStroke, options.hiddenDash);
    }

    if (options.showHidden || faceEntries.some((entry) => entry.visible)) {
      drawSingleLine(
        faceEntries[0].guide.center,
        faceEntries[1].guide.center,
        options.connectorWidth,
        options.connectorStroke,
        options.connectorDash,
      );
    }
  }
}

function drawCustomPhoto() {
  const layout = getCustomPhotoLayout();

  if (!state.custom.photo?.image || !layout) {
    return;
  }

  const { image } = state.custom.photo;

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.drawImage(image, layout.x, layout.y, layout.width, layout.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(layout.x, layout.y, layout.width, layout.height);
  ctx.restore();
}

function drawCustomGuides() {
  ensureCustomSetup();
  const guides = state.custom.guides;
  const palette = getCustomPalette();
  const guidePoints = [{ key: "vp1", point: guides.vp1 }];

  if (state.custom.perspectiveMode !== "one") {
    guidePoints.push({ key: "vp2", point: guides.vp2 });
  }

  if (state.custom.perspectiveMode === "three") {
    guidePoints.push({ key: "vp3", point: guides.vp3 });
  }

  drawSingleLine(
    { x: 0, y: guides.horizonY },
    { x: state.view.width, y: guides.horizonY },
    1.6,
    palette.guideStrong,
    [12, 10],
  );

  for (const shape of state.custom.shapes) {
    const geometry = getCustomShapeGeometry(shape);
    const handles = geometry.handles;

    if (state.custom.perspectiveMode === "one") {
      drawSingleLine(handles.origin, guides.vp1, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.x, guides.vp1, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.y, guides.vp1, 1.1, palette.guide, [5, 9]);
    } else {
      drawSingleLine(handles.origin, guides.vp1, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.origin, guides.vp2, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.y, guides.vp1, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.y, guides.vp2, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.x, guides.vp2, 1.1, palette.guide, [5, 9]);
      drawSingleLine(handles.z, guides.vp1, 1.1, palette.guide, [5, 9]);

      if (state.custom.perspectiveMode === "three") {
        drawSingleLine(handles.origin, guides.vp3, 1.1, palette.guide, [5, 9]);
        drawSingleLine(handles.x, guides.vp3, 1.1, palette.guide, [5, 9]);
        drawSingleLine(handles.z, guides.vp3, 1.1, palette.guide, [5, 9]);
      }
    }
  }

  for (const guide of guidePoints) {
    if (!pointInBounds(guide.point, state.view.width, state.view.height, 18)) {
      continue;
    }

    ctx.fillStyle = palette.handle;
    ctx.beginPath();
    ctx.arc(guide.point.x, guide.point.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCustomBox(shape, geometry) {
  const palette = getCustomPalette();
  const faceVisibility = getCustomVisibleFaces();
  const hiddenEdges = [];
  const visibleEdges = [];
  const visibleWidth = clamp(Math.min(state.view.width, state.view.height) * 0.0044, 2, 3.6);
  const hiddenWidth = Math.max(1.3, visibleWidth * 0.76);

  for (const edge of edges) {
    const [aIndex, bIndex] = edge.indices;
    const segment = [geometry.vertices[aIndex], geometry.vertices[bIndex]];
    const isVisible = edge.faces.some((name) => faceVisibility.get(name));

    if (isVisible) {
      visibleEdges.push(segment);
    } else {
      hiddenEdges.push(segment);
    }
  }

  if (state.custom.showHidden) {
    drawLineSegments(hiddenEdges, hiddenWidth, palette.hidden, [8, 8]);
  }

  drawLineSegments(visibleEdges, visibleWidth, palette.visible);

  if (state.custom.showCylinderGuides) {
    drawCylinderGuideOverlay(geometry.vertices, faceVisibility, {
      showHidden: state.custom.showHidden,
      visibleStroke: "rgba(96, 46, 156, 0.92)",
      hiddenStroke: "rgba(96, 46, 156, 0.38)",
      contourStroke: "rgba(76, 28, 142, 0.96)",
      connectorStroke: "rgba(96, 46, 156, 0.68)",
      ellipseWidth: Math.max(1.8, visibleWidth * 0.84),
      hiddenWidth: Math.max(1.1, hiddenWidth * 0.9),
      axisWidth: Math.max(1.35, visibleWidth * 0.62),
      contourWidth: Math.max(1.7, visibleWidth * 0.82),
      connectorWidth: Math.max(1.05, visibleWidth * 0.48),
      centerRadius: Math.max(2.8, visibleWidth * 0.78),
      hiddenDash: [7, 7],
      connectorDash: [6, 7],
    });
  }

  if (shape.id === state.custom.selectedShapeId) {
    const bounds = getCustomShapeBounds(geometry);
    ctx.save();
    ctx.strokeStyle = palette.selection;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.strokeRect(bounds.minX - 8, bounds.minY - 8, bounds.maxX - bounds.minX + 16, bounds.maxY - bounds.minY + 16);
    ctx.restore();
  }
}

function drawCustomCylinder(shape, geometry) {
  const palette = getCustomPalette();
  const visibleWidth = clamp(Math.min(state.view.width, state.view.height) * 0.0044, 2, 3.6);
  const hiddenWidth = Math.max(1.3, visibleWidth * 0.76);
  const [origin, xHandle, yHandle, , zHandle, xzHandle, yzHandle, xyzHandle] = geometry.vertices;

  if (state.custom.perspectiveMode === "one") {
    const frontCenter = {
      x: (origin.x + xHandle.x) / 2,
      y: (origin.y + yHandle.y) / 2,
    };
    const backCenter = {
      x: (zHandle.x + xzHandle.x) / 2,
      y: (zHandle.y + yzHandle.y) / 2,
    };
    const frontRx = Math.abs(xHandle.x - origin.x) / 2;
    const frontRy = Math.abs(yHandle.y - origin.y) / 2;
    const backRx = Math.abs(xzHandle.x - zHandle.x) / 2;
    const backRy = Math.abs(yzHandle.y - zHandle.y) / 2;
    const visibleConnectors = [
      [
        { x: frontCenter.x - frontRx, y: frontCenter.y },
        { x: backCenter.x - backRx, y: backCenter.y },
      ],
      [
        { x: frontCenter.x + frontRx, y: frontCenter.y },
        { x: backCenter.x + backRx, y: backCenter.y },
      ],
    ];
    const hiddenConnectors = [
      [
        { x: frontCenter.x, y: frontCenter.y - frontRy },
        { x: backCenter.x, y: backCenter.y - backRy },
      ],
      [
        { x: frontCenter.x, y: frontCenter.y + frontRy },
        { x: backCenter.x, y: backCenter.y + backRy },
      ],
    ];

    ctx.save();

    if (state.custom.showHidden) {
      drawLineSegments(hiddenConnectors, hiddenWidth, palette.hidden, [8, 8]);
      ctx.strokeStyle = palette.hidden;
      ctx.lineWidth = hiddenWidth;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(backCenter.x, backCenter.y, backRx, backRy, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = palette.visible;
    ctx.lineWidth = visibleWidth;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(frontCenter.x, frontCenter.y, frontRx, frontRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawLineSegments(visibleConnectors, visibleWidth, palette.visible);

    ctx.restore();
  } else {
    const baseQuad = [origin, xHandle, xzHandle, zHandle];
    const farQuad = [yHandle, geometry.vertices[3], xyzHandle, yzHandle];
    const baseEllipse = getProjectedEllipsePoints(baseQuad);
    const farEllipse = getProjectedEllipsePoints(farQuad);
    const baseProjector = buildQuadProjector(baseQuad);
    const farProjector = buildQuadProjector(farQuad);
    const visibleSides = baseProjector && farProjector
      ? [
          [baseProjector(0, 0.5), farProjector(0, 0.5)],
          [baseProjector(1, 0.5), farProjector(1, 0.5)],
        ]
      : [];
    const hiddenConnectors = baseProjector && farProjector
      ? [
          [baseProjector(0.5, 0), farProjector(0.5, 0)],
          [baseProjector(0.5, 1), farProjector(0.5, 1)],
        ]
      : [];

    if (state.custom.showHidden) {
      drawPolyline(farEllipse, hiddenWidth, palette.hidden, [8, 8]);
      drawLineSegments(hiddenConnectors, hiddenWidth, palette.hidden, [8, 8]);
    }

    drawPolyline(baseEllipse, visibleWidth, palette.visible);
    drawLineSegments(visibleSides, visibleWidth, palette.visible);
  }

  if (shape.id === state.custom.selectedShapeId) {
    const bounds = getCustomShapeBounds(geometry);
    ctx.save();
    ctx.strokeStyle = palette.selection;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.strokeRect(bounds.minX - 8, bounds.minY - 8, bounds.maxX - bounds.minX + 16, bounds.maxY - bounds.minY + 16);
    ctx.restore();
  }
}

function drawCustomShapeHandles(geometry) {
  const palette = getCustomPalette();

  for (const point of Object.values(geometry.handles)) {
    ctx.fillStyle = "#fff8f0";
    ctx.strokeStyle = palette.handle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function formatCustomStatus() {
  const fragments = [formatCustomMode(state.custom.perspectiveMode)];

  if (state.custom.autoCorrecting) {
    fragments.unshift("analyzing");
  }

  if (state.custom.shapes.length > 0) {
    fragments.push(`${state.custom.shapes.length} shape${state.custom.shapes.length === 1 ? "" : "s"}`);
  } else {
    fragments.push("no shapes yet");
  }

  if (state.custom.photo?.image) {
    fragments.push("photo loaded");
  }

  if (state.custom.analysisReady) {
    fragments.push("analysis ready");
  }

  if (state.custom.showHidden) {
    fragments.push("draw-through");
  }

  if (state.custom.showCylinderGuides) {
    fragments.push("cylinder guides");
  }

  return fragments.join(" • ");
}

function renderCustom() {
  if (state.mode !== "custom") {
    return;
  }

  ensureCanvasSize();
  ensureCustomSetup();
  drawPaper(state.view);
  drawCustomPhoto();
  drawCustomGuides();

  if (state.custom.shapes.length === 0) {
    ctx.save();
    ctx.fillStyle = getCustomPalette().guideStrong;
    ctx.font = '700 18px "Avenir Next", "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(
      state.custom.analysisReady
        ? "Choose Add Cube or Add Box, then tap the drawing you want corrected."
        : "Add a cube, box, or cylinder and drag the guides into place.",
      state.view.width / 2,
      state.view.height / 2,
    );
    ctx.restore();
  }

  for (const shape of state.custom.shapes) {
    const geometry = getCustomShapeGeometry(shape);

    if (shape.kind === "cylinder") {
      drawCustomCylinder(shape, geometry);
    } else {
      drawCustomBox(shape, geometry);
    }

    if (shape.id === state.custom.selectedShapeId) {
      drawCustomShapeHandles(geometry);
    }
  }
}

function drawPaper(view) {
  const background = ctx.createLinearGradient(0, 0, view.width, view.height);
  background.addColorStop(0, "#fff9ee");
  background.addColorStop(0.55, "#f9edd3");
  background.addColorStop(1, "#f1dfbb");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, view.width, view.height);

  const glow = ctx.createRadialGradient(
    view.width * 0.24,
    view.height * 0.18,
    20,
    view.width * 0.24,
    view.height * 0.18,
    view.width * 0.6,
  );
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
  const { origin, focalLength, guideBounds } = getProjectionSettings();
  const guideDimensions =
    exercise.kind === "cylinder"
      ? { x: exercise.dimensions.x, y: exercise.dimensions.y, z: exercise.dimensions.x }
      : exercise.dimensions;
  const projectedVertices = createBoxVertices(guideDimensions).map((vertex) =>
    projectPoint(add(rotatePoint(vertex, exercise.rotation), exercise.center), focalLength, origin),
  );
  const axisDirections = [
    normalize(rotatePoint({ x: 1, y: 0, z: 0 }, exercise.rotation)),
    normalize(rotatePoint({ x: 0, y: 1, z: 0 }, exercise.rotation)),
    normalize(rotatePoint({ x: 0, y: 0, z: 1 }, exercise.rotation)),
  ];
  const vanishingPoints = axisDirections
    .map((direction) => computeVanishingPoint(direction, focalLength, origin))
    .filter(Boolean);

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  drawSingleLine(
    { x: guideBounds.minX, y: origin.y },
    { x: guideBounds.maxX, y: origin.y },
    1.5,
    "rgba(160, 79, 29, 0.28)",
    [14, 10],
  );

  for (const [startIndex, endIndex] of guideEdgePairs) {
    const start = projectedVertices[startIndex];
    const end = projectedVertices[endIndex];
    const clipped = clipLineToBounds(start, { x: end.x - start.x, y: end.y - start.y }, guideBounds);

    if (clipped) {
      drawSingleLine(clipped[0], clipped[1], 1.1, "rgba(160, 79, 29, 0.18)", [6, 10]);
    }
  }

  for (const vanishingPoint of vanishingPoints) {
    if (!isPointInside(vanishingPoint, guideBounds)) {
      continue;
    }

    ctx.fillStyle = "rgba(160, 79, 29, 0.34)";
    ctx.beginPath();
    ctx.arc(vanishingPoint.x, vanishingPoint.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBox(exercise, projection) {
  const { focalLength, origin } = projection;
  const baseVertices = createBoxVertices(exercise.dimensions);
  const worldVertices = baseVertices.map((vertex) => add(rotatePoint(vertex, exercise.rotation), exercise.center));
  const projectedVertices = worldVertices.map((vertex) => projectPoint(vertex, focalLength, origin));
  const faceVisibility = classifyFaces(worldVertices);
  const hiddenEdges = [];
  const visibleEdges = [];

  for (const edge of edges) {
    const [aIndex, bIndex] = edge.indices;
    const isVisible = edge.faces.some((name) => faceVisibility.get(name));
    const segment = [projectedVertices[aIndex], projectedVertices[bIndex]];

    if (isVisible) {
      visibleEdges.push(segment);
    } else {
      hiddenEdges.push(segment);
    }
  }

  const visibleWidth = clamp(Math.min(state.view.width, state.view.height) * 0.005, 2.4, 4.3);
  const hiddenWidth = Math.max(1.5, visibleWidth * 0.76);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (state.perspective.showHidden) {
    drawLineSegments(hiddenEdges, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
  }

  drawLineSegments(visibleEdges, visibleWidth, "#2b1d11");

  if (state.perspective.showCylinderGuides) {
    drawCylinderGuideOverlay(projectedVertices, faceVisibility, {
      showHidden: state.perspective.showHidden,
      visibleStroke: "rgba(92, 34, 150, 0.94)",
      hiddenStroke: "rgba(92, 34, 150, 0.36)",
      contourStroke: "rgba(68, 18, 132, 0.98)",
      connectorStroke: "rgba(92, 34, 150, 0.7)",
      ellipseWidth: Math.max(1.9, visibleWidth * 0.72),
      hiddenWidth: Math.max(1.05, hiddenWidth * 0.86),
      axisWidth: Math.max(1.35, visibleWidth * 0.58),
      contourWidth: Math.max(1.8, visibleWidth * 0.76),
      connectorWidth: Math.max(1.05, visibleWidth * 0.44),
      centerRadius: Math.max(2.9, visibleWidth * 0.78),
      hiddenDash: [7, 7],
      connectorDash: [6, 7],
    });
  }
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

function drawCylinder(exercise, projection) {
  const { focalLength, origin } = projection;
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
  const visibleWidth = clamp(Math.min(state.view.width, state.view.height) * 0.005, 2.4, 4.3);
  const hiddenWidth = Math.max(1.5, visibleWidth * 0.76);
  const sideSegments = [-1, 1].map((direction) => {
    const topPoint = add(topCenter, scale(sideDirection, radius * direction));
    const bottomPoint = add(bottomCenter, scale(sideDirection, radius * direction));

    return [projectPoint(topPoint, focalLength, origin), projectPoint(bottomPoint, focalLength, origin)];
  });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (state.perspective.showHidden) {
    drawLineSegments(topRing.hiddenSegments, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
    drawLineSegments(bottomRing.hiddenSegments, hiddenWidth, "rgba(97, 74, 47, 0.45)", [9, 7]);
  }

  drawLineSegments(topRing.visibleSegments, visibleWidth, "#2b1d11");
  drawLineSegments(bottomRing.visibleSegments, visibleWidth, "#2b1d11");
  drawLineSegments(sideSegments, visibleWidth, "#2b1d11");
}

function drawExercise(exercise, alpha = 1) {
  const projection = getProjectionSettings();

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  if (exercise.kind === "cylinder") {
    drawCylinder(exercise, projection);
  } else {
    drawBox(exercise, projection);
  }

  ctx.restore();
}

function syncModeUi() {
  for (const button of ui.modeButtons) {
    const active = button.dataset.mode === state.mode;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const panel of ui.panels) {
    panel.hidden = panel.dataset.panel !== state.mode;
  }

  for (const stage of ui.stages) {
    stage.hidden =
      stage.dataset.stage === "perspective"
        ? state.mode === "gesture"
        : stage.dataset.stage !== state.mode;
  }
}

function syncPerspectiveControls() {
  for (const button of ui.shapeButtons) {
    const active = button.dataset.shape === state.perspective.selectedShape;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.perspectiveButtons) {
    const active = button.dataset.perspectiveMode === state.perspective.selectedMode;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.toggleButtons) {
    const toggle = button.dataset.toggle;
    const active =
      toggle === "hidden"
        ? state.perspective.showHidden
        : toggle === "guides"
          ? state.perspective.showGuides
          : toggle === "cylinder-guides"
            ? state.perspective.showCylinderGuides
          : toggle === "zoom"
            ? state.perspective.zoomedOut
            : state.perspective.autoShuffle;

    button.setAttribute("aria-pressed", String(active));
  }

  const hiddenButton = document.querySelector('[data-toggle="hidden"]');
  const guidesButton = document.querySelector('[data-toggle="guides"]');
  const cylinderGuidesButton = document.querySelector('[data-toggle="cylinder-guides"]');
  const zoomButton = document.querySelector('[data-toggle="zoom"]');
  const autoButton = document.querySelector('[data-toggle="auto"]');

  hiddenButton.textContent = state.perspective.showHidden ? "Hidden Lines On" : "Hidden Lines Off";
  guidesButton.textContent = state.perspective.showGuides ? "Guides On" : "Guides Off";
  if (cylinderGuidesButton) {
    cylinderGuidesButton.textContent = state.perspective.showCylinderGuides
      ? "Cylinder Guides On"
      : "Cylinder Guides";
  }
  zoomButton.textContent = state.perspective.zoomedOut ? "Zoom In" : "Zoom Out";
  autoButton.textContent = state.perspective.autoShuffle ? "Auto Shuffle On" : "Auto Shuffle";
}

function syncPerspectiveInfo(exercise) {
  ui.kind.textContent = formatKind(exercise.kind);
  ui.size.textContent =
    exercise.kind === "cylinder"
      ? `${Math.round(exercise.dimensions.x)} dia × ${Math.round(exercise.dimensions.y)} h`
      : `${Math.round(exercise.dimensions.x)} × ${Math.round(exercise.dimensions.y)} × ${Math.round(exercise.dimensions.z)}`;
  ui.view.textContent = describePerspectiveView();
  ui.stageLabel.textContent = "Perspective Drill";
  ui.stageTitle.textContent = `${formatPerspectiveMode(state.perspective.selectedMode)} ${formatKind(exercise.kind).toLowerCase()} study`;
  ui.status.textContent = formatStatus();
}

function syncGestureControls() {
  for (const button of ui.durationButtons) {
    const active = Number(button.dataset.duration) === state.gesture.selectedDuration;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.countButtons) {
    const active = Number(button.dataset.refCount) === state.gesture.selectedCount;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.gestureSourceButtons) {
    const active = button.dataset.gestureSource === state.gesture.selectedSource;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }
}

function syncCustomControls() {
  for (const button of ui.customPerspectiveButtons) {
    const active = button.dataset.customPerspective === state.custom.perspectiveMode;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.customAddButtons) {
    const active = state.custom.placementKind === button.dataset.customAdd;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("button-primary", active);
  }

  for (const button of ui.customToggleButtons) {
    const active =
      button.dataset.customToggle === "hidden"
        ? state.custom.showHidden
        : button.dataset.customToggle === "cylinder-guides"
          ? state.custom.showCylinderGuides
          : false;
    button.setAttribute("aria-pressed", String(active));
  }

  const hiddenButton = document.querySelector('[data-custom-toggle="hidden"]');
  const cylinderGuidesButton = document.querySelector('[data-custom-toggle="cylinder-guides"]');

  if (hiddenButton) {
    hiddenButton.textContent = state.custom.showHidden ? "Hidden Lines On" : "Hidden Lines Off";
  }

  if (cylinderGuidesButton) {
    cylinderGuidesButton.textContent = state.custom.showCylinderGuides
      ? "Cylinder Guides On"
      : "Cylinder Guides";
  }
}

function syncCustomInfo() {
  const selected = getCustomSelectedShape();
  ui.customGuide.textContent = formatCustomMode(state.custom.perspectiveMode);
  ui.customCount.textContent = String(state.custom.shapes.length);
  ui.customSelection.textContent = state.custom.placementKind
    ? `Tap ${formatKind(state.custom.placementKind).toLowerCase()}`
    : selected
      ? formatKind(selected.kind)
      : "None";
  ui.stageLabel.textContent = "Make Your Own";
  ui.stageTitle.textContent = state.custom.photo?.image
    ? state.custom.analysisReady
      ? "Tap a form to place a correction"
      : "Photo overlay construction"
    : "Manual vanishing-point setup";
  ui.status.textContent = formatStatus();
}

function renderGestureGallery() {
  ui.gestureGallery.innerHTML = "";

  for (const reference of state.gesture.usedRefs) {
    const card = document.createElement("article");
    card.className = "reference-card";

    const link = document.createElement("a");
    link.href = reference.sourceUrl;
    link.target = "_blank";
    link.rel = "noreferrer";

    const image = document.createElement("img");
    image.src = reference.fallbackImageUrl || reference.imageUrl;
    image.alt = reference.title;
    image.loading = "lazy";

    const indexLabel = document.createElement("span");
    indexLabel.className = "reference-index";
    indexLabel.textContent = `Reference ${reference.index}`;

    const title = document.createElement("span");
    title.className = "reference-title";
    title.textContent = reference.title;

    link.append(image, indexLabel, title);
    card.append(link);
    ui.gestureGallery.append(card);
  }
}

function syncGestureInfo() {
  const gestureState = state.gesture;
  const activeReference = gestureState.currentRef;
  const timerText = formatDuration(
    gestureState.active || gestureState.loading ? gestureState.remainingMs : gestureState.selectedDuration,
  );
  const progressText = formatGestureProgress();

  ui.gestureTime.textContent = timerText;
  ui.gestureProgress.textContent = progressText;
  ui.gestureSourceName.textContent = activeReference
    ? activeReference.sourceName
    : formatGestureSourceChoice(gestureState.selectedSource);
  ui.gestureTimerPill.textContent = timerText;
  ui.gestureCounterPill.textContent = progressText;
  ui.stageLabel.textContent = "Gesture Time";
  ui.stageTitle.textContent = gestureState.ended ? "Session references" : "Timed pose reference";
  ui.status.textContent = formatStatus();

  if (gestureState.loading) {
    ui.gesturePlaceholder.hidden = false;
    ui.gesturePlaceholder.textContent = "Loading the next pose reference...";
    ui.gestureImage.dataset.fallbackSrc = "";
    ui.gestureImage.hidden = true;
  } else if (gestureState.error) {
    ui.gesturePlaceholder.hidden = false;
    ui.gesturePlaceholder.textContent = gestureState.error;
    ui.gestureImage.dataset.fallbackSrc = "";
    ui.gestureImage.hidden = true;
  } else if (activeReference) {
    ui.gestureImage.src = activeReference.imageUrl;
    ui.gestureImage.alt = activeReference.title;
    ui.gestureImage.dataset.fallbackSrc = activeReference.fallbackImageUrl || "";
    ui.gestureImage.hidden = false;
    ui.gesturePlaceholder.hidden = true;
  } else {
    ui.gesturePlaceholder.hidden = false;
    ui.gesturePlaceholder.textContent =
      "Select a time limit, choose how many references you want, and start a session.";
    ui.gestureImage.dataset.fallbackSrc = "";
    ui.gestureImage.hidden = true;
  }

  if (activeReference) {
    ui.gestureSourceTitle.textContent = activeReference.title;
    ui.gestureSourceLink.hidden = false;
    ui.gestureSourceLink.href = activeReference.sourceUrl;
  } else {
    ui.gestureSourceTitle.textContent = "No pose loaded yet";
    ui.gestureSourceLink.hidden = true;
  }

  ui.gestureSummary.hidden = !gestureState.ended || gestureState.usedRefs.length === 0;
  ui.gestureNote.textContent = buildGestureNoteText();

  if (!ui.gestureSummary.hidden) {
    renderGestureGallery();
  }
}

function syncUi() {
  syncModeUi();
  syncPerspectiveControls();
  syncGestureControls();
  syncCustomControls();

  if (state.mode === "gesture") {
    syncGestureInfo();
  } else if (state.mode === "custom") {
    syncCustomInfo();
  }
}

function renderPerspective(now = performance.now()) {
  if (state.mode !== "perspective") {
    return;
  }

  ensureCanvasSize();
  drawPaper(state.view);

  const frame = getAnimationFrame(now);

  if (!frame) {
    syncUi();
    return;
  }

  if (frame.mode === "blend") {
    syncPerspectiveInfo(frame.infoExercise);
    syncUi();

    if (state.perspective.showGuides) {
      drawPerspectiveGuides(frame.fromExercise, frame.fromAlpha);
      drawPerspectiveGuides(frame.toExercise, frame.toAlpha);
    }

    drawExercise(frame.fromExercise, frame.fromAlpha);
    drawExercise(frame.toExercise, frame.toAlpha);
    return;
  }

  syncPerspectiveInfo(frame.exercise);
  syncUi();

  if (state.perspective.showGuides) {
    drawPerspectiveGuides(frame.exercise);
  }

  drawExercise(frame.exercise);
}

function renderCanvasStage(now = performance.now()) {
  if (state.mode === "gesture") {
    return;
  }

  if (state.mode === "custom") {
    syncCustomInfo();
    syncUi();
    renderCustom();
    return;
  }

  renderPerspective(now);
}

function requestRender() {
  if (state.mode === "gesture" || state.perspective.rafId) {
    return;
  }

  state.perspective.rafId = requestAnimationFrame((now) => {
    state.perspective.rafId = 0;
    renderCanvasStage(now);
  });
}

function transitionPerspectiveExercise(next, duration = 560) {
  const perspectiveState = state.perspective;
  const from = getAnimationSnapshot() || perspectiveState.current;
  perspectiveState.spin = null;

  if (!from) {
    perspectiveState.current = next;
    requestRender();
    return;
  }

  perspectiveState.animation = {
    from,
    to: next,
    start: performance.now(),
    duration,
  };

  requestRender();
}

function setPerspectiveExercise(shapeMode = state.perspective.selectedShape) {
  const next = createExercise(shapeMode);
  transitionPerspectiveExercise(next, 560);
}

function stepPerspectiveRotation(direction, axis = "horizontal") {
  const current = getAnimationSnapshot() || state.perspective.current;

  if (!current) {
    setPerspectiveExercise(state.perspective.selectedShape);
    return;
  }

  const next = cloneExercise(current);
  const horizontalStep = state.perspective.selectedMode === "one" ? 0.18 : 0.22;
  const verticalStep = state.perspective.selectedMode === "three" ? 0.18 : 0.16;

  if (axis === "vertical") {
    next.rotation.x = wrapAngle(next.rotation.x + direction * verticalStep);
  } else if (state.perspective.selectedMode === "one") {
    next.rotation.z = wrapAngle(next.rotation.z + direction * horizontalStep);
  } else {
    next.rotation.y = wrapAngle(next.rotation.y + direction * horizontalStep);
  }

  transitionPerspectiveExercise(next, 320);
}

function stepPerspectiveLift(direction) {
  const current = getAnimationSnapshot() || state.perspective.current;

  if (!current) {
    setPerspectiveExercise(state.perspective.selectedShape);
    return;
  }

  const next = cloneExercise(current);
  const step = state.perspective.selectedMode === "three" ? 64 : 56;
  next.center.y = clamp(next.center.y + direction * step, -220, 220);
  transitionPerspectiveExercise(next, 260);
}

function centerPerspectiveOnHorizon() {
  const current = getAnimationSnapshot() || state.perspective.current;

  if (!current) {
    setPerspectiveExercise(state.perspective.selectedShape);
    return;
  }

  const next = cloneExercise(current);
  next.center.y = 0;
  transitionPerspectiveExercise(next, 260);
}

function handlePerspectivePointerDown(event) {
  if (state.mode !== "perspective") {
    return;
  }

  const snapshot = getAnimationSnapshot() || state.perspective.current;

  if (!snapshot) {
    return;
  }

  const startPoint = getPointFromEvent(event);
  state.perspective.current = cloneExercise(snapshot);
  state.perspective.animation = null;
  state.perspective.spin = null;
  state.perspective.interaction = {
    pointerId: event.pointerId,
    startPoint,
    startRotation: { ...state.perspective.current.rotation },
    lastPoint: startPoint,
    lastTime: performance.now(),
    angularVelocity: { x: 0, y: 0, z: 0 },
  };

  canvas.setPointerCapture(event.pointerId);
  requestRender();
}

function handlePerspectivePointerMove(event) {
  const interaction = state.perspective.interaction;

  if (!interaction || interaction.pointerId !== event.pointerId || state.mode !== "perspective") {
    return;
  }

  const point = getPointFromEvent(event);
  const dx = point.x - interaction.startPoint.x;
  const dy = point.y - interaction.startPoint.y;
  const now = performance.now();
  const current = state.perspective.current;

  if (!current) {
    return;
  }

  if (state.perspective.selectedMode === "one") {
    current.rotation = {
      x: wrapAngle(interaction.startRotation.x - dy * 0.008),
      y: 0,
      z: wrapAngle(interaction.startRotation.z + dx * 0.008),
    };
  } else if (state.perspective.selectedMode === "two") {
    current.rotation = {
      x: wrapAngle(interaction.startRotation.x - dy * 0.008),
      y: wrapAngle(interaction.startRotation.y + dx * 0.008),
      z: 0,
    };
  } else {
    current.rotation = {
      x: wrapAngle(interaction.startRotation.x - dy * 0.008),
      y: wrapAngle(interaction.startRotation.y + dx * 0.008),
      z: 0,
    };
  }

  const elapsedMs = Math.max(1, now - interaction.lastTime);
  const pointDeltaX = point.x - interaction.lastPoint.x;
  const pointDeltaY = point.y - interaction.lastPoint.y;

  if (state.perspective.selectedMode === "one") {
    interaction.angularVelocity = {
      x: (-pointDeltaY * 0.008 * 1000) / elapsedMs,
      y: 0,
      z: (pointDeltaX * 0.008 * 1000) / elapsedMs,
    };
  } else {
    interaction.angularVelocity = {
      x: (-pointDeltaY * 0.008 * 1000) / elapsedMs,
      y: (pointDeltaX * 0.008 * 1000) / elapsedMs,
      z: 0,
    };
  }

  interaction.lastPoint = point;
  interaction.lastTime = now;

  requestRender();
}

function handlePerspectivePointerUp(event) {
  if (!state.perspective.interaction || state.perspective.interaction.pointerId !== event.pointerId) {
    return;
  }

  const speed = Math.hypot(
    state.perspective.interaction.angularVelocity.x,
    state.perspective.interaction.angularVelocity.y,
    state.perspective.interaction.angularVelocity.z,
  );

  state.perspective.spin =
    event.type === "pointerup" && speed > 0.35
      ? {
          velocity: { ...state.perspective.interaction.angularVelocity },
          lastTime: performance.now(),
        }
      : null;
  state.perspective.interaction = null;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  requestRender();
}

function handleCustomWheel(event) {
  if (state.mode !== "custom" || state.custom.placementKind) {
    return;
  }

  const selectedShape = getCustomSelectedShape();

  if (!selectedShape) {
    return;
  }

  event.preventDefault();
  scaleCustomShape(selectedShape, event.deltaY < 0 ? 1.06 : 0.94);
  requestRender();
}

function togglePerspectiveAutoShuffle() {
  const perspectiveState = state.perspective;
  perspectiveState.autoShuffle = !perspectiveState.autoShuffle;

  if (perspectiveState.autoShuffle) {
    perspectiveState.autoTimer = window.setInterval(() => {
      setPerspectiveExercise(perspectiveState.selectedShape);
    }, 2800);
  } else if (perspectiveState.autoTimer) {
    window.clearInterval(perspectiveState.autoTimer);
    perspectiveState.autoTimer = 0;
  }

  requestRender();
}

function togglePerspectiveHidden() {
  state.perspective.showHidden = !state.perspective.showHidden;
  requestRender();
}

function togglePerspectiveGuides() {
  state.perspective.showGuides = !state.perspective.showGuides;
  requestRender();
}

function togglePerspectiveCylinderGuides() {
  state.perspective.showCylinderGuides = !state.perspective.showCylinderGuides;
  requestRender();
}

function togglePerspectiveZoom() {
  state.perspective.zoomedOut = !state.perspective.zoomedOut;

  if (state.perspective.zoomedOut) {
    state.perspective.showGuides = true;
  }

  requestRender();
}

function switchMode(mode) {
  state.mode = mode;
  syncUi();

  if (mode === "gesture") {
    syncGestureInfo();
  } else {
    if (mode === "custom") {
      ensureCustomSetup();
    }

    requestRender();
  }
}

function clearGestureTimer() {
  if (state.gesture.timerId) {
    window.clearInterval(state.gesture.timerId);
    state.gesture.timerId = 0;
  }
}

function updateGestureTimer() {
  if (!state.gesture.active) {
    return;
  }

  state.gesture.remainingMs = Math.max(0, state.gesture.endsAt - Date.now());
  syncUi();

  if (state.gesture.remainingMs === 0) {
    clearGestureTimer();
    handleGestureTimerDone();
  }
}

function startGestureTimer() {
  clearGestureTimer();
  state.gesture.remainingMs = state.gesture.selectedDuration;
  state.gesture.endsAt = Date.now() + state.gesture.selectedDuration;
  state.gesture.timerId = window.setInterval(updateGestureTimer, 200);
  syncUi();
}

function endGestureSession() {
  clearGestureTimer();
  state.gesture.requestToken += 1;
  state.gesture.active = false;
  state.gesture.loading = false;
  state.gesture.ended = true;
  state.gesture.remainingMs = state.gesture.selectedDuration;
  syncUi();
}

async function handleGestureTimerDone() {
  if (
    state.gesture.selectedCount > 0 &&
    state.gesture.usedRefs.length >= state.gesture.selectedCount
  ) {
    endGestureSession();
    return;
  }

  await loadNextGestureReference();
}

function buildCommonsUrl(query, offset = 0) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "18");
  url.searchParams.set("gsroffset", String(offset));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size");
  url.searchParams.set("iiurlwidth", "1400");
  url.searchParams.set("iiurlheight", "1400");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  return url.toString();
}

function buildOpenverseUrl(query, page = 1) {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "20");
  url.searchParams.set("page", String(page));
  return url.toString();
}

function buildGestureCacheKey(source, query, page) {
  return `${source}:${page}:${query}`;
}

function buildMediaInfoUrl(fileTitles) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("sites", "commonswiki");
  url.searchParams.set("titles", fileTitles.join("|"));
  url.searchParams.set("props", "info|claims");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  return url.toString();
}

function buildEntityLabelsUrl(ids) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", ids.join("|"));
  url.searchParams.set("props", "labels");
  url.searchParams.set("languages", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  return url.toString();
}

function isValidGestureReference(reference) {
  if (!reference.imageUrl || !reference.sourceUrl) {
    return false;
  }

  if (!hasSupportedGestureImageUrl(reference.imageUrl)) {
    return false;
  }

  if (reference.fileTitle && /\.(svg|gif|tif|tiff|pdf|djvu)$/i.test(reference.fileTitle)) {
    return false;
  }

  if (reference.mature) {
    return false;
  }

  const title = (reference.title || "").toLowerCase();
  return !gestureBlockedTerms.some((term) => title.includes(term));
}

function getEntityIdsFromStatements(entity, propertyIds) {
  const ids = [];

  for (const propertyId of propertyIds) {
    for (const statement of entity?.statements?.[propertyId] || []) {
      const value = statement?.mainsnak?.datavalue?.value;

      if (value && typeof value === "object" && value.id) {
        ids.push(value.id);
      }
    }
  }

  return ids;
}

function buildMetadataTerms(reference) {
  return [
    reference.title.toLowerCase(),
    reference.provider || "",
    reference.creator || "",
    ...(reference.metadataLabels || []),
  ].join(" ");
}

function scoreGestureReference(reference) {
  const text = buildMetadataTerms(reference);
  const aspectRatio = reference.width && reference.height ? reference.width / reference.height : 0;
  const queryTokenMatches = new Set((reference.queryTokens || []).filter((token) => text.includes(token)));
  const strongMatches = gestureStrongPositiveTerms.filter((term) => text.includes(term)).length;
  const positiveMatches = gesturePositiveTerms.filter((term) => text.includes(term)).length;
  const negativeMatches = gestureNegativeTerms.filter((term) => text.includes(term)).length;
  const pluralMatches = gesturePluralBlockers.filter((term) => text.includes(term)).length;
  const hasSubjectSignal =
    /(athlete|basketball player|soccer player|tennis player|skater|figure skater|ice skater|runner|sprinter|dancer|ballerina|breakdancer|gymnast|surfer|climber|martial artist|karate|skateboarder|boxer|wrestler|yogi|yoga)/.test(
      text,
    );
  const hasActionSignal =
    /(pose|posing|jump|jumping|kick|kicking|serve|serving|skating|figure skating|ice skating|dance|dancing|leap|gymnastics|yoga|asana|parkour|vault|surf|surfing|stance|trick|spin|freeze|arabesque|shot|balance|standing)/.test(
      text,
    );
  const hasSingleSubjectSignal =
    /(single|solo|full body|full-length|individual|one person)/.test(text) || reference.depictsCount === 1;
  const hasDescriptionOnlyMatch =
    reference.sourceKind === "openverse" &&
    Array.isArray(reference.fieldsMatched) &&
    reference.fieldsMatched.length > 0 &&
    !reference.fieldsMatched.some((field) => field === "title" || field.startsWith("tags"));
  const hasPhotoSignal = /(photograph|photography|flickr|olympics|championship|wimbledon|dvids)/.test(
    text,
  );

  if (reference.queryTokens?.length > 0 && queryTokenMatches.size < Math.min(2, reference.queryTokens.length)) {
    return -100;
  }

  if (!hasSubjectSignal || !hasActionSignal || hasDescriptionOnlyMatch) {
    return -100;
  }

  if (negativeMatches > 0 || pluralMatches > 0) {
    return -100;
  }

  let score = strongMatches * 6 + positiveMatches * 2;

  if (hasPhotoSignal) {
    score += 4;
  }

  if (hasSingleSubjectSignal) {
    score += 5;
  }

  if (reference.depictsCount === 1) {
    score += 4;
  } else if (reference.depictsCount === 2) {
    score -= 2;
  } else if (reference.depictsCount > 2) {
    return -100;
  }

  if (reference.provider && gesturePreferredPhotoProviders.has(reference.provider)) {
    score += 3;
  }

  if (aspectRatio > 1.55) {
    score -= 12;
  } else if (aspectRatio > 0 && aspectRatio < 0.35) {
    return -100;
  } else if (aspectRatio > 0.58 && aspectRatio < 1.05) {
    score += 4;
  } else if (aspectRatio >= 1.05 && aspectRatio <= 1.35) {
    score += 2;
  }

  return score;
}

async function fetchMediaInfoMap(fileTitles) {
  const mediaInfoMap = new Map();

  for (const chunk of chunkArray(fileTitles, 20)) {
    const response = await fetch(buildMediaInfoUrl(chunk));

    if (!response.ok) {
      throw new Error(`Wikimedia metadata request failed with ${response.status}`);
    }

    const payload = await response.json();

    for (const entity of Object.values(payload.entities || {})) {
      if (entity?.title) {
        mediaInfoMap.set(entity.title, entity);
      }
    }
  }

  return mediaInfoMap;
}

async function fetchEntityLabels(ids) {
  const labelMap = new Map();

  for (const chunk of chunkArray(ids, 45)) {
    const response = await fetch(buildEntityLabelsUrl(chunk));

    if (!response.ok) {
      throw new Error(`Wikimedia label request failed with ${response.status}`);
    }

    const payload = await response.json();

    for (const [id, entity] of Object.entries(payload.entities || {})) {
      const label = entity?.labels?.en?.value;

      if (label) {
        labelMap.set(id, label.toLowerCase());
      }
    }
  }

  return labelMap;
}

async function enrichGestureCandidates(candidates) {
  if (candidates.length === 0) {
    return [];
  }

  const mediaInfoMap = await fetchMediaInfoMap(candidates.map((candidate) => candidate.fileTitle));
  const entityIds = new Set();

  for (const candidate of candidates) {
    const entity = mediaInfoMap.get(candidate.fileTitle);

    for (const id of getEntityIdsFromStatements(entity, ["P180", "P921", "P31", "P136"])) {
      entityIds.add(id);
    }
  }

  const labelMap = await fetchEntityLabels([...entityIds]);

  return candidates.map((candidate) => {
    const entity = mediaInfoMap.get(candidate.fileTitle);
    const metadataIds = getEntityIdsFromStatements(entity, ["P180", "P921", "P31", "P136"]);

    return {
      ...candidate,
      depictsCount: (entity?.statements?.P180 || []).length,
      metadataLabels: metadataIds
        .map((id) => labelMap.get(id))
        .filter(Boolean),
    };
  });
}

async function fetchCommonsCandidates(query, page = 1) {
  const cacheKey = buildGestureCacheKey("commons", query, page);

  if (gestureQueryCache.has(cacheKey)) {
    return gestureQueryCache.get(cacheKey);
  }

  const response = await fetch(buildCommonsUrl(query, Math.max(0, (page - 1) * 18)));

  if (!response.ok) {
    throw new Error(`Wikimedia request failed with ${response.status}`);
  }

  const payload = await response.json();
  const pages = Object.values(payload.query?.pages || {});

  const rawCandidates = pages
    .map((pageInfo) => {
      const info = pageInfo.imageinfo?.[0] || {};

      return {
        fileTitle: pageInfo.title,
        title: cleanGestureTitle(pageInfo.title),
        imageUrl: info.thumburl || info.url,
        sourceUrl: info.descriptionurl,
        sourceName: "Wikimedia Commons",
        sourceKind: "commons",
        uniqueKey: `commons:${pageInfo.title}`,
        width: info.width || info.thumbwidth || 0,
        height: info.height || info.thumbheight || 0,
        query,
        queryTokens: getGestureQueryTokens(query),
      };
    })
    .filter((reference) => isValidGestureReference(reference));

  const enrichedCandidates = await enrichGestureCandidates(rawCandidates);
  const verifiedCandidates = enrichedCandidates
    .map((reference) => ({
      ...reference,
      score: scoreGestureReference(reference),
    }))
    .filter((reference) => reference.score >= 14)
    .sort((left, right) => right.score - left.score);

  gestureQueryCache.set(cacheKey, verifiedCandidates);
  return verifiedCandidates;
}

async function fetchOpenverseCandidates(query, page = 1) {
  const cacheKey = buildGestureCacheKey("openverse", query, page);

  if (gestureQueryCache.has(cacheKey)) {
    return gestureQueryCache.get(cacheKey);
  }

  const response = await fetch(buildOpenverseUrl(query, page));

  if (!response.ok) {
    throw new Error(`Openverse request failed with ${response.status}`);
  }

  const payload = await response.json();
  const verifiedCandidates = (payload.results || [])
    .map((result) => {
      const metadataLabels = [
        result.provider,
        result.source,
        result.license,
        ...(result.tags || []).map((tag) => tag.name),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return {
        fileTitle: result.id,
        title: cleanGestureTitle(result.title || query) || "Untitled pose",
        imageUrl: hasSupportedGestureImageUrl(result.url) ? result.url : result.thumbnail,
        fallbackImageUrl: result.thumbnail || "",
        sourceUrl: result.foreign_landing_url || result.url || result.detail_url,
        sourceName: result.provider ? `Openverse / ${result.provider}` : "Openverse",
        sourceKind: "openverse",
        uniqueKey: `openverse:${result.id}`,
        width: result.width || 0,
        height: result.height || 0,
        provider: (result.provider || result.source || "").toLowerCase(),
        creator: (result.creator || "").toLowerCase(),
        metadataLabels,
        fieldsMatched: result.fields_matched || [],
        mature: Boolean(result.mature),
        query,
        queryTokens: getGestureQueryTokens(query),
      };
    })
    .filter((reference) => isValidGestureReference(reference))
    .map((reference) => ({
      ...reference,
      score: scoreGestureReference(reference),
    }))
    .filter((reference) => reference.score >= 14)
    .sort((left, right) => right.score - left.score);

  gestureQueryCache.set(cacheKey, verifiedCandidates);
  return verifiedCandidates;
}

async function fetchPoseCandidates(source, query) {
  if (source === "quickposes") {
    return getQuickposesCandidates();
  }

  const page = source === "openverse" ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3) + 1;

  if (source === "openverse") {
    return fetchOpenverseCandidates(query, page);
  }

  return fetchCommonsCandidates(query, page);
}

function getGestureSourceOrder() {
  if (state.gesture.selectedSource === "quickposes") {
    return ["quickposes"];
  }

  if (state.gesture.selectedSource === "commons") {
    return ["commons"];
  }

  if (state.gesture.selectedSource === "openverse") {
    return ["openverse"];
  }

  return ["quickposes", "openverse", "commons"];
}

async function fetchGestureReference() {
  const usedReferenceKeys = new Set(state.gesture.usedRefs.map((reference) => getGestureReferenceKey(reference)));
  const allCandidates = [];
  const sourceOrder = getGestureSourceOrder();

  if (sourceOrder.includes("quickposes")) {
    const quickposesCandidates = shuffle(getQuickposesCandidates()).filter(
      (candidate) => !usedReferenceKeys.has(getGestureReferenceKey(candidate)),
    );

    if (quickposesCandidates.length > 0) {
      return quickposesCandidates[0];
    }

    if (state.gesture.selectedSource === "quickposes") {
      throw new Error("No new QuickPoses references are left for the current session. Start a fresh session or switch sources.");
    }
  }

  for (const query of shuffle(gestureSearchTerms)) {
    for (const source of sourceOrder.filter((entry) => entry !== "quickposes")) {
      try {
        const candidates = dedupeGestureReferences(await fetchPoseCandidates(source, query));
        const freshCandidates = candidates.filter(
          (candidate) => !usedReferenceKeys.has(getGestureReferenceKey(candidate)),
        );

        if (freshCandidates.length > 0) {
          const bestScore = freshCandidates[0].score;
          const shortlist = freshCandidates
            .filter((candidate) => candidate.score >= bestScore - 4)
            .slice(0, 6);
          return randomFrom(shortlist);
        }

        allCandidates.push(...candidates);
      } catch (error) {}
    }
  }

  if (dedupeGestureReferences(allCandidates).length > 0) {
    throw new Error(
      "No new verified single-person pose references are left for the current source. Change the source or start a fresh session.",
    );
  }

  throw new Error("I couldn't find a clean single-person action-photo reference from the current source.");
}

async function loadNextGestureReference({ resetHistory = false } = {}) {
  const gestureState = state.gesture;

  if (resetHistory) {
    gestureState.usedRefs = [];
    gestureState.currentRef = null;
  } else if (gestureState.selectedCount > 0 && gestureState.usedRefs.length >= gestureState.selectedCount) {
    endGestureSession();
    return;
  }

  clearGestureTimer();
  gestureState.loading = true;
  gestureState.active = false;
  gestureState.ended = false;
  gestureState.error = "";
  gestureState.remainingMs = gestureState.selectedDuration;
  const token = gestureState.requestToken + 1;
  gestureState.requestToken = token;
  syncUi();

  try {
    const reference = await fetchGestureReference();

    if (gestureState.requestToken !== token) {
      return;
    }

    const nextReference = {
      ...reference,
      index: gestureState.usedRefs.length + 1,
      durationMs: gestureState.selectedDuration,
    };

    gestureState.currentRef = nextReference;
    gestureState.usedRefs.push(nextReference);
    gestureState.loading = false;
    gestureState.active = true;
    gestureState.error = "";
    startGestureTimer();
    syncUi();
  } catch (error) {
    if (gestureState.requestToken !== token) {
      return;
    }

    gestureState.loading = false;
    gestureState.active = false;
    gestureState.error =
      error instanceof Error
        ? error.message
        : "I couldn't load a pose reference right now. Try Next Pose again in a moment.";
    syncUi();
  }
}

async function startGestureSession({ fresh = true } = {}) {
  state.mode = "gesture";
  syncUi();
  await loadNextGestureReference({ resetHistory: fresh });
}

function setGestureDuration(duration) {
  state.gesture.selectedDuration = duration;
  state.gesture.remainingMs = duration;
  syncUi();

  if (state.mode !== "gesture") {
    return;
  }

  if (state.gesture.active) {
    loadNextGestureReference();
  } else {
    startGestureSession({ fresh: true });
  }
}

function setGestureCount(count) {
  state.gesture.selectedCount = count;
  syncUi();

  if (
    state.gesture.active &&
    count > 0 &&
    state.gesture.usedRefs.length >= count
  ) {
    endGestureSession();
  }
}

function setGestureSource(source) {
  state.gesture.selectedSource = source;
  state.gesture.error = "";
  syncUi();

  if (state.mode === "gesture" && (state.gesture.active || state.gesture.loading)) {
    startGestureSession({ fresh: true });
  }
}

function setCustomPerspectiveMode(mode) {
  state.custom.perspectiveMode = mode;
  ensureCustomSetup();

  for (const shape of state.custom.shapes) {
    normalizeCustomShape(shape);
  }

  requestRender();
}

function toggleCustomHidden() {
  state.custom.showHidden = !state.custom.showHidden;
  requestRender();
}

function toggleCustomCylinderGuides() {
  state.custom.showCylinderGuides = !state.custom.showCylinderGuides;
  requestRender();
}

function removeSelectedCustomShape() {
  if (!state.custom.selectedShapeId) {
    return;
  }

  state.custom.shapes = state.custom.shapes.filter((shape) => shape.id !== state.custom.selectedShapeId);
  state.custom.selectedShapeId = state.custom.shapes.at(-1)?.id || null;
  requestRender();
}

function clearCustomPhoto() {
  if (state.custom.photo?.objectUrl) {
    URL.revokeObjectURL(state.custom.photo.objectUrl);
  }

  state.custom.photo = null;
  state.custom.analysisReady = false;
  state.custom.placementKind = null;

  if (ui.customPhotoInput) {
    ui.customPhotoInput.value = "";
  }

  requestRender();
}

function stepCustomScale(direction) {
  const selectedShape = getCustomSelectedShape();

  if (!selectedShape) {
    return;
  }

  scaleCustomShape(selectedShape, direction > 0 ? 1.08 : 0.92);
  requestRender();
}

function analyzeCustomPhoto() {
  const result = analyzePhotoPerspective();

  if (!result) {
    return;
  }

  state.custom.perspectiveMode = result.mode;
  state.custom.guides = {
    horizonY: mapAnalysisPointToCanvas({ x: 0, y: result.horizonY }).y,
    vp1: mapAnalysisPointToCanvas(result.vp1),
    vp2: mapAnalysisPointToCanvas(result.vp2),
    vp3: mapAnalysisPointToCanvas(result.vp3),
  };
  state.custom.guides.vp1.y = state.custom.guides.horizonY;
  state.custom.guides.vp2.y = state.custom.guides.horizonY;
  state.custom.analysisReady = true;
  state.custom.placementKind = "box";
  requestRender();
}

async function autoCorrectSelectedCustomShape() {
  const selectedShape = getCustomSelectedShape();

  if (!selectedShape || !state.custom.photo?.analysis || state.custom.autoCorrecting) {
    return;
  }

  if (selectedShape.kind === "cylinder") {
    return;
  }

  state.custom.autoCorrecting = true;
  syncUi();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const optimized = optimizeBoxShapeAgainstPhoto(selectedShape);
  Object.assign(selectedShape, optimized.shape);
  selectedShape.origin = { ...optimized.shape.origin };
  state.custom.autoCorrecting = false;
  requestRender();
}

function loadImageFromObjectUrl(objectUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = objectUrl;
  });
}

async function handleCustomPhotoChange(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromObjectUrl(objectUrl);

    if (state.custom.photo?.objectUrl) {
      URL.revokeObjectURL(state.custom.photo.objectUrl);
    }

    state.custom.photo = {
      image,
      name: file.name,
      objectUrl,
      analysis: buildPhotoAnalysis(image),
    };
    state.custom.analysisReady = false;
    state.custom.placementKind = null;

    switchMode("custom");
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
  }
}

function findCustomGuideHit(point) {
  ensureCustomSetup();
  const guides = state.custom.guides;
  const handles = [{ type: "vp1", point: guides.vp1 }];

  if (state.custom.perspectiveMode !== "one") {
    handles.push({ type: "vp2", point: guides.vp2 });
  }

  if (state.custom.perspectiveMode === "three") {
    handles.push({ type: "vp3", point: guides.vp3 });
  }

  for (const handle of handles) {
    if (distance2(point, handle.point) <= 18) {
      return handle;
    }
  }

  if (Math.abs(point.y - guides.horizonY) <= 12) {
    return { type: "horizon", point: { x: point.x, y: guides.horizonY } };
  }

  return null;
}

function getCustomDragPayload(shape, geometry, point) {
  const handles = [
    { type: "origin", point: geometry.handles.origin },
    { type: "x", point: geometry.handles.x },
    { type: "y", point: geometry.handles.y },
    { type: "z", point: geometry.handles.z },
  ];

  for (const handle of handles) {
    if (distance2(point, handle.point) <= 18) {
      return { type: "shape-handle", handle: handle.type, shapeId: shape.id };
    }
  }

  const bounds = getCustomShapeBounds(geometry);
  const inside =
    point.x >= bounds.minX - 12 &&
    point.x <= bounds.maxX + 12 &&
    point.y >= bounds.minY - 12 &&
    point.y <= bounds.maxY + 12;

  if (inside) {
    return { type: "shape-body", shapeId: shape.id };
  }

  return null;
}

function updateCustomShapeFromHandle(shape, handle, point) {
  const guides = state.custom.guides;

  if (handle === "origin") {
    shape.origin = {
      x: clamp(point.x, 28, state.view.width - 28),
      y: clamp(point.y, 28, state.view.height - 28),
    };
    return;
  }

  if (shape.kind === "cube") {
    if (state.custom.perspectiveMode === "one") {
      if (handle === "x") {
        shape.size = point.x - shape.origin.x;
      } else if (handle === "y") {
        shape.size = (point.y - shape.origin.y) / shape.verticalSign;
      } else if (handle === "z") {
        shape.size = getRayParameter(shape.origin, guides.vp1, point) * distance2(shape.origin, guides.vp1);
      }

      return;
    }

    if (state.custom.perspectiveMode === "two") {
      if (handle === "x") {
        shape.size = getRayParameter(shape.origin, guides.vp1, point) * distance2(shape.origin, guides.vp1);
      } else if (handle === "z") {
        shape.size = getRayParameter(shape.origin, guides.vp2, point) * distance2(shape.origin, guides.vp2);
      } else if (handle === "y") {
        shape.size = (point.y - shape.origin.y) / shape.verticalSign;
      }

      return;
    }

    if (handle === "x") {
      shape.size = getRayParameter(shape.origin, guides.vp1, point) * distance2(shape.origin, guides.vp1);
    } else if (handle === "z") {
      shape.size = getRayParameter(shape.origin, guides.vp2, point) * distance2(shape.origin, guides.vp2);
    } else if (handle === "y") {
      shape.size = getRayParameter(shape.origin, guides.vp3, point) * distance2(shape.origin, guides.vp3);
    }

    return;
  }

  if (state.custom.perspectiveMode === "one") {
    if (handle === "x") {
      shape.width = clamp(point.x - shape.origin.x, 48, state.view.width * 0.45);
    } else if (handle === "y") {
      const next = (point.y - shape.origin.y) / shape.verticalSign;
      shape.height = clamp(next, 48, state.view.height * 0.58);
    } else if (handle === "z") {
      shape.depthT = clamp(getRayParameter(shape.origin, guides.vp1, point), 0.08, 0.84);
    }

    return;
  }

  if (state.custom.perspectiveMode === "two") {
    if (handle === "x") {
      shape.xT = clamp(getRayParameter(shape.origin, guides.vp1, point), 0.08, 0.82);
    } else if (handle === "z") {
      shape.zT = clamp(getRayParameter(shape.origin, guides.vp2, point), 0.08, 0.82);
    } else if (handle === "y") {
      const next = (point.y - shape.origin.y) / shape.verticalSign;
      shape.height = clamp(next, 48, state.view.height * 0.58);
    }

    return;
  }

  if (handle === "x") {
    shape.xT = clamp(getRayParameter(shape.origin, guides.vp1, point), 0.08, 0.82);
  } else if (handle === "z") {
    shape.zT = clamp(getRayParameter(shape.origin, guides.vp2, point), 0.08, 0.82);
  } else if (handle === "y") {
    shape.yT = clamp(getRayParameter(shape.origin, guides.vp3, point), 0.08, 0.82);
  }
}

function handleCustomPointerDown(event) {
  if (state.mode !== "custom") {
    return;
  }

  const point = getPointFromEvent(event);

  if (state.custom.analysisReady && state.custom.placementKind && state.custom.photo?.analysis) {
    const fittedShape = fitAnalyzedShapeAtPoint(state.custom.placementKind, point);

    if (fittedShape) {
      state.custom.shapes.push(fittedShape);
      state.custom.selectedShapeId = fittedShape.id;
    }

    state.custom.placementKind = null;
    requestRender();
    return;
  }

  for (let index = state.custom.shapes.length - 1; index >= 0; index -= 1) {
    const shape = state.custom.shapes[index];
    const geometry = getCustomShapeGeometry(shape);
    const hit = getCustomDragPayload(shape, geometry, point);

    if (hit) {
      state.custom.selectedShapeId = shape.id;
      state.custom.interaction = {
        ...hit,
        pointerId: event.pointerId,
        startPoint: point,
        startOrigin: { ...shape.origin },
      };
      canvas.setPointerCapture(event.pointerId);
      requestRender();
      return;
    }
  }

  const guideHit = findCustomGuideHit(point);

  if (guideHit) {
    state.custom.interaction = {
      type: "guide",
      guide: guideHit.type,
      pointerId: event.pointerId,
      startPoint: point,
      snapshot: {
        horizonY: state.custom.guides.horizonY,
        vp1: { ...state.custom.guides.vp1 },
        vp2: { ...state.custom.guides.vp2 },
        vp3: { ...state.custom.guides.vp3 },
      },
    };
    canvas.setPointerCapture(event.pointerId);
    requestRender();
    return;
  }

  state.custom.selectedShapeId = null;
  requestRender();
}

function handleCustomPointerMove(event) {
  const interaction = state.custom.interaction;

  if (!interaction || interaction.pointerId !== event.pointerId) {
    return;
  }

  const point = getPointFromEvent(event);

  if (interaction.type === "guide") {
    const guides = state.custom.guides;
    const deltaY = point.y - interaction.startPoint.y;
    const deltaX = point.x - interaction.startPoint.x;

    if (interaction.guide === "horizon") {
      guides.horizonY = clamp(interaction.snapshot.horizonY + deltaY, 44, state.view.height - 44);
      guides.vp1.y = guides.horizonY;
      guides.vp2.y = guides.horizonY;
    } else if (interaction.guide === "vp1") {
      guides.vp1.x = clamp(interaction.snapshot.vp1.x + deltaX, 24, state.view.width - 24);
      guides.vp1.y = guides.horizonY;

      if (state.custom.perspectiveMode !== "one" && Math.abs(guides.vp1.x - guides.vp2.x) < 88) {
        guides.vp1.x = guides.vp2.x - 88;
      }
    } else if (interaction.guide === "vp2") {
      guides.vp2.x = clamp(interaction.snapshot.vp2.x + deltaX, 24, state.view.width - 24);
      guides.vp2.y = guides.horizonY;

      if (Math.abs(guides.vp2.x - guides.vp1.x) < 88) {
        guides.vp2.x = guides.vp1.x + 88;
      }
    } else if (interaction.guide === "vp3") {
      guides.vp3.x = clamp(interaction.snapshot.vp3.x + deltaX, 24, state.view.width - 24);
      guides.vp3.y = clamp(interaction.snapshot.vp3.y + deltaY, 24, state.view.height - 24);

      if (Math.abs(guides.vp3.y - guides.horizonY) < 84) {
        guides.vp3.y = guides.horizonY + (guides.vp3.y >= guides.horizonY ? 84 : -84);
      }

      guides.vp3.y = clamp(guides.vp3.y, 24, state.view.height - 24);
    }

    for (const shape of state.custom.shapes) {
      normalizeCustomShape(shape);
    }

    requestRender();
    return;
  }

  const shape = getCustomSelectedShape();

  if (!shape) {
    return;
  }

  if (interaction.type === "shape-body") {
    const delta = subtract2(point, interaction.startPoint);
    shape.origin = {
      x: clamp(interaction.startOrigin.x + delta.x, 28, state.view.width - 28),
      y: clamp(interaction.startOrigin.y + delta.y, 28, state.view.height - 28),
    };
  } else if (interaction.type === "shape-handle") {
    updateCustomShapeFromHandle(shape, interaction.handle, point);
  }

  normalizeCustomShape(shape);
  requestRender();
}

function handleCustomPointerUp(event) {
  if (!state.custom.interaction || state.custom.interaction.pointerId !== event.pointerId) {
    return;
  }

  state.custom.interaction = null;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  requestRender();
}

function handlePerspectiveClick(event) {
  const modeButton = event.target.closest("[data-mode]");
  const shapeButton = event.target.closest("[data-shape]");
  const perspectiveButton = event.target.closest("[data-perspective-mode]");
  const toggleButton = event.target.closest("[data-toggle]");
  const rotateButton = event.target.closest("[data-rotate]");
  const liftButton = event.target.closest("[data-lift]");
  const durationButton = event.target.closest("[data-duration]");
  const countButton = event.target.closest("[data-ref-count]");
  const gestureSourceButton = event.target.closest("[data-gesture-source]");
  const gestureActionButton = event.target.closest("[data-gesture-action]");
  const customPerspectiveButton = event.target.closest("[data-custom-perspective]");
  const customAddButton = event.target.closest("[data-custom-add]");
  const customToggleButton = event.target.closest("[data-custom-toggle]");
  const customActionButton = event.target.closest("[data-custom-action]");

  if (modeButton) {
    switchMode(modeButton.dataset.mode);
    return;
  }

  if (shapeButton) {
    state.perspective.selectedShape = shapeButton.dataset.shape;
    setPerspectiveExercise(state.perspective.selectedShape);
    return;
  }

  if (perspectiveButton) {
    state.perspective.selectedMode = perspectiveButton.dataset.perspectiveMode;
    setPerspectiveExercise(state.perspective.selectedShape);
    return;
  }

  if (toggleButton) {
    const toggle = toggleButton.dataset.toggle;

    if (toggle === "hidden") {
      togglePerspectiveHidden();
    } else if (toggle === "guides") {
      togglePerspectiveGuides();
    } else if (toggle === "cylinder-guides") {
      togglePerspectiveCylinderGuides();
    } else if (toggle === "zoom") {
      togglePerspectiveZoom();
    } else if (toggle === "auto") {
      togglePerspectiveAutoShuffle();
    }

    return;
  }

  if (rotateButton) {
    switchMode("perspective");
    if (rotateButton.dataset.rotate === "up") {
      stepPerspectiveRotation(1, "vertical");
    } else if (rotateButton.dataset.rotate === "down") {
      stepPerspectiveRotation(-1, "vertical");
    } else {
      stepPerspectiveRotation(rotateButton.dataset.rotate === "left" ? -1 : 1);
    }
    return;
  }

  if (liftButton) {
    switchMode("perspective");
    if (liftButton.dataset.lift === "center") {
      centerPerspectiveOnHorizon();
    } else {
      stepPerspectiveLift(liftButton.dataset.lift === "up" ? 1 : -1);
    }
    return;
  }

  if (durationButton) {
    setGestureDuration(Number(durationButton.dataset.duration));
    return;
  }

  if (countButton) {
    setGestureCount(Number(countButton.dataset.refCount));
    return;
  }

  if (gestureSourceButton) {
    setGestureSource(gestureSourceButton.dataset.gestureSource);
    return;
  }

  if (gestureActionButton) {
    const action = gestureActionButton.dataset.gestureAction;

    if (action === "start") {
      startGestureSession({ fresh: true });
    } else if (action === "next") {
      if (state.mode !== "gesture") {
        switchMode("gesture");
      }

      loadNextGestureReference({ resetHistory: false });
    } else if (action === "end") {
      endGestureSession();
    }

    return;
  }

  if (customPerspectiveButton) {
    switchMode("custom");
    setCustomPerspectiveMode(customPerspectiveButton.dataset.customPerspective);
    return;
  }

  if (customAddButton) {
    switchMode("custom");

    if (state.custom.analysisReady && state.custom.photo?.analysis) {
      state.custom.placementKind = customAddButton.dataset.customAdd;
      requestRender();
    } else {
      createCustomShape(customAddButton.dataset.customAdd);
    }

    return;
  }

  if (customToggleButton) {
    if (customToggleButton.dataset.customToggle === "hidden") {
      toggleCustomHidden();
    } else if (customToggleButton.dataset.customToggle === "cylinder-guides") {
      toggleCustomCylinderGuides();
    }

    return;
  }

  if (customActionButton) {
    switchMode("custom");

    if (customActionButton.dataset.customAction === "analyze-photo") {
      analyzeCustomPhoto();
    } else if (customActionButton.dataset.customAction === "smaller") {
      stepCustomScale(-1);
    } else if (customActionButton.dataset.customAction === "larger") {
      stepCustomScale(1);
    } else if (customActionButton.dataset.customAction === "center-guides") {
      resetCustomGuides();
    } else if (customActionButton.dataset.customAction === "delete-shape") {
      removeSelectedCustomShape();
    } else if (customActionButton.dataset.customAction === "clear-photo") {
      clearCustomPhoto();
    }
  }
}

function handleKeyboard(event) {
  if (event.target instanceof HTMLElement && /input|textarea|select|button/i.test(event.target.tagName)) {
    return;
  }

  const key = event.key.toLowerCase();

  if (state.mode === "gesture") {
    if (key === "n") {
      loadNextGestureReference();
      return;
    }

    if (key === "e") {
      endGestureSession();
      return;
    }

    if (key === "s") {
      startGestureSession({ fresh: true });
      return;
    }
  }

  if (state.mode === "custom") {
    if (key === "1") {
      setCustomPerspectiveMode("one");
      return;
    }

    if (key === "2") {
      setCustomPerspectiveMode("two");
      return;
    }

    if (key === "3") {
      setCustomPerspectiveMode("three");
      return;
    }

    if (key === "c") {
      createCustomShape("cube");
      return;
    }

    if (key === "b") {
      createCustomShape("box");
      return;
    }

    if (key === "l") {
      createCustomShape("cylinder");
      return;
    }

    if (key === "h") {
      toggleCustomHidden();
      return;
    }

    if (key === "escape") {
      state.custom.selectedShapeId = null;
      requestRender();
      return;
    }

    if (key === "-" || key === "_") {
      stepCustomScale(-1);
      return;
    }

    if (key === "=" || key === "+") {
      stepCustomScale(1);
      return;
    }

    if (key === "delete" || key === "backspace") {
      removeSelectedCustomShape();
      return;
    }
  }

  if (key === " ") {
    event.preventDefault();
    state.mode = "perspective";
    syncUi();
    setPerspectiveExercise(state.perspective.selectedShape);
  } else if (key === "arrowleft") {
    event.preventDefault();
    switchMode("perspective");
    stepPerspectiveRotation(-1);
  } else if (key === "arrowright") {
    event.preventDefault();
    switchMode("perspective");
    stepPerspectiveRotation(1);
  } else if (key === "arrowup") {
    event.preventDefault();
    if (event.shiftKey) {
      switchMode("perspective");
      stepPerspectiveLift(1);
    } else {
      switchMode("perspective");
      stepPerspectiveRotation(1, "vertical");
    }
  } else if (key === "arrowdown") {
    event.preventDefault();
    if (event.shiftKey) {
      switchMode("perspective");
      stepPerspectiveLift(-1);
    } else {
      switchMode("perspective");
      stepPerspectiveRotation(-1, "vertical");
    }
  } else if (key === "r") {
    if (state.mode === "gesture") {
      return;
    }

    switchMode("perspective");
    stepPerspectiveRotation(event.shiftKey ? -1 : 1);
  } else if (key === "c") {
    state.mode = "perspective";
    state.perspective.selectedShape = "cube";
    syncUi();
    setPerspectiveExercise("cube");
  } else if (key === "b") {
    state.mode = "perspective";
    state.perspective.selectedShape = "box";
    syncUi();
    setPerspectiveExercise("box");
  } else if (key === "l") {
    state.mode = "perspective";
    state.perspective.selectedShape = "cylinder";
    syncUi();
    setPerspectiveExercise("cylinder");
  } else if (key === "1") {
    state.mode = "perspective";
    state.perspective.selectedMode = "one";
    syncUi();
    setPerspectiveExercise(state.perspective.selectedShape);
  } else if (key === "2") {
    state.mode = "perspective";
    state.perspective.selectedMode = "two";
    syncUi();
    setPerspectiveExercise(state.perspective.selectedShape);
  } else if (key === "3") {
    state.mode = "perspective";
    state.perspective.selectedMode = "three";
    syncUi();
    setPerspectiveExercise(state.perspective.selectedShape);
  } else if (key === "h") {
    togglePerspectiveHidden();
  } else if (key === "g") {
    if (state.mode === "gesture") {
      return;
    }

    togglePerspectiveGuides();
  } else if (key === "z") {
    togglePerspectiveZoom();
  } else if (key === "a") {
    togglePerspectiveAutoShuffle();
  }
}

document.addEventListener("click", handlePerspectiveClick);
window.addEventListener("resize", () => {
  if (state.mode !== "gesture") {
    requestRender();
  }
});
window.addEventListener("keydown", handleKeyboard);
canvas.addEventListener("pointerdown", handleCustomPointerDown);
canvas.addEventListener("pointermove", handleCustomPointerMove);
canvas.addEventListener("pointerup", handleCustomPointerUp);
canvas.addEventListener("pointercancel", handleCustomPointerUp);
canvas.addEventListener("pointerdown", handlePerspectivePointerDown);
canvas.addEventListener("pointermove", handlePerspectivePointerMove);
canvas.addEventListener("pointerup", handlePerspectivePointerUp);
canvas.addEventListener("pointercancel", handlePerspectivePointerUp);
canvas.addEventListener("wheel", handleCustomWheel, { passive: false });
ui.gestureImage.addEventListener("error", () => {
  const fallbackSrc = ui.gestureImage.dataset.fallbackSrc;

  if (fallbackSrc && ui.gestureImage.src !== fallbackSrc) {
    ui.gestureImage.src = fallbackSrc;
  }
});

if (ui.customPhotoInput) {
  ui.customPhotoInput.addEventListener("change", handleCustomPhotoChange);
}

syncUi();
setPerspectiveExercise("random");
