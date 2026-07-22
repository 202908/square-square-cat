import http from "node:http";
import crypto from "node:crypto";
import { EventEmitter } from "node:events";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_COIN_CODES,
  DEFAULT_TITLE_ID,
  DEFAULT_TITLES,
  HOST_CODE,
  HOST_PASSWORD,
  LEVEL_REWARDS,
  SHOP_ITEMS,
  TITLE_COLORS,
  addFriend,
  applyHousePaint,
  buyItem,
  canFly,
  challengeFinishForLevel,
  challengeLevelForAccounts,
  challengeStartForLevel,
  claimLevelReward,
  completeChallenge,
  createAccount,
  damageAdultThirst,
  damageMonster,
  equipItem,
  getChallengePlatforms,
  isValidNewAccountCode,
  makeGuestAccount,
  redeemCode,
  richestDiamondAccountCode,
  sendCoinGift,
  sendDiamondGift,
  updateSurvivalStats
} from "./src/gameRules.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const accountsFile = path.join(dataDir, "accounts.json");
const codesFile = path.join(dataDir, "coinCodes.json");
const titlesFile = path.join(dataDir, "titles.json");
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
const SLIDE = { topX: -28, topY: 5.9, bottomX: -14.5, bottomY: 1.2, z: -20 };
const SOLID_FLOORS = [
  { x: -28, y: 5.5, z: -20, w: 7, d: 6 },
  ...Array.from({ length: 5 }, (_, i) => ({ x: -33.2, y: 0.98 + i * 0.8, z: -21.8 + i * 0.12, w: 3.2, d: 0.7 })),
  ...Array.from({ length: 8 }, (_, i) => ({
    x: -26.8 + i * 1.7,
    y: 5.05 - i * 0.52,
    z: -20,
    w: 2.4,
    d: 4.2
  }))
];
const SOLID_BLOCKS = [
  { x: -28, z: -20, w: 7, d: 6 }
];
const SWING = { x: 12, y: 2.2, z: -28, angle: 0, velocity: 0, riders: [] };
const FERRIS = {
  x: -38,
  y: 11.5,
  z: -52,
  radius: 9,
  seats: 8,
  angle: 0,
  icon: "jump-cat",
  platformGuests: []
};
const RIVER = { z: 8, width: 8, xMin: -92, xMax: 92 };

const sessions = new Map();
const sockets = new Map();
const teams = new Map();
let accounts = {};
let coinCodes = structuredClone(DEFAULT_COIN_CODES);
let titleCatalog = structuredClone(DEFAULT_TITLES);
let chatLog = [];
let worldCoins = makeWorldCoins(80);
let survivalPickups = makeSurvivalPickups();
let survivalHazards = makeSurvivalHazards();
let worldBushes = makeHiddenBushes();

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
      FERRIS.platformGuests = FERRIS.platformGuests.filter((guestId) => guestId !== id);
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
      if (account.isHost) account.diamonds = 999999999;
      if (account.isHost) account.level = null;
      account.diamonds ??= 0;
      account.equipped ||= { hat: null, clothes: null, tail: null, trail: null };
      account.equipped.trail ??= null;
      account.equipped.pet ??= null;
      if (!account.equipped.title) {
        account.equipped.title = DEFAULT_TITLE_ID;
        changedAccounts = true;
      }
      if (!Array.isArray(account.titles)) {
        account.titles = [DEFAULT_TITLE_ID];
        changedAccounts = true;
      }
      if (!account.titles.includes(DEFAULT_TITLE_ID)) {
        account.titles.unshift(DEFAULT_TITLE_ID);
        changedAccounts = true;
      }
      if (!account.titles.includes(account.equipped.title)) {
        account.equipped.title = DEFAULT_TITLE_ID;
        changedAccounts = true;
      }
      account.house ??= null;
      account.roomItems ??= [];
      account.giftInbox ??= [];
      account.survivalMode ??= account.isHost ? "host" : null;
      account.hunger ??= 100;
      account.thirst ??= 100;
      if (!Array.isArray(account.claimedLevelRewards)) {
        account.claimedLevelRewards = [];
        changedAccounts = true;
      }
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
  if (existsSync(titlesFile)) {
    titleCatalog = { ...DEFAULT_TITLES, ...JSON.parse(await readFile(titlesFile, "utf8")) };
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

async function saveTitles() {
  await writeFile(titlesFile, JSON.stringify(titleCatalog, null, 2));
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
    case "claimLevelReward":
      updateAccount(socket, session, claimLevelReward(session.account, message.level));
      break;
    case "setSurvivalMode":
      handleSetSurvivalMode(socket, session, message.mode);
      break;
    case "equip":
      updateAccount(socket, session, equipItem(session.account, message.itemId));
      break;
    case "equipTitle":
      handleEquipTitle(socket, session, message.titleId);
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
    case "searchBush":
      handleSearchBush(socket, session, message.bushId);
      break;
    case "slideDown":
      handleSlideDown(socket, session);
      break;
    case "sendGift":
      handleSendGift(socket, session, message.friendCode, message.itemId);
      break;
    case "sendCoinGift":
      handleSendCoinGift(socket, session, message.friendCode, message.coins);
      break;
    case "sendDiamondGift":
      handleSendDiamondGift(socket, session, message.friendCode, message.diamonds);
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
    case "ferrisRide":
      handleFerrisRide(socket, session);
      break;
    case "ferrisExit":
      handleFerrisExit(socket, session);
      break;
    case "ferrisCenterEnter":
      handleFerrisCenterEnter(socket, session);
      break;
    case "ferrisCenterLeave":
      handleFerrisCenterLeave(socket, session);
      break;
    case "ferrisCenterInvite":
      handleFerrisCenterInvite(socket, session);
      break;
    case "acceptFerrisCenterInvite":
      handleAcceptFerrisCenterInvite(socket, session, message.leaderId);
      break;
    case "setFerrisIcon":
      handleSetFerrisIcon(socket, session, message.icon);
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
    case "adminDeleteCode":
      handleAdminDeleteCode(socket, session, message.code);
      break;
    case "adminUpsertTitle":
      handleAdminUpsertTitle(socket, session, message);
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
      flying: false,
      carrying: null,
      carriedBy: null,
      attackUntil: 0,
      hitUntil: 0,
      location: "island",
      roomOwner: null,
      ride: null,
      ferrisSeat: null,
      slideProgress: null,
      teamId: null,
      flightLeader: null,
      challengeLevel: 1
    }
  });

  send(socket, "authed", {
    id: sessionId,
    account,
    shopItems: SHOP_ITEMS,
    levelRewards: LEVEL_REWARDS,
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
  updateFerris(1 / TICK_RATE);
  updateSurvivalWorld(1 / TICK_RATE);
  for (const session of sessions.values()) {
    updatePlayer(session, 1 / TICK_RATE);
  }
  const richestCode = richestDiamondAccountCode([...sessions.values()].map((session) => session.account));
  broadcast("state", {
    coins: worldCoins,
    survivalPickups,
    survivalHazards,
    totalAccounts: Object.keys(accounts).length,
    bushes: worldBushes,
    swing: SWING,
    ferris: {
      ...FERRIS,
      richestCode,
      platformGuests: FERRIS.platformGuests.filter((id) => sessions.has(id))
    },
    houses: Object.values(accounts).filter((account) => account.house).map((account) => ({
      owner: account.code,
      ...account.house
    })),
    players: [...sessions.values()].map((session) => ({
      ...session.player,
      accountCode: session.account.code,
      displayName: displayNameFor(session.account),
      isHost: session.account.isHost,
      level: session.account.level,
      survivalMode: session.account.survivalMode,
      hunger: session.account.hunger,
      thirst: session.account.thirst,
      title: titleCatalog[session.account.equipped?.title] || DEFAULT_TITLES[DEFAULT_TITLE_ID],
      catVariant: session.account.catVariant,
      equipped: session.account.equipped,
      roomItems: session.player.location === "room" ? session.account.roomItems : [],
      teamId: session.player.teamId,
      challengeLevel: session.player.challengeLevel,
      teammates: teammateNamesFor(session),
      coins: session.account.coins,
      diamonds: session.account.diamonds
    }))
  });
}

function displayNameFor(account) {
  return account.code;
}

function updatePlayer(session, dt) {
  const player = session.player;
  if (player.slideProgress !== null) {
    updateSlidePlayer(session, dt);
    return;
  }
  if (player.flightLeader) {
    updateFlightFollower(session);
    return;
  }
  if (player.ride === "swing") {
    updateSwingRider(session);
    return;
  }
  if (player.ride === "ferris") {
    updateFerrisRider(session);
    return;
  }
  if (player.ride === "ferrisCenter") {
    updateFerrisCenterRider(session);
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

  const hasWings = canFly(session.account);
  if (!hasWings) player.flying = false;
  if (hasWings && session.input.y > 0.05) player.flying = true;

  const speed = hasWings && player.flying ? 8 : 6;
  player.vx = session.input.x * speed;
  player.vz = session.input.z * speed;
  if (Math.abs(player.vx) + Math.abs(player.vz) > 0.1) {
    player.yaw = Math.atan2(player.vx, player.vz);
  }

  const swimming = player.location === "island" && isInRiver(player);
  if (hasWings && player.flying) {
    player.vy = session.input.y * 5;
  } else if (swimming) {
    player.vy -= 7 * dt;
    if (session.input.jump) {
      player.vy = Math.max(player.vy, 3.2);
      player.onGround = false;
    }
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

  let floorY = floorHeightAt(player.x, player.y, player.z);
  if (player.location === "island" && isInRiver(player)) {
    floorY -= 0.55;
  }
  if (player.y <= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.onGround = true;
    if (hasWings && session.input.y <= 0) {
      player.flying = false;
    }
  }

  const limit = 120;
  player.x = clamp(player.x, -limit, limit);
  player.z = clamp(player.z, -limit, limit);
  player.y = clamp(player.y, floorY, 60);
  collectNearbyCoins(session);
  collectNearbySurvivalPickups(session);
  drinkFromRiver(session);
  handleHazardHits(session);
}

function updateSurvivalWorld(dt) {
  const now = Date.now();
  for (const hazard of survivalHazards) {
    if (hazard.dead) continue;
    hazard.phase += dt * hazard.speed;
    const target = nearestMonsterTarget(hazard);
    if (target) {
      const dx = target.player.x - hazard.x;
      const dz = target.player.z - hazard.z;
      const distance = Math.max(0.001, Math.hypot(dx, dz));
      hazard.x += (dx / distance) * hazard.moveSpeed * dt;
      hazard.z += (dz / distance) * hazard.moveSpeed * dt;
    } else {
      if (Date.now() > Number(hazard.wanderAfter || 0)) {
        hazard.wanderAngle += (Math.random() - 0.5) * 1.4;
        hazard.wanderAfter = Date.now() + 900 + Math.random() * 1200;
      }
      hazard.x += Math.cos(hazard.wanderAngle) * hazard.moveSpeed * 0.38 * dt;
      hazard.z += Math.sin(hazard.wanderAngle) * hazard.moveSpeed * 0.38 * dt;
      const distanceFromCenter = Math.hypot(hazard.x, hazard.z);
      if (distanceFromCenter > 104) {
        hazard.wanderAngle = Math.atan2(-hazard.z, -hazard.x);
      }
    }
    hazard.y = islandHeight(hazard.x, hazard.z) + 0.8 + Math.abs(Math.sin(hazard.phase)) * 1.7;
  }
  for (const session of sessions.values()) {
    if (session.player.location !== "island" || session.account.isHost) continue;
    const result = updateSurvivalStats(session.account, dt);
    session.account = result.account;
    if (result.died && now > Number(session.player.survivalDeathNoticeAfter || 0)) {
      const spawn = randomSpawn();
      session.player.x = spawn.x;
      session.player.y = 4;
      session.player.z = spawn.z;
      session.player.vy = 0;
      session.player.hitUntil = now + 1200;
      session.player.survivalDeathNoticeAfter = now + 1500;
      persistSessionAccount(session);
      sendAccount(session.socket, session.account);
      send(session.socket, "notice", { message: "你的飢餓或水分變成 0，回到出生點重新開始。" });
    }
  }
}

function nearestMonsterTarget(monster) {
  let best = null;
  let bestDistance = Infinity;
  for (const session of sessions.values()) {
    if (session.player.location !== "island") continue;
    if (session.account.survivalMode !== "adult") continue;
    const distance = Math.hypot(session.player.x - monster.x, session.player.z - monster.z);
    if (distance <= 36 && distance < bestDistance) {
      best = session;
      bestDistance = distance;
    }
  }
  return best;
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
    const start = challengeStartForLevel(player.challengeLevel);
    player.x = start.x;
    player.y = 3;
    player.z = start.z;
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
  const start = challengeStartForLevel(player.challengeLevel);
  const finish = challengeFinishForLevel(player.challengeLevel);
  player.x = clamp(player.x, start.x - 18, finish.x + 14);
  player.z = clamp(player.z, start.z - 32, start.z + 32);
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
  if (player.carrying) {
    const carriedSession = sessions.get(player.carrying);
    detachCarried(player);
    if (carriedSession) {
      broadcast("notice", { message: `${displayNameFor(session.account)} 讓 ${displayNameFor(carriedSession.account)} 下來。` });
    }
    return;
  }
  if (player.carriedBy) {
    detachFromCarrier(player);
    player.y += 1.5;
    return;
  }

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

function detachCarried(player) {
  const carried = player.carrying ? sessions.get(player.carrying)?.player : null;
  if (carried?.carriedBy === player.id) {
    carried.carriedBy = null;
    carried.y += 1.5;
  }
  player.carrying = null;
}

function detachFromStack(player) {
  detachFromCarrier(player);
  detachCarried(player);
}

function handleAttack(session) {
  const target = findPlayerInFront(session, 4);
  session.player.attackUntil = Date.now() + 450;
  if (!target) {
    const canHitMonster = session.account.isHost || session.account.survivalMode === "adult";
    const monster = canHitMonster ? findMonsterInFront(session, 5) : null;
    if (monster) hitMonster(session, monster);
    return;
  }
  const dx = target.player.x - session.player.x;
  const dz = target.player.z - session.player.z;
  const distance = Math.max(0.001, Math.hypot(dx, dz));
  detachFromStack(target.player);
  target.player.hitUntil = Date.now() + 650;
  target.player.x += (dx / distance) * 1.8;
  target.player.z += (dz / distance) * 1.8;
  target.player.vy = 7.5;
  target.player.onGround = false;
  const damageResult = damageAdultThirst(target.account, 18);
  target.account = damageResult.account;
  if (damageResult.died) {
    const spawn = randomSpawn();
    target.player.x = spawn.x;
    target.player.y = 4;
    target.player.z = spawn.z;
    target.player.vy = 0;
    persistSessionAccount(target);
    sendAccount(target.socket, target.account);
    broadcast("notice", { message: `${displayNameFor(session.account)} 咬了 ${displayNameFor(target.account)}，${displayNameFor(target.account)} 水分歸零回到出生點。` });
    return;
  }
  if (damageResult.damaged) {
    persistSessionAccount(target);
    sendAccount(target.socket, target.account);
    broadcast("notice", { message: `${displayNameFor(session.account)} 咬了 ${displayNameFor(target.account)} 一下，水分少了一些。` });
    return;
  }
  broadcast("notice", { message: `${displayNameFor(session.account)} 咬了 ${displayNameFor(target.account)} 一下。` });
}

function findMonsterInFront(session, range) {
  const player = session.player;
  const forwardX = Math.sin(player.yaw);
  const forwardZ = Math.cos(player.yaw);
  let best = null;
  let bestDistance = Infinity;
  for (const monster of survivalHazards) {
    if (monster.dead) continue;
    const dx = monster.x - player.x;
    const dz = monster.z - player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > range || distance < 0.01) continue;
    const dot = (dx / distance) * forwardX + (dz / distance) * forwardZ;
    if (dot > 0.25 && distance < bestDistance) {
      best = monster;
      bestDistance = distance;
    }
  }
  return best;
}

function hitMonster(session, monster) {
  const result = damageMonster(monster);
  Object.assign(monster, result.monster);
  const dx = monster.x - session.player.x;
  const dz = monster.z - session.player.z;
  const distance = Math.max(0.001, Math.hypot(dx, dz));
  monster.x += (dx / distance) * 1.6;
  monster.z += (dz / distance) * 1.6;
  monster.phase += 1.2;
  if (result.dead) {
    monster.dead = true;
    dropMonsterFood(monster);
    send(session.socket, "notice", { message: "怪物被打倒了。" });
    setTimeout(() => respawnMonster(monster), 7000);
  } else {
    send(session.socket, "notice", { message: `打到怪物，還要 ${monster.hp} 下。` });
  }
}

function handleSlideDown(socket, session) {
  const player = session.player;
  if (player.location !== "island") return;
  const nearTop = Math.hypot(player.x - SLIDE.topX, player.z - SLIDE.z) < 5.5 && player.y > 4.4;
  if (!nearTop) {
    send(socket, "notice", { message: "要站到溜滑梯上面才能溜下來。" });
    return;
  }
  detachFromStack(player);
  player.ride = null;
  player.slideProgress = 0;
  player.vx = 0;
  player.vy = 0;
  player.vz = 0;
}

function updateSlidePlayer(session, dt) {
  const player = session.player;
  player.slideProgress = Math.min(1, Number(player.slideProgress || 0) + dt * 0.72);
  const t = easeInOut(player.slideProgress);
  player.x = SLIDE.topX + (SLIDE.bottomX - SLIDE.topX) * t;
  player.y = SLIDE.topY + (SLIDE.bottomY - SLIDE.topY) * t;
  player.z = SLIDE.z;
  player.yaw = Math.PI / 2;
  player.vx = 0;
  player.vy = 0;
  player.vz = 0;
  player.onGround = false;
  if (player.slideProgress >= 1) {
    player.slideProgress = null;
    player.y = islandHeight(player.x, player.z) + 1;
    player.onGround = true;
  }
}

function easeInOut(value) {
  return value < 0.5 ? 2 * value * value : 1 - ((-2 * value + 2) ** 2) / 2;
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
  session.player.slideProgress = null;
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
  SWING.velocity += 0.12 * direction;
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

function updateFerris(dt) {
  FERRIS.angle = (FERRIS.angle + dt * 0.32) % (Math.PI * 2);
  FERRIS.platformGuests = FERRIS.platformGuests.filter((id) => sessions.has(id));
}

function ferrisSeatPosition(index = 0) {
  const angle = FERRIS.angle + (index * Math.PI * 2) / FERRIS.seats;
  return {
    x: FERRIS.x + Math.sin(angle) * FERRIS.radius,
    y: FERRIS.y - Math.cos(angle) * FERRIS.radius,
    z: FERRIS.z
  };
}

function bottomFerrisSeatIndex() {
  let best = 0;
  let lowest = Infinity;
  for (let index = 0; index < FERRIS.seats; index += 1) {
    const position = ferrisSeatPosition(index);
    if (position.y < lowest) {
      lowest = position.y;
      best = index;
    }
  }
  return best;
}

function isNearFerris(player) {
  return player.location === "island" && Math.hypot(player.x - FERRIS.x, player.z - FERRIS.z) < 13;
}

function ferrisRichestCode() {
  return richestDiamondAccountCode([...sessions.values()].map((candidate) => candidate.account));
}

function canControlFerrisCenter(session) {
  return session.account.code === ferrisRichestCode();
}

function handleFerrisRide(socket, session) {
  if (!isNearFerris(session.player)) {
    send(socket, "notice", { message: "請靠近摩天輪再進入。" });
    return;
  }
  detachFromStack(session.player);
  stopFollowingFlight(session);
  session.player.ride = "ferris";
  session.player.ferrisSeat = bottomFerrisSeatIndex();
  updateFerrisRider(session);
  send(socket, "notice", { message: "你坐上摩天輪了。" });
}

function handleFerrisExit(socket, session) {
  if (session.player.ride !== "ferris" && session.player.ride !== "ferrisCenter") return;
  const fromCenter = session.player.ride === "ferrisCenter";
  session.player.ride = null;
  session.player.ferrisSeat = null;
  FERRIS.platformGuests = FERRIS.platformGuests.filter((id) => id !== session.id);
  session.player.x += fromCenter ? 4 : 1.5;
  session.player.vy = 0;
  session.player.onGround = false;
  send(socket, "notice", { message: fromCenter ? "你離開摩天輪中心平台。" : "你離開摩天輪座位。" });
}

function updateFerrisRider(session) {
  const position = ferrisSeatPosition(Number(session.player.ferrisSeat || 0));
  session.player.x = position.x;
  session.player.y = position.y;
  session.player.z = position.z;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
  session.player.onGround = false;
}

function handleFerrisCenterEnter(socket, session) {
  const invited = FERRIS.platformGuests.includes(session.id);
  if (!isNearFerris(session.player) && !canControlFerrisCenter(session) && !invited) {
    send(socket, "notice", { message: "要靠近摩天輪才能上中心平台。" });
    return;
  }
  if (!canControlFerrisCenter(session) && !invited) {
    send(socket, "notice", { message: "只有鑽石最多的人，或被邀請的人可以上中心平台。" });
    return;
  }
  detachFromStack(session.player);
  stopFollowingFlight(session);
  session.player.ride = "ferrisCenter";
  if (!FERRIS.platformGuests.includes(session.id)) FERRIS.platformGuests.push(session.id);
  updateFerrisCenterRider(session);
  send(socket, "notice", { message: "你上到摩天輪中心平台。" });
}

function handleFerrisCenterLeave(socket, session) {
  if (session.player.ride !== "ferrisCenter") return;
  handleFerrisExit(socket, session);
}

function updateFerrisCenterRider(session) {
  const index = Math.max(0, FERRIS.platformGuests.indexOf(session.id));
  const offset = (index - (FERRIS.platformGuests.length - 1) / 2) * 1.2;
  session.player.x = FERRIS.x + offset;
  session.player.y = FERRIS.y + 1.2;
  session.player.z = FERRIS.z + 1.8;
  session.player.vx = 0;
  session.player.vy = 0;
  session.player.vz = 0;
  session.player.onGround = false;
}

function handleFerrisCenterInvite(socket, session) {
  if (!canControlFerrisCenter(session)) {
    send(socket, "notice", { message: "只有目前鑽石最多的人可以邀請大家上中心平台。" });
    return;
  }
  const invited = [...sessions.values()].filter((candidate) => candidate.id !== session.id && candidate.player.location === "island");
  for (const candidate of invited) {
    send(candidate.socket, "ferrisCenterInvite", {
      leaderId: session.id,
      leaderName: displayNameFor(session.account)
    });
  }
  send(socket, "notice", { message: "已邀請島上的玩家上摩天輪中心平台。" });
}

function handleAcceptFerrisCenterInvite(socket, session, leaderId) {
  const leader = sessions.get(String(leaderId || ""));
  if (!leader || !canControlFerrisCenter(leader)) {
    send(socket, "notice", { message: "這個中心平台邀請已經失效。" });
    return;
  }
  if (session.player.location !== "island") {
    send(socket, "notice", { message: "要在島上才能接受摩天輪邀請。" });
    return;
  }
  if (!FERRIS.platformGuests.includes(session.id)) FERRIS.platformGuests.push(session.id);
  handleFerrisCenterEnter(socket, session);
}

function handleSetFerrisIcon(socket, session, icon) {
  if (!canControlFerrisCenter(session)) {
    send(socket, "notice", { message: "只有目前鑽石最多的人可以更換摩天輪中心圖案。" });
    return;
  }
  const allowed = new Set(["jump-cat", "cloud-cat", "play-cats", "star-cat", "diamond-cat"]);
  if (!allowed.has(String(icon || ""))) {
    send(socket, "notice", { message: "沒有這個中心圖案。" });
    return;
  }
  FERRIS.icon = String(icon);
  broadcast("notice", { message: `${displayNameFor(session.account)} 更換了摩天輪中心圖案。` });
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

function handleSetSurvivalMode(socket, session, mode) {
  if (session.account.isHost) return;
  const selected = mode === "adult" ? "adult" : mode === "child" ? "child" : null;
  if (!selected) {
    send(socket, "notice", { message: "請選擇大人模式或小孩模式。" });
    return;
  }
  session.account.survivalMode = selected;
  session.account.hunger = 100;
  session.account.thirst = 100;
  persistSessionAccount(session);
  sendAccount(socket, session.account);
  send(socket, "notice", { message: selected === "adult" ? "已設定為大人模式。" : "已設定為小孩模式。" });
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
  const usesDiamonds = Number(item.diamondPrice || 0) > 0;
  if (!session.account.isHost && usesDiamonds && Number(session.account.diamonds || 0) < item.diamondPrice) {
    send(socket, "notice", { message: "鑽石不夠，不能送這個禮物。" });
    return;
  }
  if (!session.account.isHost && !usesDiamonds && session.account.coins < item.price) {
    send(socket, "notice", { message: "金幣不夠，不能送這個禮物。" });
    return;
  }
  if (!session.account.isHost && usesDiamonds) {
    session.account.diamonds -= item.diamondPrice;
  } else if (!session.account.isHost) {
    session.account.coins -= item.price;
  }
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

function handleSendDiamondGift(socket, session, friendCode, diamonds) {
  const code = String(friendCode || "").trim();
  const recipient = accounts[code];
  if (!recipient) {
    send(socket, "notice", { message: "只能送給你的好友。" });
    return;
  }

  const result = sendDiamondGift(session.account, recipient, diamonds, { id: makeId(), sentAt: Date.now() });
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
    send(onlineRecipient.socket, "notice", { message: `${displayNameFor(session.account)} 送了你鑽石。` });
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
  if (gift.kind === "diamonds") {
    if (!session.account.isHost) session.account.diamonds = Number(session.account.diamonds || 0) + Math.max(0, Math.floor(Number(gift.diamonds || 0)));
    session.account.giftInbox = session.account.giftInbox.filter((candidate) => candidate.id !== giftId);
    persistSessionAccount(session);
    send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
    send(socket, "notice", { message: `已收下 ${gift.diamonds} 顆鑽石。` });
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
  } else if (sender && gift.kind === "diamonds") {
    if (!sender.isHost) sender.diamonds = Number(sender.diamonds || 0) + Math.max(0, Math.floor(Number(gift.diamonds || 0)));
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
  const start = challengeStartForLevel(challengeLevel);
  members.forEach((member, index) => {
    if (member.player.ride === "swing") {
      SWING.riders = SWING.riders.filter((id) => id !== member.id);
      member.player.ride = null;
    }
    if (member.player.ride === "ferris" || member.player.ride === "ferrisCenter") {
      FERRIS.platformGuests = FERRIS.platformGuests.filter((id) => id !== member.id);
      member.player.ride = null;
      member.player.ferrisSeat = null;
    }
    stopFollowingFlight(member);
    detachFromStack(member.player);
    member.player.location = "challenge";
    member.player.slideProgress = null;
    member.player.challengeLevel = challengeLevel;
    member.player.x = start.x + index * 2.2;
    member.player.y = 3;
    member.player.z = start.z + index * 1.8;
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
    sendAccount(member.socket, member.account);
    broadcast("notice", {
      message: result.levelAdded
        ? `${displayNameFor(member.account)} 闖關成功，加了 ${result.coinsAdded} 金幣和 ${result.levelAdded} 級。`
        : `${displayNameFor(member.account)} 闖關成功。`
    });
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
  sendAccount(socket, session.account);
}

function sendAccount(socket, account) {
  send(socket, "account", {
    account,
    shopItems: SHOP_ITEMS,
    levelRewards: LEVEL_REWARDS,
    titleCatalog,
    titleColors: TITLE_COLORS,
    coinCodes: account.isHost ? coinCodes : undefined
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

function handleAdminDeleteCode(socket, session, rawCode) {
  if (!session.account.isHost) return;
  const code = String(rawCode || "").trim();
  if (!coinCodes[code]) return;
  delete coinCodes[code];
  saveCodes();
  send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes });
  send(socket, "notice", { message: "代碼已刪除。" });
}

function handleEquipTitle(socket, session, rawTitleId) {
  const titleId = String(rawTitleId || "").trim();
  if (!titleCatalog[titleId]) {
    send(socket, "notice", { message: "找不到這個稱號。" });
    return;
  }
  session.account.titles ||= [DEFAULT_TITLE_ID];
  if (!session.account.titles.includes(titleId)) {
    send(socket, "notice", { message: "你還沒有這個稱號。" });
    return;
  }
  session.account.equipped ||= {};
  session.account.equipped.title = titleId;
  persistSessionAccount(session);
  sendAccount(socket, session.account);
  send(socket, "notice", { message: `已裝備稱號「${titleCatalog[titleId].name}」。` });
}

function handleAdminUpsertTitle(socket, session, message) {
  if (!session.account.isHost) {
    send(socket, "notice", { message: "只有主機帳號可以新增稱號。" });
    return;
  }
  const name = String(message.name || "").trim().slice(0, 14);
  const color = TITLE_COLORS[String(message.color || "")] ? String(message.color) : "black";
  if (!name) {
    send(socket, "notice", { message: "請輸入稱號名稱。" });
    return;
  }
  const id = `title-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Date.now()}`;
  titleCatalog[id] = { id, name, color };
  for (const account of Object.values(accounts)) {
    account.titles ||= [DEFAULT_TITLE_ID];
    if (!account.titles.includes(id)) account.titles.push(id);
  }
  for (const onlineSession of sessions.values()) {
    onlineSession.account.titles ||= [DEFAULT_TITLE_ID];
    if (!onlineSession.account.titles.includes(id)) onlineSession.account.titles.push(id);
    sendAccount(onlineSession.socket, onlineSession.account);
  }
  saveTitles();
  saveAccounts();
  send(socket, "notice", { message: `已新增稱號「${name}」。` });
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

function collectNearbySurvivalPickups(session) {
  if (session.account.survivalMode !== "adult" || session.player.location !== "island") return;
  for (const pickup of survivalPickups) {
    if (pickup.taken) continue;
    const distance = Math.hypot(session.player.x - pickup.x, session.player.z - pickup.z);
    if (distance > 2.2 || Math.abs(session.player.y - pickup.y) > 4) continue;
    pickup.taken = true;
    session.account.hunger = Math.min(100, Number(session.account.hunger || 0) + 28);
    send(session.socket, "notice", { message: "吃到肉塊，飢餓值回復。" });
    persistSessionAccount(session);
    sendAccount(session.socket, session.account);
  }
}

function drinkFromRiver(session) {
  if (session.account.survivalMode !== "adult" || session.player.location !== "island") return;
  if (!isInRiver(session.player) || Number(session.account.thirst || 100) >= 100) return;
  session.account.thirst = Math.min(100, Number(session.account.thirst || 0) + 0.55);
  if (Date.now() > Number(session.player.riverNoticeAfter || 0)) {
    send(session.socket, "notice", { message: "你在溪流旁喝水，水分正在回復。" });
    session.player.riverNoticeAfter = Date.now() + 4000;
  }
  persistSessionAccount(session);
}

function handleHazardHits(session) {
  const player = session.player;
  if (player.location !== "island" || Date.now() < Number(player.hazardCooldownUntil || 0)) return;
  if (session.account.survivalMode !== "adult") return;
  for (const hazard of survivalHazards) {
    if (hazard.dead) continue;
    const distance = Math.hypot(player.x - hazard.x, player.z - hazard.z);
    if (distance > 2.4 || Math.abs(player.y - hazard.y) > 3.2) continue;
    const dx = player.x - hazard.x;
    const dz = player.z - hazard.z;
    const length = Math.max(0.001, Math.hypot(dx, dz));
    player.x += (dx / length) * 2.4;
    player.z += (dz / length) * 2.4;
    player.vy = 8;
    player.onGround = false;
    player.hitUntil = Date.now() + 700;
    player.hazardCooldownUntil = Date.now() + 1200;
    if (session.account.survivalMode === "adult") {
      session.account.thirst = Math.max(0, Number(session.account.thirst || 0) - 9);
      persistSessionAccount(session);
      sendAccount(session.socket, session.account);
      send(session.socket, "notice", { message: "被跳跳物撞到，水分少了一些。" });
    }
    return;
  }
}

function isInRiver(player) {
  return player.x >= RIVER.xMin
    && player.x <= RIVER.xMax
    && Math.abs(player.z - RIVER.z) <= RIVER.width / 2 + 1;
}

function teammateNamesFor(session) {
  if (!session.player.teamId || !teams.has(session.player.teamId)) return [];
  return [...teams.get(session.player.teamId)]
    .filter((id) => id !== session.id)
    .map((id) => sessions.get(id)?.account?.code)
    .filter(Boolean);
}

function handleSearchBush(socket, session, bushId) {
  const bush = worldBushes.find((candidate) => candidate.id === bushId && !candidate.searched);
  if (!bush) {
    send(socket, "notice", { message: "這個草叢已經被翻過了。" });
    return;
  }
  if (session.player.location !== "island") {
    send(socket, "notice", { message: "要在島上才能翻草叢。" });
    return;
  }
  const distance = Math.hypot(session.player.x - bush.x, session.player.z - bush.z);
  if (distance > 4.2) {
    send(socket, "notice", { message: "靠近草叢一點再翻開。" });
    return;
  }

  bush.searched = true;
  const foundDiamond = Math.random() < 0.42;
  if (foundDiamond) {
    session.account.diamonds = Number(session.account.diamonds || 0) + 1;
    if (!session.account.isHost) {
      session.account.level = Math.max(1, Number(session.account.level || 1)) + 1;
    }
    persistSessionAccount(session);
    send(socket, "account", { account: session.account, shopItems: SHOP_ITEMS, coinCodes: session.account.isHost ? coinCodes : undefined });
    send(socket, "notice", { message: session.account.isHost ? "翻開草叢，找到 1 顆鑽石。" : `翻開草叢，找到 1 顆鑽石，升到 Lv. ${session.account.level}。` });
  } else {
    send(socket, "notice", { message: "翻開草叢，這次沒有找到鑽石。" });
  }
  setTimeout(() => resetBush(bush), 45000);
}

function resetBush(bush) {
  const index = worldBushes.findIndex((candidate) => candidate.id === bush.id);
  if (index === -1) return;
  worldBushes[index] = { ...bush, searched: false };
}

function makeWorldCoins(count) {
  return Array.from({ length: count }, () => makeCoin());
}

function makeSurvivalPickups() {
  return [];
}

function makeSurvivalPickup(index, position = randomIslandPoint(96)) {
  return {
    id: `survival-${index + 1}`,
    kind: "meat",
    x: position.x,
    y: islandHeight(position.x, position.z) + 0.8,
    z: position.z,
    taken: false
  };
}

function dropMonsterFood(monster) {
  survivalPickups.push(makeSurvivalPickup(Date.now(), {
    x: monster.x,
    z: monster.z
  }));
  survivalPickups = survivalPickups.filter((pickup) => !pickup.taken).slice(-30);
}

function makeSurvivalHazards() {
  return Array.from({ length: 18 }, (_, index) => {
    const position = randomIslandCenterPoint();
    return {
      id: `hazard-${index + 1}`,
      x: position.x,
      y: islandHeight(position.x, position.z) + 1,
      z: position.z,
      phase: Math.random() * Math.PI * 2,
      speed: 1.5 + Math.random() * 0.8,
      moveSpeed: 4.8 + Math.random() * 2.2,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderAfter: 0,
      hp: 3,
      hitUntil: 0,
      dead: false
    };
  });
}

function respawnMonster(monster) {
  const position = randomIslandCenterPoint();
  Object.assign(monster, {
    x: position.x,
    y: islandHeight(position.x, position.z) + 1,
    z: position.z,
    phase: Math.random() * Math.PI * 2,
    moveSpeed: 4.8 + Math.random() * 2.2,
    wanderAngle: Math.random() * Math.PI * 2,
    wanderAfter: 0,
    hp: 3,
    hitUntil: 0,
    dead: false
  });
}

function randomIslandCenterPoint() {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 16;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function randomIslandEdgePoint() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 104 + Math.random() * 9;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function randomIslandPoint(limit = 96) {
  let x = 0;
  let z = 0;
  do {
    x = Math.random() * limit * 2 - limit;
    z = Math.random() * limit * 2 - limit;
  } while (Math.hypot(x, z) > limit);
  return { x, z };
}

function makeHiddenBushes() {
  return [
    [-88, 0, -86], [-79, 0, -93], [-92, 0, 76], [-82, 0, 88],
    [88, 0, -82], [78, 0, -92], [92, 0, 82], [80, 0, 92],
    [-104, 0, -12], [-100, 0, 18], [104, 0, -18], [101, 0, 22],
    [-20, 0, -103], [18, 0, -101], [-24, 0, 104], [26, 0, 101],
    [-68, 0, 62], [-58, 0, 74], [63, 0, 64], [72, 0, 54],
    [-67, 0, -61], [-55, 0, -73], [67, 0, -62], [75, 0, -52]
  ].map(([x, y, z], index) => ({
    id: `bush-${index + 1}`,
    x,
    y: islandHeight(x, z) + 0.35 + y,
    z,
    searched: false
  }));
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
