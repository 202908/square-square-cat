import http from "node:http";
import crypto from "node:crypto";
import { EventEmitter } from "node:events";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_COIN_CODES,
  HOST_CODE,
  HOST_PASSWORD,
  SHOP_ITEMS,
  addFriend,
  applyHousePaint,
  buyItem,
  canFly,
  challengeLevelForAccounts,
  completeChallenge,
  createAccount,
  equipItem,
  isValidNewAccountCode,
  makeGuestAccount,
  redeemCode,
  sendCoinGift
} from "./src/gameRules.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const accountsFile = path.join(dataDir, "accounts.json");
const codesFile = path.join(dataDir, "coinCodes.json");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.RENDER ? "0.0.0.0" : "127.0.0.1";
const TICK_RATE = 30;
const CHALLENGE_PLATFORMS = [
  { x: -52, y: 1.2, z: 36, w: 12, d: 8 },
  { x: -42, y: 4.2, z: 30, w: 9, d: 7 },
  { x: -32, y: 7.4, z: 36, w: 8, d: 7 },
  { x: -22, y: 10.6, z: 28, w: 8, d: 7 },
  { x: -12, y: 13.8, z: 34, w: 8, d: 7 },
  { x: -2, y: 17, z: 27, w: 9, d: 7 }
];
const CHALLENGE_START = { x: -220, y: 1.2, z: 0 };
const SOLID_FLOORS = [
  { x: -28, y: 5.5, z: -20, w: 7, d: 6 },
  ...Array.from({ length: 5 }, (_, i) => ({ x: -33.2, y: 0.98 + i * 0.8, z: -21.8 + i * 0.12, w: 3.2, d: 0.7 })),
  { x: 8, y: 8.4, z: 22, w: 12, d: 12 },
  { x: 28, y: 8.4, z: -12, w: 12, d: 12 }
];
const SOLID_BLOCKS = [
  { x: 8, z: 22, w: 12, d: 12 },
  { x: 28, z: -12, w: 12, d: 12 },
  { x: -28, z: -20, w: 7, d: 6 }
];
const SWING = { x: 12, y: 2.2, z: -28, angle: 0, velocity: 0, riders: [] };

const sessions = new Map();
const sockets = new Map();
const teams = new Map();
let accounts = {};
let coinCodes = structuredClone(DEFAULT_COIN_CODES);
let chatLog = [];
let worldCoins = makeWorldCoins(80);

await loadData();

const server = http.createServer(serveStaticFile);

server.on("upgrade", (request, socket) => {
  const client = acceptWebSocket(request, socket);
  if (client) handleConnection(client);
});

function handleConnection(socket) {
  const sessionId = makeId();
  sockets.set(socket, sessionId);
  send(socket, "hello", { sessionId });

  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw);
      handleMessage(socket, message);
    } catch {
      send(socket, "notice", { message: "訊息格式錯誤。" });
    }
  });

  socket.on("close", () => {
    const id = sockets.get(socket);
    sockets.delete(socket);
    if (id && sessions.has(id)) {
      detachFromStack(sessions.get(id).player);
      sessions.delete(id);
      broadcast("notice", { message: "一隻方塊貓離開了星球。" });
    }
  });
}

setInterval(tickWorld, 1000 / TICK_RATE);

server.on("error", (error) => {
  console.error("Server error:", error.message);
});

server.listen(PORT, HOST, () => {
  console.log(`Square Square Cat is running on ${HOST}:${PORT}`);
});

async function loadData() {
  await mkdir(dataDir, { recursive: true });
  let changedAccounts = false;
  if (existsSync(accountsFile)) {
    accounts = JSON.parse(await readFile(accountsFile, "utf8"));
    for (const account of Object.values(accounts)) {
      account.isHost = Boolean(HOST_CODE && account.code === HOST_CODE);
      if (account.isHost) account.coins = 999999999;
      if (account.isHost) account.level = null;
      account.equipped ||= { hat: null, clothes: null, tail: null, trail: null };
      account.equipped.trail ??= null;
      account.equipped.pet ??= null;
      account.house ??= null;
      account.roomItems ??= [];
      account.giftInbox ??= [];
      if (!account.catVariant) {
        account.catVariant = account.isHost ? "host" : createAccount(account.code).catVariant;
        changedAccounts = true;
      }
      if (account.isHost && account.catVariant !== "host") {
        account.catVariant = "host";
        changedAccounts = true;
      }
    }
  }
  if (existsSync(codesFile)) {
    coinCodes = { ...coinCodes, ...JSON.parse(await readFile(codesFile, "utf8")) };
  }
  if (HOST_CODE && !accounts[HOST_CODE]) {
    accounts[HOST_CODE] = createAccount(HOST_CODE);
    await saveAccounts();
  } else if (changedAccounts) {
    await saveAccounts();
  }
}

async function saveAccounts() {
  await writeFile(accountsFile, JSON.stringify(accounts, null, 2));
}

async function saveCodes() {
  await writeFile(codesFile, JSON.stringify(coinCodes, null, 2));
}

function serveStaticFile(request, response) {
  const requested = request.url === "/" ? "/index.html" : decodeURIComponent(request.url.split("?")[0]);
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentType(filePath),
    "Cache-Control": "no-store"
  });
  createReadStream(filePath)
    .on("error", () => {
      if (!response.headersSent) response.writeHead(500);
      response.end("File read error");
    })
    .pipe(response);
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  }[ext] || "application/octet-stream";
}

function handleMessage(socket, message) {
  const sessionId = sockets.get(socket);
  const session = sessions.get(sessionId);

  if (message.type === "createAccount") return createNewAccount(socket, message.code);
  if (message.type === "login") return loginAccount(socket, message.code, message.hostPassword);
  if (message.type === "guest") return enterWorld(socket, makeGuestAccount(), false);

  if (!session) {
    send(socket, "notice", { message: "請先登入。" });
    return;
  }

  switch (message.type) {
    case "input":
      if (session.player.flightLeader && message.input?.jump) {
        stopFollowingFlight(session);
        send(socket, "notice", { message: "你離開一起飛行了。" });
      }
      session.input = sanitizeInput(message.input, canFly(session.account));
      break;
    case "chat":
      addChat(session.account.code, message.text);
      break;
    case "stack":
      handleStack(session);
      break;
    case "attack":
      handleAttack(session);
      break;
    case "redeem":
      handleRedeem(socket, session, message.code);
      break;
    case "buy":
      updateAccount(socket, session, buyItem(session.account, message.itemId));
      break;
    case "equip":
      updateAccount(socket, session, equipItem(session.account, message.itemId));
      break;
    case "placeHouse":
      handlePlaceHouse(socket, session);
      break;
    case "enterHouse":
      handleEnterHouse(socket, session);
      break;
    case "leaveHouse":
      handleLeaveHouse(socket, session);
      break;
    case "placeFurniture":
      handlePlaceFurniture(socket, session, message.itemId);
      break;
    case "useHousePaint":
      updateAccount(socket, session, applyHousePaint(session.account, message.itemId));
      break;
    case "clearHouse":
      handleClearHouse(socket, session);
      break;
    case "sendGift":
      handleSendGift(socket, session, message.friendCode, message.itemId);
      break;
    case "sendCoinGift":
      handleSendCoinGift(socket, session, message.friendCode, message.coins);
      break;
    case "acceptGift":
      handleAcceptGift(socket, session, message.giftId);
      break;
    case "returnGift":
      handleReturnGift(socket, session, message.giftId);
      break;
    case "teamInvite":
      handleTeamInvite(socket, session, message.friendCode);
      break;
    case "leaveTeam":
      handleLeaveTeam(socket, session);
      break;
    case "enterChallenge":
      handleEnterChallenge(socket, session);
      break;
    case "leaveChallenge":
      handleLeaveChallenge(socket, session);
      break;
    case "swingMount":
      handleSwingMount(socket, session);
      break;
    case "swingDismount":
      handleSwingDismount(socket, session);
      break;
    case "swingPump":
      handleSwingPump(session);
      break;
    case "flightInvite":
      handleFlightInvite(socket, session);
      break;
    case "acceptFlightInvite":
      handleAcceptFlightInvite(socket, session, message.leaderId);
      break;
    case "addFriend":
      handleAddFriend(socket, session, message.friendCode);
      break;
    case "adminUpsertCode":
      handleAdminUpsertCode(socket, session, message);
      break;
    case "adminToggleCode":
      handleAdminToggleCode(socket, session, message.code);
      break;
    default:
      send(socket, "notice", { message: "未知指令。" });
  }
}

function createNewAccount(socket, rawCode) {
  const code = String(rawCode || "").trim();
  if (code !== HOST_CODE && !isValidNewAccountCode(code)) {
    send(socket, "authError", { message: "帳號只能是 1 到 10 個英文字或數字。" });
    return;
  }
  if (accounts[code]) {
    send(socket, "authError", { message: "這個帳號已存在，請改一串亂碼。" });
    return;
  }
  accounts[code] = createAccount(code);
  saveAccounts();
  enterWorld(socket, accounts[code], true, { announceNewAccount: true });
}

function loginAccount(socket, rawCode, hostPassword) {
  const code = String(rawCode || "").trim();
  if (!accounts[code]) {
    send(socket, "authError", {
      message: "沒有這個帳號。",
      missingAccount: true
    });
    return;
  }
  if (HOST_CODE && code === HOST_CODE) {
    if (!HOST_PASSWORD) {
      send(socket, "authError", { message: "主機密碼尚未設定，請先在本機設定。" });
      return;
    }
    if (hostPassword !== HOST_PASSWORD) {
      send(socket, "authError", {
        message: "請輸入主機密碼。",
        hostPasswordRequired: true,
        accountCode: code
      });
      return;
    }
  }
  enterWorld(socket, accounts[code], true);
}

function enterWorld(socket, account, persistent, options = {}) {
  const sessionId = sockets.get(socket);
  const spawn = randomSpawn();
  sessions.set(sessionId, {
    id: sessionId,
    socket,
    account: structuredClone(account),
    persistent,
    input: { x: 0, z: 0, y: 0, jump: false },
    player: {
      id: sessionId,
      accountCode: account.code,
      x: spawn.x,
      y: 2,
      z: spawn.z,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0,
      onGround: false,
      carrying: null,
      carriedBy: null,
      attackUntil: 0,
      location: "island",
      roomOwner: null,
      ride: null,
      teamId: null,
      flightLeader: null,
      challengeLevel: 1
    }
  });

  send(socket, "authed", {
    id: sessionId,
    account,
    shopItems: SHOP_ITEMS,
    coinCodes: account.isHost ? coinCodes : undefined,
    chatLog
  });
  if (options.announceNewAccount) {
    broadcast("notice", { message: `${displayNameFor(account)} 第一次進入貓眼星雲。` });
  }
}

function sanitizeInput(input = {}, hasWings) {
  return {
    x: clamp(Number(input.x || 0), -1, 1),
    z: clamp(Number(input.z || 0), -1, 1),
    y: hasWings ? clamp(Number(input.y || 0), -1, 1) : 0,
    jump: Boolean(input.jump)
  };
}

function tickWorld() {
  updateSwing(1 / TICK_RATE);
  for (const session of sessions.values()) {
    updatePlayer(session, 1 / TICK_RATE);
  }
  broadcast("state", {
    coins: worldCoins,
    swing: SWING,
    houses: Object.values(accounts).filter((account) => account.house).map((account) => ({
      owner: account.code,
      ...account.house
    })),
    players: [...sessions.values()].map((session) => ({
      ...session.player,
      accountCode: session.account.code,
      displayName: displayNameFor(session.account),
      isHost: session.account.isHost,
      catVariant: session.account.catVariant,
      equipped: session.account.equipped,
      roomItems: session.player.location === "room" ? session.account.roomItems : [],
      teamId: session.player.teamId,
      challengeLevel: session.player.challengeLevel,
      coins: session.account.coins
    }))
  });
}

function displayNameFor(account) {
  return account.code;
}

function updatePlayer(session, dt) {
  const player = session.player;
  if (player.flightLeader) {
    updateFlightFollower(session);
    return;
  }
  if (player.ride === "swing") {
    updateSwingRider(session);
    return;
  }
  if (player.location === "room") {
    updateRoomPlayer(session, dt);
    return;
  }
  if (player.location === "challenge") {
    updateChallengePlayer(session, dt);
    return;
  }
  const carrier = player.carriedBy ? sessions.get(player.carriedBy)?.player : null;
  if (carrier) {
    player.x = carrier.x;
    player.y = carrier.y + 1.45;
    player.z = carrier.z;
    player.vx = 0;
    player.vy = 0;
    player.vz = 0;
    return;
  }

  const speed = canFly(session.account) ? 8 : 6;
  player.vx = session.input.x * speed;
  player.vz = session.input.z * speed;
  if (Math.abs(player.vx) + Math.abs(player.vz) > 0.1) {
    player.yaw = Math.atan2(player.vx, player.vz);
  }

  if (canFly(session.account)) {
    player.vy = session.input.y * 5;
  } else {
    player.vy -= 18 * dt;
    if (session.input.jump && player.onGround) {
      player.vy = 9;
      player.onGround = false;
    }
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.z += player.vz * dt;
  resolveSolidBlocks(player);

  const floorY = floorHeightAt(player.x, player.y, player.z);
  if (player.y <= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.onGround = true;
  }

  const limit = 120;
  player.x = clamp(player.x, -limit, limit);
  player.z = clamp(player.z, -limit, limit);
  player.y = clamp(player.y, floorY, 60);
  collectNearbyCoins(session);
}

function updateChallengePlayer(session, dt) {
  const player = session.player;
  const speed = 6.5;
  player.vx = session.input.x * speed;
  player.vz = session.input.z * speed;
  if (Math.abs(player.vx) + Math.abs(player.vz) > 0.1) {
    player.yaw = Math.atan2(player.vx, player.vz);
  }
  player.vy -= 18 * dt;
  if (session.input.jump && player.onGround) {
    player.vy = 9;
    player.onGround = false;
  }
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.z += player.vz * dt;
  const floorY = challengeFloorHeightAt(player.x, player.y, player.z, player.challengeLevel);
  if (player.y < -12) {
    player.x = CHALLENGE_START.x;
    player.y = 3;
    player.z = CHALLENGE_START.z;
    player.vy = 0;
  } else if (player.y <= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.onGround = true;
  }
  if (isAtChallengeFinish(player)) {
    completeChallengeForTeam(session);
    return;
  }
  player.x = clamp(player.x, -236, -144);
  player.z = clamp(player.z, -28, 28);
}

function updateRoomPlayer(session, dt) {
  const player = session.player;
  const speed = canFly(session.account) ? 8 : 6;
  player.vx = session.input.x * speed;
  player.vz = session.input.z * speed;
  if (Math.abs(player.vx) + Math.abs(player.vz) > 0.1) {
    player.yaw = Math.atan2(player.vx, player.vz);
  }
  player.vy -= 18 * dt;
  if (session.input.jump && player.onGround) {
    player.vy = 8;
    player.onGround = false;
  }
  player.x = clamp(player.x + player.vx * dt, 188, 252);
  player.z = clamp(player.z + player.vz * dt, -32, 32);
  player.y += player.vy * dt;
  if (player.y <= 1) {
    player.y = 1;
    player.vy = 0;
    player.onGround = true;
  }
}

function handleStack(session) {
  const player = session.player;
  if (player.carriedBy) {
    detachFromCarrier(player);
    player.y += 1.5;
    return;
  }
  if (player.carrying) return;

  const target = findPlayerInFront(session, 4);
  if (!target || target.player.carriedBy) return;
  player.carrying = target.id;
  target.player.carriedBy = session.id;
  broadcast("notice", { message: `${displayNameFor(session.account)} 把 ${displayNameFor(target.account)} 疊到背上。` });
}

function detachFromCarrier(player) {
  const carrier = player.carriedBy ? sessions.get(player.carriedBy)?.player : null;
  if (carrier?.carrying === player.id) carrier.carrying = null;
  player.carriedBy = null;
}

function detachFromStack(player) {
  detachFromCarrier(player);
  const carried = player.carrying ? sessions.get(player.carrying)?.player : null;
  if (carried?.carriedBy === player.id) {
    carried.carriedBy = null;
    carried.y += 1.5;
  }
  player.carrying = null;
}

function handleAttack(session) {
  const target = findPlayerInFront(session, 4);
  if (!target) return;
  session.player.attackUntil = Date.now() + 450;
  broadcast("notice", { message: `${displayNameFor(session.account)} 咬了 ${displayNameFor(target.account)} 一下。` });
}

function handleSwingMount(socket, session) {
  if (session.player.location !== "island") return;
  const distance = Math.hypot(session.player.x - SWING.x, session.player.z - SWING.z);
  if (distance > 7) {
    send(socket, "notice", { message: "請靠近鞦韆再上去。" });
    return;
  }
  if (!SWING.riders.includes(session.id)) SWING.riders.push(session.id);
  session.player.ride = "swing";
  updateSwingRider(session);
}

function handleSwingDismount(socket, session) {
  if (session.player.ride !== "swing") return;
  SWING.riders = SWING.riders.filter((id) => id !== session.id);
  session.player.ride = null;
  session.player.x = SWING.x + 4;
  session.player.y = islandHeight(session.player.x, SWING.z) + 1;
  session.player.z = SWING.z + 4;
  send(socket, "notice", { message: "你下了鞦韆。" });
}

function handleSwingPump(session) {
  if (session.player.ride !== "swing") return;
  const direction = SWING.angle >= 0 ? 1 : -1;
  SWING.velocity += 0.055 * direction;
}

function updateSwing(dt) {
  SWING.velocity += -Math.sin(SWING.angle) * 2.3 * dt;
  SWING.velocity *= 0.992;
  SWING.angle += SWING.velocity * dt;
  SWING.angle = clamp(SWING.angle, -Math.PI * 1.25, Math.PI * 1.25);
}

function updateSwingRider(session) {
  const index = Math.max(0, SWING.riders.indexOf(session.id));
  const offsetZ = (index - (SWING.riders.length - 1) / 2) * 0.9;
  const radius = 4.8;
  session.player.x = SWING.x + Math.sin(SWING.angle) * radius;
  session.player.y = SWING.y + Math.cos(SWING.angle) * -radius + 4.8;
  session.player.z = SWING.z + offsetZ;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
  session.player.yaw = Math.PI;
}

function updateFlightFollower(session) {
  const leaderSession = sessions.get(session.player.flightLeader);
  if (!leaderSession || !canFly(leaderSession.account) || leaderSession.player.location !== session.player.location) {
    stopFollowingFlight(session);
    return;
  }
  const followers = [...sessions.values()]
    .filter((candidate) => candidate.player.flightLeader === leaderSession.id)
    .sort((a, b) => a.id.localeCompare(b.id));
  const index = Math.max(0, followers.findIndex((candidate) => candidate.id === session.id));
  const side = index % 2 === 0 ? -1 : 1;
  const row = Math.floor(index / 2);
  const distance = 2.4 + row * 1.2;
  const angle = leaderSession.player.yaw + side * Math.PI / 2;
  session.player.x = leaderSession.player.x + Math.sin(angle) * distance;
  session.player.y = leaderSession.player.y + 0.4 + row * 0.3;
  session.player.z = leaderSession.player.z + Math.cos(angle) * distance;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
  session.player.yaw = leaderSession.player.yaw;
  session.player.onGround = false;
}

function stopFollowingFlight(session) {
  session.player.flightLeader = null;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
}

function handleFlightInvite(socket, session) {
  if (!canFly(session.account)) {
    send(socket, "notice", { message: "你要先裝備翅膀才能邀請大家一起飛。" });
    return;
  }
  const invited = [...sessions.values()].filter((candidate) => {
    if (candidate.id === session.id) return false;
    if (candidate.player.location !== session.player.location) return false;
    return Math.hypot(candidate.player.x - session.player.x, candidate.player.z - session.player.z) <= 28;
  });
  if (!invited.length) {
    send(socket, "notice", { message: "附近沒有可以邀請的玩家。" });
    return;
  }
  for (const candidate of invited) {
    send(candidate.socket, "flightInvite", {
      leaderId: session.id,
      leaderName: displayNameFor(session.account)
    });
  }
  send(socket, "notice", { message: "已邀請附近玩家一起飛。" });
}

function handleAcceptFlightInvite(socket, session, leaderId) {
  const leaderSession = sessions.get(String(leaderId || ""));
  if (!leaderSession || leaderSession.id === session.id) {
    send(socket, "notice", { message: "這個飛行邀請已經失效。" });
    return;
  }
  if (!canFly(leaderSession.account)) {
    send(socket, "notice", { message: "邀請者現在沒有裝備翅膀。" });
    return;
  }
  if (leaderSession.player.location !== session.player.location) {
    send(socket, "notice", { message: "你們不在同一個地方，不能一起飛。" });
    return;
  }
  if (Math.hypot(leaderSession.player.x - session.player.x, leaderSession.player.z - session.player.z) > 36) {
    send(socket, "notice", { message: "你離邀請者太遠了。" });
    return;
  }
  detachFromStack(session.player);
  session.player.flightLeader = leaderSession.id;
  session.player.ride = null;
  updateFlightFollower(session);
  send(socket, "notice", { message: `你正在跟著 ${displayNameFor(leaderSession.account)} 一起飛，按跳可以離開。` });
}

function findPlayerInFront(session, range) {
  const player = session.player;
  const forwardX = Math.sin(player.yaw);
  const forwardZ = Math.cos(player.yaw);
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of sessions.values()) {
    if (candidate.id === session.id) continue;
    const dx = candidate.player.x - player.x;
    const dz = candidate.player.z - player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > range || distance < 0.01) continue;
    const dot = (dx / distance) * forwardX + (dz / distance) * forwardZ;
    if (dot > 0.4 && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function handleRedeem(socket, session, code) {
  const result = redeemCode(session.account, coinCodes, code);
  updateAccount(socket, session, result);
}

function handleAddFriend(socket, session, friendCode) {
  if (!accounts[String(friendCode || "").trim()]) {
    send(socket, "notice", { message: "找不到這個好友帳號。" });
    return;
  }
  updateAccount(socket, session, addFriend(session.account, friendCode));
}

function handleSendGift(socket, session, friendCode, itemId) {
  const code = String(friendCode || "").trim();
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  const recipient = accounts[code];
  if (!item) {
    send(socket, "notice", { message: "找不到這個商品。" });
    return;
  }
  if (!recipient || !session.account.friends.includes(code)) {
    send(socket, "notice", { message: "只能送給你的好友。" });
    return;
  }
  if (!session.account.isHost && session.account.coins < item.price) {
    send(socket, "notice", { message: "金幣不夠，不能送這個禮物。" });
    return;
  }
  if (!session.account.isHost) session.account.coins -= item.price;
  recipient.giftInbox ||= [];
  recipient.giftInbox.push({
    id: makeId(),
    from: session.account.code,
    itemId,
    sentAt: Date.now()
  });
  persistSessionAccount(session);
  accounts[code] = recipient;
  saveAccounts();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: `已送出 ${item.name}。` });
  const onlineRecipient = [...sessions.values()].find((candidate) => candidate.account.code === code);
  if (onlineRecipient) {
    onlineRecipient.account = structuredClone(recipient);
    send(onlineRecipient.socket, "account", {
      account: onlineRecipient.account,
      shopItems: SHOP_ITEMS,
      coinCodes: onlineRecipient.account.isHost ? coinCodes : undefined
    });
    send(onlineRecipient.socket, "notice", { message: `${displayNameFor(session.account)} 送了你一個禮物。` });
  }
}

function handleSendCoinGift(socket, session, friendCode, coins) {
  const code = String(friendCode || "").trim();
  const recipient = accounts[code];
  if (!recipient) {
    send(socket, "notice", { message: "只能送給你的好友。" });
    return;
  }

  const result = sendCoinGift(session.account, recipient, coins, { id: makeId(), sentAt: Date.now() });
  if (!result.ok) {
    send(socket, "notice", { message: result.message });
    return;
  }

  session.account = result.sender;
  accounts[session.account.code] = structuredClone(session.account);
  accounts[code] = result.recipient;
  saveAccounts();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: result.message });

  const onlineRecipient = [...sessions.values()].find((candidate) => candidate.account.code === code);
  if (onlineRecipient) {
    onlineRecipient.account = structuredClone(result.recipient);
    send(onlineRecipient.socket, "account", {
      account: onlineRecipient.account,
      shopItems: SHOP_ITEMS,
      coinCodes: onlineRecipient.account.isHost ? coinCodes : undefined
    });
    send(onlineRecipient.socket, "notice", { message: `${displayNameFor(session.account)} 送了你金幣。` });
  }
}

function handleAcceptGift(socket, session, giftId) {
  const gift = (session.account.giftInbox || []).find((candidate) => candidate.id === giftId);
  if (!gift) {
    send(socket, "notice", { message: "找不到這個禮物。" });
    return;
  }
  if (gift.kind === "coins") {
    if (!session.account.isHost) session.account.coins += Math.max(0, Math.floor(Number(gift.coins || 0)));
    session.account.giftInbox = session.account.giftInbox.filter((candidate) => candidate.id !== giftId);
    persistSessionAccount(session);
    send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
    send(socket, "notice", { message: `已收下 ${gift.coins} 金幣。` });
    return;
  }
  const item = SHOP_ITEMS.find((candidate) => candidate.id === gift.itemId);
  session.account.inventory.push(gift.itemId);
  session.account.giftInbox = session.account.giftInbox.filter((candidate) => candidate.id !== giftId);
  persistSessionAccount(session);
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: `已收下 ${item?.name || "禮物"}。` });
}

function handleReturnGift(socket, session, giftId) {
  const gift = (session.account.giftInbox || []).find((candidate) => candidate.id === giftId);
  if (!gift) {
    send(socket, "notice", { message: "找不到這個禮物。" });
    return;
  }
  const sender = accounts[gift.from];
  if (sender && gift.kind === "coins") {
    if (!sender.isHost) sender.coins += Math.max(0, Math.floor(Number(gift.coins || 0)));
    accounts[gift.from] = sender;
  } else if (sender) {
    sender.inventory.push(gift.itemId);
    accounts[gift.from] = sender;
  }
  session.account.giftInbox = session.account.giftInbox.filter((candidate) => candidate.id !== giftId);
  persistSessionAccount(session);
  saveAccounts();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: "已退回禮物。" });
  const onlineSender = [...sessions.values()].find((candidate) => candidate.account.code === gift.from);
  if (onlineSender && sender) {
    onlineSender.account = structuredClone(sender);
    send(onlineSender.socket, "account", {
      account: onlineSender.account,
      shopItems: SHOP_ITEMS,
      coinCodes: onlineSender.account.isHost ? coinCodes : undefined
    });
  }
}

function handleTeamInvite(socket, session, friendCode) {
  const code = String(friendCode || "").trim();
  if (!session.account.friends.includes(code)) {
    send(socket, "notice", { message: "要先加好友才能組隊。" });
    return;
  }
  const friend = [...sessions.values()].find((candidate) => candidate.account.code === code);
  if (!friend) {
    send(socket, "notice", { message: "好友目前不在線上。" });
    return;
  }
  const teamId = session.player.teamId || friend.player.teamId || makeId();
  teams.set(teamId, new Set([...(teams.get(teamId) || []), session.id, friend.id]));
  session.player.teamId = teamId;
  friend.player.teamId = teamId;
  send(socket, "notice", { message: `已和 ${code} 組隊。` });
  send(friend.socket, "notice", { message: `${session.account.code} 和你組隊了。` });
}

function handleLeaveTeam(socket, session) {
  if (!session.player.teamId) return;
  const team = teams.get(session.player.teamId);
  if (team) {
    team.delete(session.id);
    if (team.size === 0) teams.delete(session.player.teamId);
  }
  session.player.teamId = null;
  send(socket, "notice", { message: "你離開隊伍了。" });
}

function handleEnterChallenge(socket, session) {
  const members = getTeamSessions(session);
  const challengeLevel = challengeLevelForAccounts(members.map((member) => member.account));
  members.forEach((member, index) => {
    if (member.player.ride === "swing") {
      SWING.riders = SWING.riders.filter((id) => id !== member.id);
      member.player.ride = null;
    }
    stopFollowingFlight(member);
    detachFromStack(member.player);
    member.player.location = "challenge";
    member.player.challengeLevel = challengeLevel;
    member.player.x = CHALLENGE_START.x + index * 2.2;
    member.player.y = 3;
    member.player.z = CHALLENGE_START.z + index * 1.8;
    member.player.vx = 0;
    member.player.vy = 0;
    member.player.vz = 0;
    send(member.socket, "notice", { message: `進入 Lv. ${challengeLevel} 上跳闖關。` });
  });
}

function handleLeaveChallenge(socket, session) {
  if (session.player.location !== "challenge") return;
  session.player.location = "island";
  session.player.x = -54;
  session.player.y = 3;
  session.player.z = 28;
  send(socket, "notice", { message: "離開闖關，回到島上。" });
}

function getTeamSessions(session) {
  if (!session.player.teamId || !teams.has(session.player.teamId)) return [session];
  return [...teams.get(session.player.teamId)]
    .map((id) => sessions.get(id))
    .filter(Boolean);
}

function getChallengePlatforms(level = 1) {
  const difficulty = Math.max(1, Number(level || 1));
  const stepX = 8 + Math.min(4.5, difficulty * 0.35);
  const stepY = 1.8 + Math.min(2.4, difficulty * 0.16);
  const zSpread = 3 + Math.min(10, difficulty * 0.65);
  const width = Math.max(6.5, 13 - difficulty * 0.35);
  const depth = Math.max(5.5, 9 - difficulty * 0.24);
  return Array.from({ length: 7 }, (_, index) => ({
    x: CHALLENGE_START.x + index * stepX,
    y: CHALLENGE_START.y + index * stepY,
    z: index === 0 ? 0 : (index % 2 === 0 ? 1 : -1) * Math.min(zSpread, 2 + index * 1.2),
    w: index === 0 ? 17 : width,
    d: index === 0 ? 10 : depth
  }));
}

function challengeFinishForLevel(level) {
  const platforms = getChallengePlatforms(level);
  const last = platforms.at(-1);
  return { x: last.x + 4, y: last.y + 2.2, z: last.z, w: 8, d: 8 };
}

function isAtChallengeFinish(player) {
  const finish = challengeFinishForLevel(player.challengeLevel);
  return Math.abs(player.x - finish.x) <= finish.w / 2
    && Math.abs(player.z - finish.z) <= finish.d / 2
    && player.y >= finish.y;
}

function completeChallengeForTeam(session) {
  const members = getTeamSessions(session).filter((member) => member.player.location === "challenge");
  for (const member of members) {
    const result = completeChallenge(member.account);
    member.account = result.account;
    persistSessionAccount(member);
    member.player.location = "island";
    member.player.x = -54 + Math.random() * 5;
    member.player.y = 3;
    member.player.z = 28 + Math.random() * 5;
    member.player.vx = 0;
    member.player.vy = 0;
    member.player.vz = 0;
    send(member.socket, "account", {
      account: member.account,
      shopItems: SHOP_ITEMS,
      coinCodes: member.account.isHost ? coinCodes : undefined
    });
    send(member.socket, "notice", { message: result.message });
  }
}

function handlePlaceHouse(socket, session) {
  if (!session.account.inventory.includes("cat-house")) {
    send(socket, "notice", { message: "你還沒有買房子。" });
    return;
  }
  const player = session.player;
  const distance = 7;
  const x = clamp(player.x + Math.sin(player.yaw) * distance, -88, 88);
  const z = clamp(player.z + Math.cos(player.yaw) * distance, -88, 88);
  session.account.house = { x, y: islandHeight(x, z), z, yaw: player.yaw, paint: session.account.house?.paint || {} };
  persistSessionAccount(session);
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  broadcast("notice", { message: `${displayNameFor(session.account)} 在島上蓋了一棟小貓房子。` });
}

function handleEnterHouse(socket, session) {
  if (!session.account.house) {
    send(socket, "notice", { message: "你還沒有房子。" });
    return;
  }
  const house = session.account.house;
  const distance = Math.hypot(session.player.x - house.x, session.player.z - house.z);
  if (distance > 6) {
    send(socket, "notice", { message: "請靠近自己的房子門口再進入。" });
    return;
  }
  session.player.location = "room";
  session.player.roomOwner = session.account.code;
  session.player.x = 220;
  session.player.y = 1;
  session.player.z = 18;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
  send(socket, "notice", { message: "你進入了自己的房間。" });
}

function handleLeaveHouse(socket, session) {
  if (session.player.location !== "room") return;
  const house = session.account.house || { x: 0, y: 0, z: 0 };
  session.player.location = "island";
  session.player.roomOwner = null;
  session.player.x = house.x + 3;
  session.player.y = house.y + 1;
  session.player.z = house.z + 3;
  send(socket, "notice", { message: "你回到島上。" });
}

function handlePlaceFurniture(socket, session, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || item.type !== "furniture" || !session.account.inventory.includes(itemId)) {
    send(socket, "notice", { message: "你沒有這個家具。" });
    return;
  }
  if (session.player.location !== "room") {
    send(socket, "notice", { message: "要進房間裡才能擺家具。" });
    return;
  }
  session.account.roomItems.push({
    id: makeId(),
    itemId,
    x: clamp(session.player.x + Math.sin(session.player.yaw) * 3, 194, 246),
    y: 1,
    z: clamp(session.player.z + Math.cos(session.player.yaw) * 3, -24, 24)
  });
  session.account.inventory.splice(session.account.inventory.indexOf(itemId), 1);
  persistSessionAccount(session);
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: "家具已擺到房間裡。" });
}

function handleClearHouse(socket, session) {
  if (session.player.location !== "room") {
    send(socket, "notice", { message: "要進房間裡才能清空房子。" });
    return;
  }
  const count = session.account.roomItems.length;
  for (const item of session.account.roomItems) {
    session.account.inventory.push(item.itemId);
  }
  session.account.roomItems = [];
  persistSessionAccount(session);
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
  send(socket, "notice", { message: count ? `已清空房子，${count} 個家具回到背包。` : "房子裡沒有家具。" });
}

function updateAccount(socket, session, result) {
  send(socket, "notice", { message: result.message });
  if (!result.ok) return;
  session.account = result.account;
  persistSessionAccount(session);
  send(socket, "account", {
    account: session.account,
    shopItems: SHOP_ITEMS,
    coinCodes: session.account.isHost ? coinCodes : undefined
  });
}

function persistSessionAccount(session) {
  if (session.persistent) {
    accounts[session.account.code] = session.account;
    saveAccounts();
  }
}

function handleAdminUpsertCode(socket, session, message) {
  if (!session.account.isHost) {
    send(socket, "notice", { message: "只有主機帳號可以新增代碼。" });
    return;
  }
  const code = String(message.code || "").trim();
  const coins = Number(message.coins || 0);
  const rewardType = message.rewardType === "item" ? "item" : "coins";
  const itemId = String(message.itemId || "").trim();
  if (!code) {
    send(socket, "notice", { message: "請輸入代碼。" });
    return;
  }
  if (rewardType === "item") {
    if (!SHOP_ITEMS.some((item) => item.id === itemId)) {
      send(socket, "notice", { message: "請選擇要送出的道具。" });
      return;
    }
    coinCodes[code] = { type: "item", item: itemId, active: true };
  } else {
    if (coins <= 0) {
      send(socket, "notice", { message: "請輸入大於 0 的金幣。" });
      return;
    }
    coinCodes[code] = { type: "coins", coins, active: true };
  }
  saveCodes();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes });
  send(socket, "notice", { message: "代碼已新增或更新。" });
}

function handleAdminToggleCode(socket, session, rawCode) {
  if (!session.account.isHost) return;
  const code = String(rawCode || "").trim();
  if (!coinCodes[code]) return;
  coinCodes[code].active = !coinCodes[code].active;
  saveCodes();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes });
}

function addChat(sender, rawText) {
  const text = String(rawText || "").trim().slice(0, 120);
  if (!text) return;
  chatLog.push({ sender, text, at: Date.now() });
  chatLog = chatLog.slice(-30);
  broadcast("chat", { chatLog });
}

function islandHeight(x, z) {
  const distance = Math.hypot(x, z);
  if (distance > 115) return -20;
  return Math.sin(x * 0.08) * 0.8 + Math.cos(z * 0.06) * 0.8;
}

function floorHeightAt(x, y, z) {
  let floor = islandHeight(x, z);
  for (const platform of [...CHALLENGE_PLATFORMS, ...SOLID_FLOORS]) {
    const withinX = Math.abs(x - platform.x) <= platform.w / 2;
    const withinZ = Math.abs(z - platform.z) <= platform.d / 2;
    const top = platform.y + 0.4;
    if (withinX && withinZ && y >= top - 0.8 && top > floor) {
      floor = top;
    }
  }
  return floor;
}

function challengeFloorHeightAt(x, y, z, level = 1) {
  let floor = -20;
  for (const platform of getChallengePlatforms(level)) {
    const withinX = Math.abs(x - platform.x) <= platform.w / 2;
    const withinZ = Math.abs(z - platform.z) <= platform.d / 2;
    const top = platform.y + 0.4;
    if (withinX && withinZ && y >= top - 0.8 && top > floor) {
      floor = top;
    }
  }
  return floor;
}

function resolveSolidBlocks(player) {
  for (const block of SOLID_BLOCKS) {
    if (player.y > 2.2) continue;
    const halfW = block.w / 2 + 0.75;
    const halfD = block.d / 2 + 0.75;
    const dx = player.x - block.x;
    const dz = player.z - block.z;
    if (Math.abs(dx) >= halfW || Math.abs(dz) >= halfD) continue;
    const pushX = halfW - Math.abs(dx);
    const pushZ = halfD - Math.abs(dz);
    if (pushX < pushZ) {
      player.x = block.x + Math.sign(dx || 1) * halfW;
    } else {
      player.z = block.z + Math.sign(dz || 1) * halfD;
    }
  }
}

function collectNearbyCoins(session) {
  if (session.account.isHost) return;
  for (const coin of worldCoins) {
    if (coin.taken) continue;
    const distance = Math.hypot(session.player.x - coin.x, session.player.z - coin.z);
    if (distance < 1.8 && Math.abs(session.player.y - coin.y) < 3) {
      coin.taken = true;
      session.account.coins += 1;
      if (session.persistent) {
        accounts[session.account.code] = session.account;
        saveAccounts();
      }
      send(session.socket, "account", {
        account: session.account,
        shopItems: SHOP_ITEMS,
        coinCodes: session.account.isHost ? coinCodes : undefined
      });
      setTimeout(() => respawnCoin(coin), 9000);
    }
  }
}

function makeWorldCoins(count) {
  return Array.from({ length: count }, () => makeCoin());
}

function makeCoin(existingId) {
  const radius = 18 + Math.random() * 88;
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return {
    id: existingId || makeId(),
    x,
    y: islandHeight(x, z) + 1.1,
    z,
    taken: false
  };
}

function respawnCoin(coin) {
  Object.assign(coin, makeCoin(coin.id));
}

function randomSpawn() {
  return {
    x: Math.random() * 18 - 9,
    z: Math.random() * 18 - 9
  };
}

function send(socket, type, payload = {}) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcast(type, payload = {}) {
  const message = JSON.stringify({ type, ...payload });
  for (const session of sessions.values()) {
    if (session.socket.readyState === 1) {
      session.socket.send(message);
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function acceptWebSocket(request, rawSocket) {
  const key = request.headers["sec-websocket-key"];
  if (!key) {
    rawSocket.destroy();
    return null;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  rawSocket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n"));

  return new TinyWebSocket(rawSocket);
}

class TinyWebSocket extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.readyState = 1;
    this.buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => this.read(chunk));
    socket.on("close", () => this.close());
    socket.on("end", () => this.close());
    socket.on("error", () => this.close());
  }

  read(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = (second & 0x80) === 0x80;
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        const bigLength = this.buffer.readBigUInt64BE(offset);
        if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
          this.close();
          return;
        }
        length = Number(bigLength);
        offset += 8;
      }

      const maskLength = masked ? 4 : 0;
      if (this.buffer.length < offset + maskLength + length) return;

      const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
      offset += maskLength;
      const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
      this.buffer = this.buffer.subarray(offset + length);

      if (masked) {
        for (let i = 0; i < payload.length; i += 1) {
          payload[i] ^= mask[i % 4];
        }
      }

      if (opcode === 0x8) {
        this.close();
        return;
      }
      if (opcode === 0x1) {
        this.emit("message", payload.toString("utf8"));
      }
    }
  }

  send(text) {
    if (this.readyState !== 1) return;
    const payload = Buffer.from(text);
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
    this.socket.write(Buffer.concat([header, payload]));
  }

  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.emit("close");
    this.socket.destroy();
  }
}
