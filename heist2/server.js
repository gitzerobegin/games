const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.argv[2] || process.env.PORT || 8788);
const ROOT = __dirname;

const playerIds = ["jiang", "liu", "zhang", "ng"];
const itemCounts = [2, 3, 3, 3, 2];
const starts = [
  { x: 12, y: 72 },
  { x: 12, y: 72 },
  { x: 13, y: 74 },
  { x: 10, y: 73 },
  { x: 12, y: 72 }
];
const offsets = [
  { x: 0, y: 0 },
  { x: 5, y: 2 },
  { x: -4, y: -3 },
  { x: 3, y: -6 }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const rooms = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createProgress() {
  return itemCounts.map(() => ({ collected: [], complete: false }));
}

function startPosition(level, slot) {
  const start = starts[level] || starts[0];
  const offset = offsets[slot] || offsets[0];
  return {
    x: clamp(start.x + offset.x, 4, 96),
    y: clamp(start.y + offset.y, 20, 86)
  };
}

function createRoom(code) {
  return {
    code,
    level: 0,
    unlocked: 0,
    progress: createProgress(),
    clients: new Set(),
    slots: [null, null, null, null],
    players: {}
  };
}

function getRoom(code) {
  if (!rooms.has(code)) {
    rooms.set(code, createRoom(code));
  }
  return rooms.get(code);
}

function snapshot(room) {
  return {
    level: room.level,
    unlocked: room.unlocked,
    progress: room.progress,
    players: Object.values(room.players)
  };
}

function sendFrame(socket, message) {
  const payload = Buffer.from(JSON.stringify(message));
  let header;

  if (payload.length < 126) {
    header = Buffer.from([0x81, payload.length]);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }

  socket.write(Buffer.concat([header, payload]));
}

function broadcast(room, message) {
  room.clients.forEach((client) => {
    if (!client.socket.destroyed) {
      sendFrame(client.socket, message);
    }
  });
}

function broadcastSnapshot(room) {
  broadcast(room, { type: "snapshot", snapshot: snapshot(room) });
}

function parseFrames(client, chunk) {
  client.buffer = Buffer.concat([client.buffer, chunk]);
  const messages = [];

  while (client.buffer.length >= 2) {
    const first = client.buffer[0];
    const second = client.buffer[1];
    const opcode = first & 0x0f;
    let offset = 2;
    let length = second & 0x7f;

    if (length === 126) {
      if (client.buffer.length < offset + 2) break;
      length = client.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (length === 127) {
      if (client.buffer.length < offset + 8) break;
      length = Number(client.buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    const masked = Boolean(second & 0x80);
    const maskOffset = masked ? 4 : 0;
    if (client.buffer.length < offset + maskOffset + length) break;

    let payload = client.buffer.subarray(offset + maskOffset, offset + maskOffset + length);
    if (masked) {
      const mask = client.buffer.subarray(offset, offset + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    client.buffer = client.buffer.subarray(offset + maskOffset + length);

    if (opcode === 8) {
      client.socket.end();
      break;
    }
    if (opcode === 9) {
      client.socket.write(Buffer.from([0x8a, 0x00]));
      continue;
    }
    if (opcode === 1) {
      messages.push(payload.toString("utf8"));
    }
  }

  return messages;
}

function markComplete(room, level) {
  const progress = room.progress[level];
  if (!progress) return;
  progress.complete = true;
  room.unlocked = Math.min(Math.max(room.unlocked, level + 1), itemCounts.length - 1);
}

function resetRoom(room) {
  room.level = 0;
  room.unlocked = 0;
  room.progress = createProgress();
  room.clients.forEach((client) => {
    const pos = startPosition(0, client.slot);
    room.players[client.playerId] = {
      id: client.playerId,
      role: client.playerId,
      name: client.name,
      x: pos.x,
      y: pos.y,
      hp: 3
    };
  });
}

function handleMessage(client, raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }

  const room = client.room;
  if (!room) return;

  if (message.type === "player" && message.player) {
    const incoming = message.player;
    const current = room.players[client.playerId] || {};
    room.players[client.playerId] = {
      id: client.playerId,
      role: client.playerId,
      name: String(incoming.name || client.name).slice(0, 16),
      x: clamp(Number(incoming.x) || current.x || 12, 4, 96),
      y: clamp(Number(incoming.y) || current.y || 72, 20, 86),
      hp: clamp(Number(incoming.hp ?? current.hp ?? 3), 0, 3)
    };
    broadcastSnapshot(room);
    return;
  }

  if (message.type === "collect") {
    const level = clamp(Number(message.level), 0, itemCounts.length - 1);
    const itemId = String(message.itemId || "");
    const progress = room.progress[level];
    if (progress && itemId && !progress.collected.includes(itemId)) {
      progress.collected.push(itemId);
      if (progress.collected.length >= itemCounts[level]) {
        markComplete(room, level);
      }
      broadcastSnapshot(room);
    }
    return;
  }

  if (message.type === "complete") {
    const level = clamp(Number(message.level), 0, itemCounts.length - 1);
    markComplete(room, level);
    broadcastSnapshot(room);
    return;
  }

  if (message.type === "scene") {
    const level = clamp(Number(message.level), 0, itemCounts.length - 1);
    if (level <= room.unlocked) {
      room.level = level;
      room.clients.forEach((roomClient) => {
        const pos = startPosition(level, roomClient.slot);
        const player = room.players[roomClient.playerId];
        if (player) {
          player.x = pos.x;
          player.y = pos.y;
          player.hp = 3;
        }
      });
      broadcastSnapshot(room);
    }
    return;
  }

  if (message.type === "reset") {
    resetRoom(room);
    broadcastSnapshot(room);
  }
}

function serveStatic(request, response) {
  const url = new URL(request.url, "http://localhost");
  const requested = decodeURIComponent(url.pathname) === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(ROOT, requested));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(data);
  });
}

const server = http.createServer(serveStatic);

server.on("upgrade", (request, socket) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname !== "/room") {
    socket.destroy();
    return;
  }

  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const roomCode = (url.searchParams.get("room") || "heist").replace(/[^a-zA-Z0-9_-]/g, "") || "heist";
  const room = getRoom(roomCode);
  const slot = room.slots.findIndex((client) => client === null);
  if (slot === -1) {
    socket.write("HTTP/1.1 409 Room Full\r\n\r\n");
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n")
  );

  const playerId = playerIds[slot];
  const name = String(url.searchParams.get("name") || playerId).slice(0, 16);
  const pos = startPosition(room.level, slot);
  const client = { socket, room, slot, playerId, name, buffer: Buffer.alloc(0) };

  room.slots[slot] = client;
  room.clients.add(client);
  room.players[playerId] = {
    id: playerId,
    role: playerId,
    name,
    x: pos.x,
    y: pos.y,
    hp: 3
  };

  sendFrame(socket, {
    type: "welcome",
    roomCode,
    playerId,
    snapshot: snapshot(room)
  });
  broadcastSnapshot(room);

  socket.on("data", (chunk) => {
    parseFrames(client, chunk).forEach((message) => handleMessage(client, message));
  });

  socket.on("close", () => {
    room.clients.delete(client);
    room.slots[slot] = null;
    delete room.players[playerId];
    if (room.clients.size === 0) {
      rooms.delete(roomCode);
    } else {
      broadcastSnapshot(room);
    }
  });

  socket.on("error", () => {
    room.clients.delete(client);
    room.slots[slot] = null;
    delete room.players[playerId];
    if (room.clients.size === 0) {
      rooms.delete(roomCode);
    } else {
      broadcastSnapshot(room);
    }
  });
});

server.listen(PORT, () => {
  console.log(`G2 mobile multiplayer: http://localhost:${PORT}`);
});
