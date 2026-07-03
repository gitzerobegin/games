const arena = document.getElementById("arena");
const sceneImage = document.getElementById("sceneImage");
const dangerTint = document.getElementById("dangerTint");
const entities = document.getElementById("entities");
const player = document.getElementById("player");
const exitGate = document.getElementById("exitGate");
const toast = document.getElementById("toast");
const scenePill = document.getElementById("scenePill");
const scorePill = document.getElementById("scorePill");
const heartPill = document.getElementById("heartPill");
const missionTitle = document.getElementById("missionTitle");
const missionText = document.getElementById("missionText");
const teamList = document.getElementById("teamList");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");
const mapDots = Array.from(document.querySelectorAll(".map-dot"));
const moveButtons = Array.from(document.querySelectorAll(".move-button"));

const A = "assets/";

const roles = {
  jiang: { name: "Jiang", src: `${A}commander-jiang.png` },
  liu: { name: "Liu", src: `${A}commander-liu.png` },
  zhang: { name: "Zhang", src: `${A}lord-zhang.png` },
  ng: { name: "Ng", src: `${A}commander-ng.png` },
  laliana: { name: "Laliana", src: `${A}laliana.png` },
  heather: { name: "Heather", src: `${A}heather.png` },
  scapelmorte: { name: "Scapelmorte", src: `${A}scapelmorte.png` },
  hollux: { name: "Hollux", src: `${A}holluxmorte.png` },
  gringad: { name: "Gringad", src: `${A}gringad.png` },
  heimerstein: { name: "Heimer", src: `${A}heimerstein.png` },
  chimae: { name: "Chimae", src: `${A}chimaecorantine.png` },
  rabbit: { name: "Rabbit", src: `${A}rabbit.png` },
  crocedile: { name: "Crocedile", src: `${A}crocedile.png` },
  spirit: { name: "Spirit", src: `${A}dark-spirit.png` },
  frangola: { name: "Frangola", src: `${A}frangola.png` },
  dweller: { name: "Dweller", src: `${A}swamp-dweller.png` }
};

const levels = [
  {
    name: "Badge",
    title: "Badge Night",
    mission: "Grab badge",
    bg: `${A}bg-prologue.png`,
    start: { x: 12, y: 72 },
    exit: { x: 89, y: 71 },
    items: [
      { id: "badge", label: "Badge", rune: "B", className: "badge-rune", x: 74, y: 62, say: "Badge!" },
      { id: "heather", label: "Heather", role: "heather", x: 34, y: 67, say: "Shield!" }
    ],
    hazards: [
      { id: "scapelmorte", role: "scapelmorte", x: 55, y: 48, r: 8, patrol: { axis: "x", min: 46, max: 64, speed: 0.00016 } },
      { id: "hollux", role: "hollux", x: 55, y: 75, r: 7, patrol: { axis: "y", min: 61, max: 78, speed: 0.00018 } }
    ]
  },
  {
    name: "Council",
    title: "Royal Council",
    mission: "Recruit Liu",
    bg: `${A}bg-council.png`,
    start: { x: 12, y: 72 },
    exit: { x: 90, y: 70 },
    items: [
      { id: "liu", label: "Liu", role: "liu", x: 47, y: 64, say: "Liu joins!" },
      { id: "chimae", label: "Chimae", role: "chimae", x: 66, y: 51, say: "Wing!" },
      { id: "spark", label: "Spark", rune: "S", className: "crystal-rune", x: 31, y: 43, say: "Courage!" }
    ],
    hazards: [
      { id: "gringad", role: "gringad", x: 71, y: 72, r: 7, patrol: { axis: "x", min: 62, max: 80, speed: 0.00019 } }
    ]
  },
  {
    name: "Throne",
    title: "Rabbit Throne",
    mission: "Find Lord",
    bg: `${A}bg-throne.png`,
    start: { x: 13, y: 74 },
    exit: { x: 90, y: 72 },
    items: [
      { id: "zhang", label: "Zhang", role: "zhang", x: 62, y: 42, say: "Lord!" },
      { id: "rabbit", label: "Rabbit", role: "rabbit", x: 76, y: 67, say: "Hop!" },
      { id: "crown", label: "Crown", rune: "C", className: "crown-rune", x: 42, y: 55, say: "Crown!" }
    ],
    hazards: [
      { id: "heimerstein", role: "heimerstein", x: 52, y: 75, r: 7, patrol: { axis: "x", min: 42, max: 58, speed: 0.00017 } }
    ]
  },
  {
    name: "Swamp",
    title: "Yugravian Swamp",
    mission: "Cross mud",
    bg: `${A}bg-swamp.png`,
    start: { x: 10, y: 73 },
    exit: { x: 91, y: 68 },
    items: [
      { id: "ng", label: "Ng", role: "ng", x: 39, y: 53, say: "Ng joins!" },
      { id: "laliana", label: "Laliana", role: "laliana", x: 57, y: 43, say: "Light!" },
      { id: "map", label: "Map", rune: "M", className: "map-rune", x: 78, y: 70, say: "Map!" }
    ],
    hazards: [
      { id: "crocedile", role: "crocedile", x: 51, y: 75, r: 8, patrol: { axis: "x", min: 39, max: 67, speed: 0.00018 } },
      { id: "dweller", role: "dweller", x: 72, y: 55, r: 7, patrol: { axis: "y", min: 45, max: 66, speed: 0.0002 } },
      { id: "frangola", role: "frangola", x: 25, y: 50, r: 7 }
    ]
  },
  {
    name: "Bargonton",
    title: "Road Ahead",
    mission: "Reach gate",
    bg: `${A}bg-dawn.png`,
    start: { x: 12, y: 72 },
    exit: { x: 90, y: 68 },
    items: [
      { id: "crystal", label: "Crystal", rune: "G", className: "crystal-rune", x: 35, y: 62, say: "Glow!" },
      { id: "hope", label: "Hope", rune: "H", className: "crown-rune", x: 62, y: 46, say: "Hope!" }
    ],
    hazards: [
      { id: "scapelmorte-final", role: "scapelmorte", x: 56, y: 70, r: 8, patrol: { axis: "x", min: 45, max: 68, speed: 0.00019 } },
      { id: "spirit", role: "spirit", x: 74, y: 53, r: 7, patrol: { axis: "y", min: 41, max: 63, speed: 0.00022 } }
    ]
  }
];

const keys = new Set();
const state = {
  level: 0,
  hp: 3,
  pos: { x: 12, y: 72 },
  collected: new Set(),
  team: ["jiang"],
  complete: false,
  lastTime: 0,
  invincibleUntil: 0
};

const keyMap = {
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function level() {
  return levels[state.level];
}

function say(text) {
  toast.textContent = text;
}

function renderTeam() {
  teamList.innerHTML = "";
  state.team.forEach((id) => {
    const role = roles[id];
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `<img src="${role.src}" alt="" /><span>${role.name}</span>`;
    teamList.appendChild(card);
  });
}

function renderHud() {
  const current = level();
  scenePill.textContent = current.name;
  scorePill.textContent = `${state.collected.size}/${current.items.length}`;
  heartPill.textContent = "I".repeat(state.hp);
  nextButton.disabled = !state.complete;
  nextButton.textContent = state.level === levels.length - 1 && state.complete ? "Again" : "Next";
  mapDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === state.level);
    dot.classList.toggle("done", index < state.level || (index === state.level && state.complete));
  });
}

function makeToken(kind, data) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = `token ${kind}`;
  node.dataset.id = data.id;
  node.dataset.kind = kind;
  node.style.setProperty("--x", data.x);
  node.style.setProperty("--y", data.y);
  node.setAttribute("aria-label", data.label || data.id);

  if (data.role) {
    const img = document.createElement("img");
    img.src = roles[data.role].src;
    img.alt = "";
    node.appendChild(img);
  } else {
    node.classList.add("rune-item", data.className);
    node.textContent = data.rune;
  }

  const label = document.createElement("span");
  label.className = "token-label";
  label.textContent = data.label || roles[data.role]?.name || "";
  node.appendChild(label);

  if (kind === "item") {
    node.addEventListener("click", () => collect(data));
  }
  return node;
}

function renderEntities() {
  entities.innerHTML = "";
  const current = level();
  current.items.forEach((item) => {
    if (!state.collected.has(item.id)) {
      entities.appendChild(makeToken("item", item));
    }
  });
  current.hazards.forEach((hazard) => {
    entities.appendChild(makeToken("hazard", hazard));
  });
}

function renderPlayer() {
  player.style.setProperty("--x", state.pos.x);
  player.style.setProperty("--y", state.pos.y);
}

function openGate() {
  state.complete = true;
  exitGate.classList.add("open");
  say("Gate open!");
  renderHud();
}

function collect(item) {
  if (state.collected.has(item.id)) {
    return;
  }
  state.collected.add(item.id);

  if (item.role && !state.team.includes(item.role) && ["liu", "zhang", "ng", "laliana", "heather"].includes(item.role)) {
    state.team.push(item.role);
    renderTeam();
  }

  const node = entities.querySelector(`[data-id="${item.id}"]`);
  if (node) {
    node.classList.add("collected");
    window.setTimeout(() => node.remove(), 180);
  }

  say(item.say);
  if (state.collected.size === level().items.length) {
    openGate();
  } else {
    renderHud();
  }
}

function loadLevel(index) {
  state.level = index;
  state.hp = 3;
  state.pos = { ...levels[index].start };
  state.collected = new Set();
  state.complete = false;
  state.invincibleUntil = 0;
  keys.clear();

  const current = level();
  sceneImage.style.backgroundImage = `url("${current.bg}")`;
  exitGate.style.setProperty("--x", current.exit.x);
  exitGate.style.setProperty("--y", current.exit.y);
  exitGate.classList.remove("open");
  missionTitle.textContent = current.title;
  missionText.textContent = current.mission;

  renderPlayer();
  renderEntities();
  renderTeam();
  renderHud();
  say(current.mission);
  arena.focus({ preventScroll: true });
}

function patrolPosition(hazard, time) {
  let x = hazard.x;
  let y = hazard.y;
  if (hazard.patrol) {
    const span = hazard.patrol.max - hazard.patrol.min;
    const wave = (Math.sin(time * hazard.patrol.speed * Math.PI * 2) + 1) / 2;
    if (hazard.patrol.axis === "x") {
      x = hazard.patrol.min + span * wave;
    } else {
      y = hazard.patrol.min + span * wave;
    }
  }
  return { x, y };
}

function updateHazards(time) {
  level().hazards.forEach((hazard) => {
    const node = entities.querySelector(`[data-id="${hazard.id}"]`);
    if (!node) {
      return;
    }
    const pos = patrolPosition(hazard, time);
    hazard.live = pos;
    node.style.setProperty("--x", pos.x);
    node.style.setProperty("--y", pos.y);
  });
}

function checkCollections() {
  level().items.forEach((item) => {
    if (!state.collected.has(item.id) && dist(state.pos, item) < 7.2) {
      collect(item);
    }
  });
}

function takeHit(time) {
  if (time < state.invincibleUntil) {
    return;
  }

  const hit = level().hazards.find((hazard) => {
    const target = hazard.live || { x: hazard.x, y: hazard.y };
    return dist(state.pos, target) < (hazard.r || 7);
  });

  if (!hit) {
    return;
  }

  state.hp -= 1;
  state.invincibleUntil = time + 1200;
  dangerTint.classList.add("flash");
  player.classList.add("hit");
  window.setTimeout(() => dangerTint.classList.remove("flash"), 170);
  window.setTimeout(() => player.classList.remove("hit"), 280);

  const start = level().start;
  state.pos.x = clamp((state.pos.x + start.x) / 2, 6, 94);
  state.pos.y = clamp((state.pos.y + start.y) / 2, 24, 84);
  renderPlayer();

  if (state.hp <= 0) {
    state.hp = 3;
    state.pos = { ...level().start };
    say("Try again");
  } else {
    say("Dodge!");
  }
  renderHud();
}

function checkGate() {
  if (!state.complete) {
    return;
  }
  if (dist(state.pos, level().exit) < 8) {
    goNext();
  }
}

function move(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("left")) dx -= 1;
  if (keys.has("right")) dx += 1;
  if (keys.has("up")) dy -= 1;
  if (keys.has("down")) dy += 1;

  if (dx === 0 && dy === 0) {
    return;
  }

  const length = Math.hypot(dx, dy) || 1;
  const speed = 0.034 * dt;
  state.pos.x = clamp(state.pos.x + (dx / length) * speed, 5, 95);
  state.pos.y = clamp(state.pos.y + (dy / length) * speed, 24, 84);
  renderPlayer();
}

function frame(time) {
  const dt = state.lastTime ? Math.min(34, time - state.lastTime) : 16;
  state.lastTime = time;
  move(dt);
  updateHazards(time);
  checkCollections();
  takeHit(time);
  checkGate();
  window.requestAnimationFrame(frame);
}

function goNext() {
  if (!state.complete) {
    return;
  }
  if (state.level === levels.length - 1) {
    resetGame();
  } else {
    loadLevel(state.level + 1);
  }
}

function resetGame() {
  state.team = ["jiang"];
  loadLevel(0);
}

function setDir(dir, active) {
  if (active) {
    keys.add(dir);
  } else {
    keys.delete(dir);
  }
  moveButtons.forEach((button) => {
    if (button.dataset.dir === dir) {
      button.classList.toggle("active", active);
    }
  });
}

window.addEventListener("keydown", (event) => {
  const dir = keyMap[event.key];
  if (!dir) return;
  event.preventDefault();
  setDir(dir, true);
});

window.addEventListener("keyup", (event) => {
  const dir = keyMap[event.key];
  if (!dir) return;
  event.preventDefault();
  setDir(dir, false);
});

moveButtons.forEach((button) => {
  const dir = button.dataset.dir;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setDir(dir, true);
  });
  button.addEventListener("pointerup", () => setDir(dir, false));
  button.addEventListener("pointercancel", () => setDir(dir, false));
  button.addEventListener("pointerleave", () => setDir(dir, false));
});

nextButton.addEventListener("click", goNext);
restartButton.addEventListener("click", resetGame);

loadLevel(0);
window.requestAnimationFrame(frame);
