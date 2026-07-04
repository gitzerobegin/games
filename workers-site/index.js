import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

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

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.code = "";
    this.level = 0;
    this.unlocked = 0;
    this.progress = createProgress();
    this.clients = new Set();
    this.slots = [null, null, null, null];
    this.players = {};
  }

  snapshot() {
    return {
      level: this.level,
      unlocked: this.unlocked,
      progress: this.progress,
      players: Object.values(this.players)
    };
  }

  sendMessage(socket, message) {
    socket.send(JSON.stringify(message));
  }

  broadcast(message) {
    this.clients.forEach((client) => {
      if (client.socket.readyState === "OPEN") {
        this.sendMessage(client.socket, message);
      }
    });
  }

  broadcastSnapshot() {
    this.broadcast({ type: "snapshot", snapshot: this.snapshot() });
  }

  markComplete(level) {
    const progress = this.progress[level];
    if (!progress) return;
    progress.complete = true;
    this.unlocked = Math.min(Math.max(this.unlocked, level + 1), itemCounts.length - 1);
  }

  resetRoom() {
    this.level = 0;
    this.unlocked = 0;
    this.progress = createProgress();
    this.clients.forEach((client) => {
      const pos = startPosition(0, client.slot);
      this.players[client.playerId] = {
        id: client.playerId,
        role: client.playerId,
        name: client.name,
        x: pos.x,
        y: pos.y,
        hp: 3
      };
    });
  }

  handleMessage(client, raw) {
    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.type === "player" && message.player) {
      const incoming = message.player;
      const current = this.players[client.playerId] || {};
      this.players[client.playerId] = {
        id: client.playerId,
        role: client.playerId,
        name: String(incoming.name || client.name).slice(0, 16),
        x: clamp(Number(incoming.x) || current.x || 12, 4, 96),
        y: clamp(Number(incoming.y) || current.y || 72, 20, 86),
        hp: clamp(Number(incoming.hp ?? current.hp ?? 3), 0, 3)
      };
      this.broadcastSnapshot();
      return;
    }

    if (message.type === "collect") {
      const level = clamp(Number(message.level), 0, itemCounts.length - 1);
      const itemId = String(message.itemId || "");
      const progress = this.progress[level];
      if (progress && itemId && !progress.collected.includes(itemId)) {
        progress.collected.push(itemId);
        if (progress.collected.length >= itemCounts[level]) {
          this.markComplete(level);
        }
        this.broadcastSnapshot();
      }
      return;
    }

    if (message.type === "complete") {
      const level = clamp(Number(message.level), 0, itemCounts.length - 1);
      this.markComplete(level);
      this.broadcastSnapshot();
      return;
    }

    if (message.type === "scene") {
      const level = clamp(Number(message.level), 0, itemCounts.length - 1);
      if (level <= this.unlocked) {
        this.level = level;
        this.clients.forEach((roomClient) => {
          const pos = startPosition(level, roomClient.slot);
          const player = this.players[roomClient.playerId];
          if (player) {
            player.x = pos.x;
            player.y = pos.y;
            player.hp = 3;
          }
        });
        this.broadcastSnapshot();
      }
      return;
    }

    if (message.type === "reset") {
      this.resetRoom();
      this.broadcastSnapshot();
    }
  }

  closeClient(client) {
    this.clients.delete(client);
    this.slots[client.slot] = null;
    delete this.players[client.playerId];
    if (this.clients.size === 0) {
      this.resetRoom();
    } else {
      this.broadcastSnapshot();
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const roomCode = (url.searchParams.get("room") || "heist").replace(/[^a-zA-Z0-9_-]/g, "") || "heist";
    const name = String(url.searchParams.get("name") || "Hero").slice(0, 16);

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Not found", { status: 404 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.code = roomCode;

    const slot = this.slots.findIndex((existing) => existing === null);
    if (slot === -1) {
      return new Response("Room Full", { status: 409 });
    }

    const playerId = playerIds[slot];
    const pos = startPosition(this.level, slot);
    const state = {
      socket: server,
      slot,
      playerId,
      name
    };

    this.slots[slot] = state;
    this.clients.add(state);
    this.players[playerId] = {
      id: playerId,
      role: playerId,
      name,
      x: pos.x,
      y: pos.y,
      hp: 3
    };

    this.ctx.acceptWebSocket(server);
    server.addEventListener("message", (event) => {
      const payload = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
      this.handleMessage(state, payload);
    });
    server.addEventListener("close", () => this.closeClient(state));
    server.addEventListener("error", () => this.closeClient(state));

    this.sendMessage(server, {
      type: "welcome",
      roomCode,
      playerId,
      snapshot: this.snapshot()
    });
    this.broadcastSnapshot();

    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") === "websocket" && url.pathname === "/room") {
      const roomCode = (url.searchParams.get("room") || "heist").replace(/[^a-zA-Z0-9_-]/g, "") || "heist";
      const id = env.ROOMS.idFromName(roomCode);
      const stub = env.ROOMS.get(id);
      return stub.fetch(request);
    }

    const event = {
      request,
      env,
      waitUntil: ctx.waitUntil.bind(ctx)
    };

    try {
      return await getAssetFromKV(event);
    } catch (error) {
      return new Response("Not found", { status: 404 });
    }
  }
};
