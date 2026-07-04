const arena = document.getElementById("arena");
const sceneImage = document.getElementById("sceneImage");
const dangerTint = document.getElementById("dangerTint");
const entities = document.getElementById("entities");
const playersLayer = document.getElementById("playersLayer");
const exitGate = document.getElementById("exitGate");
const toast = document.getElementById("toast");
const scenePill = document.getElementById("scenePill");
const scorePill = document.getElementById("scorePill");
const heartPill = document.getElementById("heartPill");
const playerPill = document.getElementById("playerPill");
const missionKicker = document.getElementById("missionKicker");
const missionTitle = document.getElementById("missionTitle");
const missionText = document.getElementById("missionText");
const topStatus = document.getElementById("topStatus");
const teamList = document.getElementById("teamList");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");
const connectButton = document.getElementById("connectButton");
const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCode");
const networkStatus = document.getElementById("networkStatus");
const joystick = document.getElementById("joystick");
const stickKnob = document.getElementById("stickKnob");
const mapDots = Array.from(document.querySelectorAll(".map-dot"));

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

const playerRoles = ["jiang", "liu", "zhang", "ng"];

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

const state = {
  mode: "solo",
  socket: null,
  localId: "jiang",
  level: 0,
  unlocked: 0,
  progress: createProgress(),
  players: {},
  lastTime: 0,
  lastBroadcast: 0,
  invincibleUntil: 0,
  joystick: { x: 0, y: 0, active: false, pointerId: null }
};

function createProgress() {
  return levels.map(() => ({ collected: new Set(), complete: false }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function currentLevel() {
  return levels[state.level];
}

function currentProgress() {
  return state.progress[state.level];
}

function localPlayer() {
  return state.players[state.localId];
}

function isConnected() {
  return state.socket && state.socket.readyState === WebSocket.OPEN;
}

function say(text) {
  toast.textContent = text;
}

function startPosition(role, levelIndex = state.level) {
  const base = levels[levelIndex].start;
  const index = Math.max(0, playerRoles.indexOf(role));
  const offsets = [
    { x: 0, y: 0 },
    { x: 5, y: 2 },
    { x: -4, y: -3 },
    { x: 3, y: -6 }
  ];
  const offset = offsets[index] || offsets[0];
  return {
    x: clamp(base.x + offset.x, 5, 95),
    y: clamp(base.y + offset.y, 22, 85)
  };
}

function setSoloPlayer() {
  const pos = startPosition("jiang", state.level);
  state.players = {
    jiang: {
      id: "jiang",
      role: "jiang",
      name: playerName(),
      x: pos.x,
      y: pos.y,
      hp: 3,
      present: true
    }
  };
  state.localId = "jiang";
}

function foundStoryRoles() {
  const found = [];
  state.progress.forEach((progress, levelIndex) => {
    levels[levelIndex].items.forEach((item) => {
      if (item.role && !playerRoles.includes(item.role) && progress.collected.has(item.id)) {
        found.push(item.role);
      }
    });
  });
  return [...new Set(found)];
}

function renderTeam() {
  teamList.innerHTML = "";

  Object.values(state.players)
    .filter((player) => player.present)
    .forEach((player) => {
      const card = document.createElement("div");
      card.className = `team-card${player.id === state.localId ? " local" : ""}`;
      card.innerHTML = `<img src="${roles[player.role].src}" alt="" /><span>${player.name}</span>`;
      teamList.appendChild(card);
    });

  foundStoryRoles().forEach((role) => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `<img src="${roles[role].src}" alt="" /><span>${roles[role].name}</span>`;
    teamList.appendChild(card);
  });
}

function renderHud() {
  const level = currentLevel();
  const progress = currentProgress();
  const player = localPlayer();
  const connectedPlayers = Object.values(state.players).filter((entry) => entry.present).length;

  scenePill.textContent = level.name;
  scorePill.textContent = `${progress.collected.size}/${level.items.length}`;
  heartPill.textContent = "I".repeat(player?.hp || 0) || "0";
  playerPill.textContent = `${connectedPlayers}P`;
  nextButton.disabled = !progress.complete;
  nextButton.textContent = state.level === levels.length - 1 && progress.complete ? "Again" : "Next";
  missionKicker.textContent = state.mode === "room" ? "Room Mission" : "Solo Mission";
  missionTitle.textContent = level.title;
  missionText.textContent = progress.complete ? "Reach gate" : level.mission;

  mapDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === state.level);
    dot.classList.toggle("done", index < state.level || (index === state.level && progress.complete));
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
  return node;
}

function renderEntities() {
  entities.innerHTML = "";
  const level = currentLevel();
  const progress = currentProgress();

  level.items.forEach((item) => {
    if (!progress.collected.has(item.id)) {
      entities.appendChild(makeToken("item", item));
    }
  });

  level.hazards.forEach((hazard) => {
    entities.appendChild(makeToken("hazard", hazard));
  });
}

function renderPlayers() {
  playersLayer.innerHTML = "";
  Object.values(state.players)
    .filter((player) => player.present)
    .forEach((player) => {
      const avatar = document.createElement("img");
      avatar.className = `player${player.id === state.localId ? " local" : ""}`;
      avatar.dataset.playerId = player.id;
      avatar.src = roles[player.role].src;
      avatar.alt = player.name;
      avatar.style.setProperty("--x", player.x);
      avatar.style.setProperty("--y", player.y);

      const label = document.createElement("span");
      label.className = "player-name";
      label.dataset.playerId = player.id;
      label.textContent = player.name;
      label.style.setProperty("--x", player.x);
      label.style.setProperty("--y", player.y);

      playersLayer.append(avatar, label);
    });
}

function renderPlayer(playerId) {
  const player = state.players[playerId];
  const avatar = playersLayer.querySelector(`.player[data-player-id="${playerId}"]`);
  const label = playersLayer.querySelector(`.player-name[data-player-id="${playerId}"]`);
  if (!player || !avatar || !label) return;
  avatar.style.setProperty("--x", player.x);
  avatar.style.setProperty("--y", player.y);
  label.style.setProperty("--x", player.x);
  label.style.setProperty("--y", player.y);
}

function renderLevel() {
  const level = currentLevel();
  sceneImage.style.backgroundImage = `url("${level.bg}")`;
  exitGate.style.setProperty("--x", level.exit.x);
  exitGate.style.setProperty("--y", level.exit.y);
  exitGate.classList.toggle("open", currentProgress().complete);
  renderEntities();
  renderPlayers();
  renderTeam();
  renderHud();
  say(currentProgress().complete ? "Gate open!" : level.mission);
}

function openGate(broadcast = true) {
  const progress = currentProgress();
  if (progress.complete) return;
  progress.complete = true;
  state.unlocked = Math.min(Math.max(state.unlocked, state.level + 1), levels.length - 1);
  exitGate.classList.add("open");
  say("Gate open!");
  renderHud();
  if (broadcast) {
    sendRoom({ type: "complete", level: state.level });
  }
}

function collect(item, broadcast = true) {
  const progress = currentProgress();
  if (progress.collected.has(item.id)) return;

  progress.collected.add(item.id);
  const node = entities.querySelector(`[data-id="${item.id}"]`);
  if (node) {
    node.classList.add("collected");
    window.setTimeout(() => node.remove(), 180);
  }

  say(item.say);
  renderTeam();
  if (progress.collected.size >= currentLevel().items.length) {
    openGate(broadcast);
  } else {
    renderHud();
  }
  if (broadcast) {
    sendRoom({ type: "collect", level: state.level, itemId: item.id });
  }
}

function loadLevel(index, resetLocal = true, broadcast = false) {
  state.level = clamp(index, 0, levels.length - 1);

  if (resetLocal) {
    Object.values(state.players).forEach((player) => {
      const pos = startPosition(player.role, state.level);
      player.x = pos.x;
      player.y = pos.y;
      player.hp = 3;
    });
  }

  renderLevel();
  if (broadcast) {
    sendRoom({ type: "scene", level: state.level });
  }
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
  currentLevel().hazards.forEach((hazard) => {
    const node = entities.querySelector(`[data-id="${hazard.id}"]`);
    if (!node) return;
    const pos = patrolPosition(hazard, time);
    hazard.live = pos;
    node.style.setProperty("--x", pos.x);
    node.style.setProperty("--y", pos.y);
  });
}

function checkCollections() {
  const player = localPlayer();
  if (!player) return;
  currentLevel().items.forEach((item) => {
    if (!currentProgress().collected.has(item.id) && dist(player, item) < 7.4) {
      collect(item);
    }
  });
}

function takeHit(time) {
  const player = localPlayer();
  if (!player || currentProgress().complete || time < state.invincibleUntil) return;

  const hit = currentLevel().hazards.find((hazard) => {
    const target = hazard.live || { x: hazard.x, y: hazard.y };
    return dist(player, target) < (hazard.r || 7);
  });

  if (!hit) return;

  player.hp -= 1;
  state.invincibleUntil = time + 1200;
  dangerTint.classList.add("flash");
  const avatar = playersLayer.querySelector(`.player[data-player-id="${player.id}"]`);
  if (avatar) {
    avatar.classList.add("hit");
    window.setTimeout(() => avatar.classList.remove("hit"), 280);
  }
  window.setTimeout(() => dangerTint.classList.remove("flash"), 170);

  const start = startPosition(player.role);
  player.x = clamp((player.x + start.x) / 2, 5, 95);
  player.y = clamp((player.y + start.y) / 2, 22, 85);
  if (player.hp <= 0) {
    player.hp = 3;
    player.x = start.x;
    player.y = start.y;
    say("Try again");
  } else {
    say("Dodge!");
  }

  renderPlayer(player.id);
  renderHud();
  sendPlayerState(true);
}

function moveLocal(dt, time) {
  const player = localPlayer();
  if (!player || !state.joystick.active) return;

  const length = Math.hypot(state.joystick.x, state.joystick.y);
  if (length < 0.08) return;

  const speed = 0.038 * dt;
  player.x = clamp(player.x + (state.joystick.x / length) * speed, 4, 96);
  player.y = clamp(player.y + (state.joystick.y / length) * speed, 20, 86);
  renderPlayer(player.id);
  checkCollections();

  if (time - state.lastBroadcast > 80) {
    state.lastBroadcast = time;
    sendPlayerState();
  }
}

function checkGate() {
  const player = localPlayer();
  if (!player || !currentProgress().complete) return;
  if (dist(player, currentLevel().exit) < 8) {
    goNext();
  }
}

function frame(time) {
  const dt = state.lastTime ? Math.min(34, time - state.lastTime) : 16;
  state.lastTime = time;
  moveLocal(dt, time);
  updateHazards(time);
  takeHit(time);
  checkGate();
  window.requestAnimationFrame(frame);
}

function goNext() {
  if (!currentProgress().complete) return;
  if (state.level === levels.length - 1) {
    resetGame();
  } else {
    loadLevel(state.level + 1, true, true);
  }
}

function resetGame() {
  if (isConnected()) {
    sendRoom({ type: "reset" });
    return;
  }
  state.unlocked = 0;
  state.progress = createProgress();
  setSoloPlayer();
  loadLevel(0, true, false);
}

function playerName() {
  const name = playerNameInput.value.trim();
  return name || "Hero";
}

function roomCode() {
  const cleaned = roomCodeInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, "") || "heist";
  roomCodeInput.value = cleaned;
  return cleaned;
}

function roomUrl() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const host = location.protocol.startsWith("http") ? location.host : "localhost:8788";
  const params = new URLSearchParams({ room: roomCode(), name: playerName() });
  return `${protocol}//${host}/room?${params.toString()}`;
}

function connectRoom() {
  if (isConnected()) {
    state.socket.close();
    return;
  }

  if (!("WebSocket" in window)) {
    networkStatus.textContent = "No WebSocket";
    return;
  }

  networkStatus.textContent = "Joining...";
  const socket = new WebSocket(roomUrl());
  state.socket = socket;

  socket.addEventListener("message", (event) => {
    try {
      handleRoomMessage(JSON.parse(event.data));
    } catch (error) {
      console.warn("Bad room message", error);
    }
  });

  socket.addEventListener("close", () => {
    state.socket = null;
    if (state.mode === "room") {
      state.mode = "solo";
      connectButton.textContent = "Join";
      networkStatus.textContent = "Solo touch";
      resetGame();
    } else {
      networkStatus.textContent = "Server offline";
    }
  });

  socket.addEventListener("error", () => {
    networkStatus.textContent = "Start server";
  });
}

function handleRoomMessage(message) {
  if (message.type === "welcome") {
    state.mode = "room";
    state.localId = message.playerId;
    connectButton.textContent = "Leave";
    networkStatus.textContent = `${message.roomCode}: ${roles[message.playerId].name}`;
    topStatus.textContent = "Room joined";
    applySnapshot(message.snapshot, true);
    sendPlayerState(true);
    return;
  }

  if (message.type === "snapshot") {
    applySnapshot(message.snapshot, false);
  }
}

function snapshotToProgress(progress) {
  return levels.map((level, index) => {
    const incoming = progress?.[index] || {};
    return {
      collected: new Set(incoming.collected || []),
      complete: Boolean(incoming.complete)
    };
  });
}

function applySnapshot(snapshot, forceLocalPosition) {
  if (!snapshot) return;
  const previousLevel = state.level;
  state.level = clamp(Number(snapshot.level ?? snapshot.sceneIndex ?? state.level), 0, levels.length - 1);
  state.unlocked = clamp(Number(snapshot.unlocked ?? state.unlocked), 0, levels.length - 1);
  state.progress = snapshotToProgress(snapshot.progress);

  const nextPlayers = {};
  (snapshot.players || []).forEach((incoming) => {
    const role = incoming.role || incoming.id;
    if (!roles[role]) return;
    const existing = state.players[incoming.id] || {};
    const keepLocalPosition = incoming.id === state.localId && !forceLocalPosition && previousLevel === state.level;
    nextPlayers[incoming.id] = {
      id: incoming.id,
      role,
      name: incoming.name || roles[role].name,
      x: keepLocalPosition ? existing.x : Number(incoming.x),
      y: keepLocalPosition ? existing.y : Number(incoming.y),
      hp: clamp(Number(incoming.hp ?? existing.hp ?? 3), 0, 3),
      present: true
    };
  });

  if (!nextPlayers[state.localId]) {
    const pos = startPosition(state.localId, state.level);
    nextPlayers[state.localId] = {
      id: state.localId,
      role: state.localId,
      name: playerName(),
      x: pos.x,
      y: pos.y,
      hp: 3,
      present: true
    };
  }

  state.players = nextPlayers;
  renderLevel();
}

function serializeProgress() {
  return state.progress.map((progress) => ({
    collected: Array.from(progress.collected),
    complete: progress.complete
  }));
}

function sendRoom(payload) {
  if (!isConnected()) return;
  state.socket.send(JSON.stringify(payload));
}

function sendPlayerState(force = false) {
  if (!isConnected()) return;
  const player = localPlayer();
  if (!player) return;
  sendRoom({
    type: "player",
    force,
    level: state.level,
    player: {
      id: player.id,
      role: player.role,
      name: player.name,
      x: player.x,
      y: player.y,
      hp: player.hp
    },
    progress: serializeProgress()
  });
}

function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const max = rect.width * 0.34;
  const rawX = event.clientX - centerX;
  const rawY = event.clientY - centerY;
  const length = Math.hypot(rawX, rawY);
  const scale = length > max ? max / length : 1;
  const knobX = rawX * scale;
  const knobY = rawY * scale;

  state.joystick.x = knobX / max;
  state.joystick.y = knobY / max;
  stickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
}

function resetJoystick() {
  state.joystick.active = false;
  state.joystick.pointerId = null;
  state.joystick.x = 0;
  state.joystick.y = 0;
  stickKnob.style.transform = "translate(-50%, -50%)";
  sendPlayerState(true);
}

joystick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  joystick.setPointerCapture(event.pointerId);
  state.joystick.active = true;
  state.joystick.pointerId = event.pointerId;
  updateJoystick(event);
});

joystick.addEventListener("pointermove", (event) => {
  if (!state.joystick.active || event.pointerId !== state.joystick.pointerId) return;
  event.preventDefault();
  updateJoystick(event);
});

joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);

nextButton.addEventListener("click", goNext);
restartButton.addEventListener("click", resetGame);
connectButton.addEventListener("click", connectRoom);
playerNameInput.addEventListener("change", () => {
  const player = localPlayer();
  if (player) {
    player.name = playerName();
    renderTeam();
    renderPlayers();
    sendPlayerState(true);
  }
});

setSoloPlayer();
renderLevel();
window.requestAnimationFrame(frame);
