import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const state = {
  socket: null,
  myId: null,
  account: null,
  shopItems: [],
  levelRewards: [],
  coinCodes: {},
  titleCatalog: {},
  titleColors: {},
  titlePlayers: [],
  players: new Map(),
  meshes: new Map(),
  coinMeshes: new Map(),
  bushMeshes: new Map(),
  houseMeshes: new Map(),
  furnitureMeshes: new Map(),
  survivalPickupMeshes: new Map(),
  hazardMeshes: new Map(),
  ferris: null,
  totalAccounts: 0,
  cameraYaw: 0,
  cameraDrag: { active: false, pointerId: null, x: 0 },
  keys: new Set(),
  joystick: { active: false, x: 0, z: 0 },
  actionCooldowns: {},
  jump: false,
  flyY: 0,
  authMode: "create",
  pendingHostCode: null
};

const els = {
  startScreen: document.querySelector("#startScreen"),
  authScreen: document.querySelector("#authScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  startButton: document.querySelector("#startButton"),
  guestButton: document.querySelector("#guestButton"),
  authForm: document.querySelector("#authForm"),
  authChoices: document.querySelector("#authChoices"),
  authLabel: document.querySelector("#authLabel"),
  authHint: document.querySelector("#authHint"),
  accountCode: document.querySelector("#accountCode"),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  authError: document.querySelector("#authError"),
  cancelAuth: document.querySelector("#cancelAuth"),
  canvas: document.querySelector("#gameCanvas"),
  accountName: document.querySelector("#accountName"),
  levelText: document.querySelector("#levelText"),
  levelRewardsButton: document.querySelector("#levelRewardsButton"),
  coinAmount: document.querySelector("#coinAmount"),
  diamondAmount: document.querySelector("#diamondAmount"),
  teamStatus: document.querySelector("#teamStatus"),
  survivalHud: document.querySelector("#survivalHud"),
  hungerText: document.querySelector("#hungerText"),
  thirstText: document.querySelector("#thirstText"),
  coinCodeButton: document.querySelector("#coinCodeButton"),
  friendsButton: document.querySelector("#friendsButton"),
  challengeButton: document.querySelector("#challengeButton"),
  inviteFlyButton: document.querySelector("#inviteFlyButton"),
  bagButton: document.querySelector("#bagButton"),
  shopButton: document.querySelector("#shopButton"),
  onlinePlayersButton: document.querySelector("#onlinePlayersButton"),
  adminButton: document.querySelector("#adminButton"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  voiceButton: document.querySelector("#voiceButton"),
  joystick: document.querySelector("#joystick"),
  joystickKnob: document.querySelector("#joystickKnob"),
  jumpButton: document.querySelector("#jumpButton"),
  stackButton: document.querySelector("#stackButton"),
  attackButton: document.querySelector("#attackButton"),
  enterHouseButton: document.querySelector("#enterHouseButton"),
  clearHouseActionButton: document.querySelector("#clearHouseActionButton"),
  searchBushButton: document.querySelector("#searchBushButton"),
  slideButton: document.querySelector("#slideButton"),
  swingButton: document.querySelector("#swingButton"),
  swingPumpButton: document.querySelector("#swingPumpButton"),
  ferrisRideButton: document.querySelector("#ferrisRideButton"),
  ferrisCenterButton: document.querySelector("#ferrisCenterButton"),
  ferrisIconButton: document.querySelector("#ferrisIconButton"),
  ferrisInviteButton: document.querySelector("#ferrisInviteButton"),
  flyUpButton: document.querySelector("#flyUpButton"),
  flyDownButton: document.querySelector("#flyDownButton"),
  modal: document.querySelector("#modal"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  closeModal: document.querySelector("#closeModal")
};

let scene;
let camera;
let renderer;
let island;
let clock;
let roomGroup;
let swingSeatGroup;
let ferrisWheelGroup;
let ferrisCabinGroup;
let ferrisIconGroup;
let challengeStageGroup;
let renderedChallengeLevel = null;

const CHALLENGE_PLATFORMS = [
  { x: -52, y: 1.2, z: 36, w: 12, d: 8, color: 0xffc5dc },
  { x: -42, y: 4.2, z: 30, w: 9, d: 7, color: 0xbfe8ff },
  { x: -32, y: 7.4, z: 36, w: 8, d: 7, color: 0xd9c7ff },
  { x: -22, y: 10.6, z: 28, w: 8, d: 7, color: 0xffc5dc },
  { x: -12, y: 13.8, z: 34, w: 8, d: 7, color: 0xbfe8ff },
  { x: -2, y: 17, z: 27, w: 9, d: 7, color: 0xd9c7ff }
];
const CHALLENGE_BASE = { x: -760, y: 1.2, z: -720 };
const MAX_PLAYER_LEVEL = 100;
const MAX_CHALLENGE_STEP_Y = 2.8;
const CHALLENGE_STAGE_COLORS = [0xffc5dc, 0xbfe8ff, 0xd9c7ff];
const FERRIS_ICON_OPTIONS = [
  ["jump-cat", "方塊貓在跳"],
  ["cloud-cat", "方塊貓坐雲朵"],
  ["play-cats", "兩隻方塊貓玩"],
  ["star-cat", "星星方塊貓"],
  ["diamond-cat", "鑽石方塊貓"]
];
const HOUSE_PAINT_LOOKS = {
  red: { color: 0xff5a6c },
  orange: { color: 0xff9b3d },
  yellow: { color: 0xffd95a },
  green: { color: 0x67d88a },
  blue: { color: 0x62b7ff },
  electric: { color: 0x48f4ff, emissive: 0x0b5360 },
  purple: { color: 0xb78cff },
  rainbow: { texture: ["#ff5a6c", "#ff9b3d", "#ffd95a", "#67d88a", "#62b7ff", "#48f4ff", "#b78cff"] },
  "ruby-violet-blue": { texture: ["#ff5a6c", "#b78cff", "#62b7ff"] },
  "starry-night": { color: 0x11295f, emissive: 0x06142f, starry: true }
};

boot();

function boot() {
  connect();
  bindUi();
  initThree();
  animate();
  setInterval(sendInput, 50);
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  state.socket = new WebSocket(`${protocol}://${location.host}`);
  updateConnectionUi(false, "正在連上伺服器...");
  state.socket.addEventListener("open", () => {
    els.authError.classList.add("hidden");
    updateConnectionUi(true);
  });
  state.socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    handleServerMessage(message);
  });
  state.socket.addEventListener("close", () => {
    showNotice("連線中斷，請重新整理頁面。");
    updateConnectionUi(false, "伺服器連線中斷，正在重新連線...");
    setTimeout(connect, 1200);
  });
}

function bindUi() {
  els.startButton.addEventListener("click", () => showScreen("auth"));
  document.querySelectorAll("[data-screen='start']").forEach((button) => {
    button.addEventListener("click", () => showScreen("start"));
  });
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => openAuthForm(button.dataset.authMode));
  });
  els.guestButton.addEventListener("click", () => send("guest"));
  els.cancelAuth.addEventListener("click", () => {
    els.authForm.classList.add("hidden");
    els.authChoices.classList.remove("hidden");
    els.authError.classList.add("hidden");
  });
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (send(state.authMode === "create" ? "createAccount" : "login", { code: els.accountCode.value })) {
      showAuthStatus("正在登入...", false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input")) return;
    state.keys.add(event.code);
    if (event.code === "Space") {
      event.preventDefault();
      state.jump = true;
    }
    if (event.repeat) return;
    if (event.code === "KeyE") sendAction("stack");
    if (event.code === "KeyM") sendAction("attack");
  });
  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.code);
    if (event.code === "Space") state.jump = false;
  });

  bindJoystick();
  bindCameraDrag();
  holdButton(els.jumpButton, () => (state.jump = true), () => (state.jump = false));
  holdButton(els.flyUpButton, () => (state.flyY = 1), () => (state.flyY = 0));
  holdButton(els.flyDownButton, () => (state.flyY = -1), () => (state.flyY = 0));
  els.stackButton.addEventListener("click", () => sendAction("stack"));
  els.attackButton.addEventListener("click", () => sendAction("attack"));
  els.enterHouseButton.addEventListener("click", () => {
    const me = state.players.get(state.myId);
    send(me?.location === "room" ? "leaveHouse" : "enterHouse");
  });
  els.clearHouseActionButton.addEventListener("click", () => send("clearHouse"));
  els.searchBushButton.addEventListener("click", () => {
    const me = state.players.get(state.myId);
    const bush = nearestBush(me);
    if (bush) send("searchBush", { bushId: bush.id });
  });
  els.slideButton.addEventListener("click", () => send("slideDown"));
  els.swingButton.addEventListener("click", () => {
    const me = state.players.get(state.myId);
    send(me?.ride === "swing" ? "swingDismount" : "swingMount");
  });
  els.swingPumpButton.addEventListener("click", () => send("swingPump"));
  els.ferrisRideButton.addEventListener("click", () => {
    const me = state.players.get(state.myId);
    send(me?.ride === "ferris" ? "ferrisExit" : "ferrisRide");
  });
  els.ferrisCenterButton.addEventListener("click", () => {
    const me = state.players.get(state.myId);
    send(me?.ride === "ferrisCenter" ? "ferrisCenterLeave" : "ferrisCenterEnter");
  });
  els.ferrisIconButton.addEventListener("click", showFerrisIconModal);
  els.ferrisInviteButton.addEventListener("click", () => send("ferrisCenterInvite"));

  els.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    send("chat", { text: els.chatInput.value });
    els.chatInput.value = "";
  });
  els.voiceButton.addEventListener("click", startVoiceInput);
  els.coinCodeButton.addEventListener("click", showCoinModal);
  els.levelRewardsButton.addEventListener("click", showLevelRewardsModal);
  els.shopButton.addEventListener("click", showShopModal);
  els.bagButton.addEventListener("click", showBagModal);
  els.friendsButton.addEventListener("click", showFriendsModal);
  els.challengeButton.addEventListener("click", showChallengeModal);
  els.inviteFlyButton.addEventListener("click", () => send("flightInvite"));
  els.onlinePlayersButton.addEventListener("click", showOnlinePlayersModal);
  els.adminButton.addEventListener("click", showAdminModal);
  els.closeModal.addEventListener("click", closeModal);
}

function bindCameraDrag() {
  els.canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    state.cameraDrag = { active: true, pointerId: event.pointerId, x: event.clientX };
    els.canvas.setPointerCapture(event.pointerId);
    els.canvas.classList.add("dragging-camera");
  });
  els.canvas.addEventListener("pointermove", (event) => {
    if (!state.cameraDrag.active || state.cameraDrag.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.cameraDrag.x;
    state.cameraDrag.x = event.clientX;
    state.cameraYaw -= dx * 0.008;
  });
  const endDrag = (event) => {
    if (state.cameraDrag.pointerId !== event.pointerId) return;
    state.cameraDrag = { active: false, pointerId: null, x: 0 };
    els.canvas.classList.remove("dragging-camera");
  };
  els.canvas.addEventListener("pointerup", endDrag);
  els.canvas.addEventListener("pointercancel", endDrag);
  els.canvas.addEventListener("lostpointercapture", () => {
    state.cameraDrag = { active: false, pointerId: null, x: 0 };
    els.canvas.classList.remove("dragging-camera");
  });
}

function showScreen(name) {
  els.startScreen.classList.toggle("hidden", name !== "start");
  els.authScreen.classList.toggle("hidden", name !== "auth");
  els.gameScreen.classList.toggle("hidden", name !== "game");
}

function openAuthForm(mode) {
  state.authMode = mode;
  els.authChoices.classList.add("hidden");
  els.authForm.classList.remove("hidden");
  els.authError.classList.add("hidden");
  els.accountCode.value = "";
  els.authLabel.textContent = mode === "create" ? "創建新帳號亂碼" : "輸入已有帳號亂碼";
  els.authHint.textContent = mode === "create"
    ? "新帳號請用 1 到 10 個英文字或數字。"
    : "請輸入你之前創建的帳號亂碼。";
  els.accountCode.focus();
}

function handleServerMessage(message) {
  if (message.type === "hello") state.myId = message.sessionId;
  if (message.type === "authError") showAuthError(message);
  if (message.type === "authed") handleAuthed(message);
  if (message.type === "account") updateAccount(message);
  if (message.type === "state") updateWorldState(message);
  if (message.type === "chat") renderChat(message.chatLog);
  if (message.type === "notice") showNotice(message.message);
  if (message.type === "flightInvite") showFlightInvite(message);
  if (message.type === "ferrisCenterInvite") showFerrisCenterInvite(message);
}

function showAuthError(message) {
  els.authError.classList.remove("hidden");
  if (message.hostPasswordRequired) {
    state.pendingHostCode = message.accountCode;
    els.authError.innerHTML = `
      <form id="hostPasswordForm" class="list">
        <strong>${escapeHtml(message.message)}</strong>
        <input id="hostPasswordInput" type="password" autocomplete="current-password" placeholder="主機密碼" />
        <button class="primary-button" type="submit">登入主機</button>
      </form>
    `;
    document.querySelector("#hostPasswordForm").addEventListener("submit", (event) => {
      event.preventDefault();
      send("login", {
        code: state.pendingHostCode,
        hostPassword: document.querySelector("#hostPasswordInput").value
      });
    });
    document.querySelector("#hostPasswordInput").focus();
    return;
  }
  els.authError.innerHTML = `
    <strong>${escapeHtml(message.message)}</strong>
    ${message.missingAccount ? `
      <div class="row">
        <button id="missingGuest">訪客身份登入</button>
        <button id="missingCreate">創建新帳號</button>
      </div>
    ` : ""}
  `;
  document.querySelector("#missingGuest")?.addEventListener("click", () => send("guest"));
  document.querySelector("#missingCreate")?.addEventListener("click", () => openAuthForm("create"));
}

function showAuthStatus(message, isError) {
  els.authError.classList.remove("hidden");
  els.authError.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
  els.authError.classList.toggle("error-panel", isError);
}

function updateConnectionUi(isConnected, message = "") {
  els.authSubmitButton.disabled = !isConnected;
  els.guestButton.disabled = !isConnected;
  if (!isConnected && !els.authScreen.classList.contains("hidden") && message) {
    showAuthStatus(message, true);
  }
}

function handleAuthed(message) {
  state.myId = message.id;
  updateAccount(message);
  renderChat(message.chatLog || []);
  showScreen("game");
  resizeRenderer();
}

function updateAccount(message) {
  state.account = message.account;
  state.shopItems = message.shopItems || state.shopItems;
  state.levelRewards = message.levelRewards || state.levelRewards;
  state.coinCodes = message.coinCodes || state.coinCodes;
  state.titleCatalog = message.titleCatalog || state.titleCatalog;
  state.titleColors = message.titleColors || state.titleColors;
  state.titlePlayers = message.titlePlayers || state.titlePlayers;
  els.accountName.textContent = state.account.code;
  els.levelText.textContent = state.account.isHost ? "主機" : `Lv. ${state.account.level}`;
  els.coinAmount.textContent = state.account.isHost ? "金幣 ∞" : `金幣 ${state.account.coins}`;
  els.diamondAmount.textContent = state.account.isHost ? "鑽石 ∞" : `鑽石 ${Number(state.account.diamonds || 0)}`;
  els.onlinePlayersButton.classList.toggle("hidden", !state.account.isHost);
  els.adminButton.classList.toggle("hidden", !state.account.isHost);
  const hasWings = clientCanFly(state.account);
  els.flyUpButton.classList.toggle("hidden", !hasWings);
  els.flyDownButton.classList.toggle("hidden", !hasWings);
  els.inviteFlyButton.classList.toggle("hidden", !hasWings);
  if (!els.modal.classList.contains("hidden") && els.modalTitle.textContent === "好友") {
    showFriendsModal();
  }
  if (!els.modal.classList.contains("hidden") && els.modalTitle.textContent === "等級獎勵") {
    showLevelRewardsModal();
  }
  if (!els.modal.classList.contains("hidden") && els.modalTitle.textContent === "新增 Password") {
    showAdminModal();
  }
  if (!state.account.isHost && !state.account.survivalMode) {
    showSurvivalModeModal();
  } else if (shouldShowAdultIntro()) {
    showAdultIntroModal();
  }
}

function clientCanFly(account) {
  return String(account?.equipped?.clothes || "").includes("wings");
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1018);
  scene.fog = new THREE.Fog(0x0b1018, 70, 180);
  camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  clock = new THREE.Clock();

  const ambient = new THREE.HemisphereLight(0xb7efff, 0x233820, 2.2);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 2.8);
  sun.position.set(20, 40, 10);
  scene.add(sun);

  createStars();
  createIsland();
  createPlayground();
  createRoom();
  createChallengeStage();
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
}

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 900; i += 1) {
    positions.push((Math.random() - 0.5) * 360, Math.random() * 180 - 30, (Math.random() - 0.5) * 360);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xddefff, size: 0.65, sizeAttenuation: true });
  scene.add(new THREE.Points(geometry, material));
}

function createIsland() {
  const geometry = new THREE.CylinderGeometry(118, 92, 12, 96);
  const material = new THREE.MeshStandardMaterial({ color: 0xbfdff8, roughness: 0.86 });
  island = new THREE.Mesh(geometry, material);
  island.position.y = -6;
  scene.add(island);

  [
    { color: 0xffc5dc, start: 0 },
    { color: 0xbfe8ff, start: (Math.PI * 2) / 3 },
    { color: 0xd9c7ff, start: (Math.PI * 4) / 3 }
  ].forEach((slice) => {
    const top = new THREE.Mesh(
      new THREE.CircleGeometry(116.8, 64, slice.start, (Math.PI * 2) / 3),
      new THREE.MeshStandardMaterial({ color: slice.color, roughness: 0.74, side: THREE.DoubleSide })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.08;
    scene.add(top);
  });

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(88, 3, 10, 96),
    new THREE.MeshStandardMaterial({ color: 0xf4e9ff, roughness: 0.8 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.2;
  scene.add(rim);

  const river = new THREE.Mesh(
    new THREE.BoxGeometry(184, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0x62b7ff, roughness: 0.28, transparent: true, opacity: 0.72 })
  );
  river.position.set(0, 0.28, 8);
  scene.add(river);
}

function createPlayground() {
  addSlide(-24, 0, -20);
  addSwing(12, 0, -28);
  addFerrisWheel(-38, 0, -52);
  addChallengeCourse();
  for (let i = 0; i < 18; i += 1) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 5 + Math.random() * 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x6a4b34 })
    );
    post.position.set(Math.random() * 120 - 60, 2, Math.random() * 120 - 60);
    scene.add(post);
  }
}

function addFerrisWheel(x, y, z) {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.5 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.55 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xfff1a8, roughness: 0.5 });

  for (const sx of [-6, 6]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 18, 0.7), frameMaterial);
    leg.position.set(sx, 8.5, 0);
    leg.rotation.z = sx < 0 ? -0.34 : 0.34;
    group.add(leg);
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 5), pink);
  base.position.set(0, 0.55, 0);
  group.add(base);

  ferrisWheelGroup = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.32, 12, 80), frameMaterial);
  ferrisWheelGroup.add(ring);
  for (let index = 0; index < 8; index += 1) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.22, 17.5, 0.22), frameMaterial);
    spoke.rotation.z = (index * Math.PI) / 8;
    ferrisWheelGroup.add(spoke);
  }
  const hub = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.25, 12, 40), yellow);
  ferrisWheelGroup.add(hub);
  ferrisCabinGroup = new THREE.Group();
  ferrisWheelGroup.add(ferrisCabinGroup);
  ferrisIconGroup = new THREE.Group();
  ferrisIconGroup.position.z = 0.45;
  ferrisWheelGroup.add(ferrisIconGroup);
  ferrisWheelGroup.position.y = 11.5;
  group.add(ferrisWheelGroup);

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.45, 24), new THREE.MeshStandardMaterial({ color: 0xd9c7ff, roughness: 0.6 }));
  platform.position.set(0, 12.7, 1.8);
  group.add(platform);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.12, 8, 40), frameMaterial);
  rail.position.set(0, 13.45, 1.8);
  rail.rotation.x = Math.PI / 2;
  group.add(rail);

  group.position.set(x, y, z);
  scene.add(group);
}

function addSlide(x, y, z) {
  const group = new THREE.Group();
  const pink = new THREE.MeshStandardMaterial({ color: 0xff9fc2, roughness: 0.55 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x8ed7ff, roughness: 0.55 });
  const purple = new THREE.MeshStandardMaterial({ color: 0xcdb7ff, roughness: 0.62 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(7, 1, 6), purple);
  deck.position.set(-4, 5, 0);
  group.add(deck);

  const slide = new THREE.Mesh(new THREE.BoxGeometry(14, 0.7, 4.2), pink);
  slide.rotation.z = -0.38;
  slide.position.set(3, 3.1, 0);
  group.add(slide);

  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.55, 0.35), blue);
  railLeft.rotation.z = -0.38;
  railLeft.position.set(3, 3.75, -2.25);
  group.add(railLeft);
  const railRight = railLeft.clone();
  railRight.position.z = 2.25;
  group.add(railRight);

  for (const sx of [-6.8, -1.2]) {
    for (const sz of [-2.4, 2.4]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.2, 0.6), blue);
      leg.position.set(sx, 2.4, sz);
      group.add(leg);
    }
  }

  for (let i = 0; i < 5; i += 1) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 0.7), pink);
    step.position.set(-9.2, 0.8 + i * 0.8, -1.8 + i * 0.12);
    group.add(step);
  }

  group.position.set(x, y, z);
  scene.add(group);
}

function addSwing(x, y, z) {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.5 });
  const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.55 });
  const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f0ff, roughness: 0.7 });

  const top = new THREE.Mesh(new THREE.BoxGeometry(12, 0.55, 0.55), frameMaterial);
  top.position.y = 7.2;
  group.add(top);
  for (const sx of [-5.4, 5.4]) {
    const legA = new THREE.Mesh(new THREE.BoxGeometry(0.55, 7.4, 0.55), frameMaterial);
    legA.position.set(sx, 3.5, -2.2);
    legA.rotation.z = sx < 0 ? -0.14 : 0.14;
    group.add(legA);
    const legB = legA.clone();
    legB.position.z = 2.2;
    group.add(legB);
  }

  swingSeatGroup = new THREE.Group();
  for (const sx of [-2.2, 2.2]) {
    const rope = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.8, 0.16), ropeMaterial);
    rope.position.set(sx, 4.7, 0);
    swingSeatGroup.add(rope);
  }
  const seat = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.45, 2.1), seatMaterial);
  seat.position.set(0, 2.1, 0);
  swingSeatGroup.add(seat);
  group.add(swingSeatGroup);

  group.position.set(x, y, z);
  scene.add(group);
}

function addChallengeCourse() {
  for (const platform of CHALLENGE_PLATFORMS) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(platform.w, 0.8, platform.d),
      new THREE.MeshStandardMaterial({ color: platform.color, roughness: 0.64 })
    );
    mesh.position.set(platform.x, platform.y, platform.z);
    scene.add(mesh);
  }
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(10, 5, 1),
    new THREE.MeshStandardMaterial({ color: 0x6b4f8f, roughness: 0.55 })
  );
  sign.position.set(-58, 3.2, 28);
  scene.add(sign);
}

function createRoom() {
  roomGroup = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(72, 0.8, 72),
    new THREE.MeshStandardMaterial({ color: 0xf3d8ff, roughness: 0.72 })
  );
  floor.position.set(220, 0.35, 0);
  roomGroup.add(floor);
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(72, 18, 1),
    new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.7 })
  );
  backWall.position.set(220, 9, -36);
  roomGroup.add(backWall);
  const sideWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 18, 72),
    new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.7 })
  );
  sideWall.position.set(184, 9, 0);
  roomGroup.add(sideWall);
  const lamp = new THREE.PointLight(0xfff2d0, 2.8, 90);
  lamp.position.set(220, 20, 8);
  roomGroup.add(lamp);
  scene.add(roomGroup);
}

function updateWorldState(message) {
  const players = message.players || [];
  const coins = message.coins || [];
  const houses = message.houses || [];
  const swing = message.swing;
  const bushes = message.bushes || [];
  const ferris = message.ferris;
  state.ferris = ferris || state.ferris;
  state.totalAccounts = Number(message.totalAccounts || state.totalAccounts || 0);
  const ids = new Set(players.map((player) => player.id));
  for (const [id, mesh] of state.meshes) {
    if (!ids.has(id)) {
      if (mesh.userData.trailGroup) scene.remove(mesh.userData.trailGroup);
      scene.remove(mesh);
      state.meshes.delete(id);
      state.players.delete(id);
    }
  }
  players.forEach((player) => {
    state.players.set(player.id, player);
    if (!state.meshes.has(player.id)) {
      const mesh = createCatMesh(player);
      state.meshes.set(player.id, mesh);
      scene.add(mesh);
    }
    updateCatMesh(state.meshes.get(player.id), player);
  });
  const me = state.players.get(state.myId);
  updateCoinMeshes(coins);
  updateSurvivalPickupMeshes(message.survivalPickups || []);
  updateHazardMeshes(message.survivalHazards || [], me);
  updateBushMeshes(bushes);
  updateHouseMeshes(houses);
  updateSwingMesh(swing);
  updateFerrisMesh(state.ferris);
  updateChallengeStage(me?.challengeLevel || state.account?.level || 1);
  if (!els.modal.classList.contains("hidden") && els.modalTitle.textContent === "在線玩家") {
    showOnlinePlayersModal();
  }
  els.enterHouseButton.textContent = me?.location === "room" ? "離開" : "進入";
  els.swingButton.textContent = me?.ride === "swing" ? "下鞦韆" : "上鞦韆";
  updateTeamStatus(me);
  updateSurvivalHud(me);
  updateActionButtons(me, houses, bushes, message.survivalHazards || []);
  updateRoomFurniture(me?.roomItems || []);
}

function updateTeamStatus(me) {
  const names = me?.teammates || [];
  els.teamStatus.textContent = names.length ? `組隊：${names.join("、")}` : "未組隊";
  els.teamStatus.classList.toggle("hidden", !names.length);
}

function updateSurvivalHud(me) {
  const show = me?.survivalMode === "adult";
  els.survivalHud.classList.toggle("hidden", !show);
  if (!show) return;
  const hunger = Math.round(Number(me.hunger ?? 100));
  const thirst = Math.round(Number(me.thirst ?? 100));
  els.hungerText.textContent = `飽 ${hunger}%`;
  els.thirstText.textContent = `水 ${thirst}%`;
  els.survivalHud.style.setProperty("--hunger", `${hunger}%`);
  els.survivalHud.style.setProperty("--thirst", `${thirst}%`);
}

function updateActionButtons(me, houses, bushes = [], hazards = []) {
  if (!me) return;
  const nearPlayer = [...state.players.values()].some((player) => {
    if (player.id === state.myId || player.location !== me.location) return false;
    return Math.hypot(player.x - me.x, player.z - me.z) < 4.5;
  });
  const canSeeMonsters = me.isHost || me.survivalMode === "adult";
  const nearMonster = canSeeMonsters && hazards.some((hazard) => {
    if (hazard.dead) return false;
    return Math.hypot(hazard.x - me.x, hazard.z - me.z) < 5.5;
  });
  const ownHouse = houses.find((house) => house.owner === state.account?.code);
  const nearHouse = ownHouse && Math.hypot(ownHouse.x - me.x, ownHouse.z - me.z) < 6;
  const nearSwing = Math.hypot(12 - me.x, -28 - me.z) < 7;
  const ferris = state.ferris;
  const nearFerris = me.location === "island" && ferris && Math.hypot(ferris.x - me.x, ferris.z - me.z) < 13;
  const controlsFerris = state.account?.code && ferris?.richestCode === state.account.code;
  const canUseFerrisCenter = controlsFerris || me.ride === "ferrisCenter" || ferris?.platformGuests?.includes(state.myId);
  const nearSlideTop = me.location === "island" && Math.hypot(me.x + 28, me.z + 20) < 5.5 && me.y > 4.6;
  const nearBush = Boolean(nearestBush(me, bushes));
  const canUseStack = nearPlayer || Boolean(me.carrying) || Boolean(me.carriedBy);

  els.stackButton.textContent = me.carrying ? "放下來" : me.carriedBy ? "跳下來" : "疊疊樂";
  els.stackButton.classList.toggle("hidden", !canUseStack);
  els.attackButton.classList.toggle("hidden", !(nearPlayer || nearMonster));
  els.enterHouseButton.classList.toggle("hidden", !(me.location === "room" || nearHouse));
  els.clearHouseActionButton.classList.toggle("hidden", me.location !== "room");
  els.searchBushButton.classList.toggle("hidden", !(me.location === "island" && nearBush));
  els.slideButton.classList.toggle("hidden", !nearSlideTop);
  els.swingButton.classList.toggle("hidden", !(me.ride === "swing" || (me.location === "island" && nearSwing)));
  els.swingPumpButton.classList.toggle("hidden", me.ride !== "swing");
  els.ferrisRideButton.textContent = me.ride === "ferris" ? "離開摩天輪" : "進入摩天輪";
  els.ferrisRideButton.classList.toggle("hidden", !(me.ride === "ferris" || nearFerris));
  els.ferrisCenterButton.textContent = me.ride === "ferrisCenter" ? "離開平台" : "上中心平台";
  els.ferrisCenterButton.classList.toggle("hidden", !(nearFerris && canUseFerrisCenter));
  els.ferrisIconButton.classList.toggle("hidden", !(nearFerris && controlsFerris));
  els.ferrisInviteButton.classList.toggle("hidden", !(nearFerris && controlsFerris));
}

function nearestBush(me, bushes = null) {
  if (!me) return null;
  let best = null;
  let bestDistance = Infinity;
  const list = bushes || [...state.bushMeshes.values()].map((mesh) => mesh.userData.bush).filter(Boolean);
  for (const bush of list) {
    if (bush.searched) continue;
    const distance = Math.hypot(bush.x - me.x, bush.z - me.z);
    if (distance < 4.2 && distance < bestDistance) {
      best = bush;
      bestDistance = distance;
    }
  }
  return best;
}

function createCatMesh(player) {
  const group = new THREE.Group();
  const palette = catPalette(player.catVariant);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.58 })
  );
  body.name = "catBody";
  body.userData.baseColor = palette.body;
  body.position.y = 0.6;
  group.add(body);

  if (player.catVariant === "calico") {
    addPatch(group, -0.42, 0.82, 0.84, 0x2c231f);
    addPatch(group, 0.36, 0.44, 0.84, 0xd77a2d);
  }

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 0.72),
    new THREE.MeshBasicMaterial({ map: makeFaceTexture(palette.face), transparent: true })
  );
  face.position.set(0, 0.68, 0.83);
  group.add(face);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 1.35, 12),
    new THREE.MeshStandardMaterial({ color: 0xff8fb3, roughness: 0.6 })
  );
  tail.position.set(0, 0.62, -1.18);
  tail.rotation.x = Math.PI / 2.6;
  tail.visible = false;
  group.add(tail);

  const hatGroup = new THREE.Group();
  group.add(hatGroup);
  const clothesGroup = new THREE.Group();
  group.add(clothesGroup);
  const petGroup = new THREE.Group();
  group.add(petGroup);

  const earMaterial = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.7 });
  const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 4), earMaterial);
  leftEar.name = "catEar";
  leftEar.userData.baseColor = palette.body;
  leftEar.position.set(-0.55, 1.45, 0.2);
  leftEar.rotation.y = Math.PI / 4;
  group.add(leftEar);
  const rightEar = leftEar.clone();
  rightEar.name = "catEar";
  rightEar.userData.baseColor = palette.body;
  rightEar.position.x = 0.55;
  group.add(rightEar);

  const label = document.createElement("canvas");
  label.width = 256;
  label.height = 64;
  const texture = new THREE.CanvasTexture(label);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.y = 2.4;
  sprite.scale.set(4, 1, 1);
  group.add(sprite);
  const trailGroup = new THREE.Group();
  scene.add(trailGroup);
  group.userData = { label, texture, sprite, tail, hatGroup, clothesGroup, petGroup, lastName: "", trailGroup, trailPoints: [] };
  return group;
}

function addPatch(group, x, y, z, color) {
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.38),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
  patch.position.set(x, y, z + 0.012);
  group.add(patch);
}

function catPalette(variant) {
  return {
    host: { body: 0x8ed7ff, face: "#eaf8ff" },
    black: { body: 0x25282e, face: "#f5f1e8" },
    white: { body: 0xf6f2e9, face: "#ffffff" },
    calico: { body: 0xf5eee0, face: "#fff8ef" },
    orange: { body: 0xe88a35, face: "#ffe0b4" }
  }[variant] || { body: 0xf6f2e9, face: "#ffffff" };
}

function makeFaceTexture(faceColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = faceColor;
  roundRect(ctx, 18, 12, 220, 104, 28);
  ctx.fill();

  ctx.fillStyle = "#211a16";
  ctx.beginPath();
  ctx.arc(88, 56, 10, 0, Math.PI * 2);
  ctx.arc(168, 56, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#211a16";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(128, 70);
  ctx.quadraticCurveTo(116, 88, 96, 78);
  ctx.moveTo(128, 70);
  ctx.quadraticCurveTo(140, 88, 160, 78);
  ctx.stroke();

  ctx.strokeStyle = "rgba(33, 26, 22, 0.55)";
  ctx.lineWidth = 4;
  [[48, 66, 18], [48, 82, 18], [208, 66, -18], [208, 82, -18]].forEach(([x, y, len]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y - 4);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function updateCoinMeshes(coins) {
  const activeCoins = coins.filter((coin) => !coin.taken);
  const ids = new Set(activeCoins.map((coin) => coin.id));
  for (const [id, mesh] of state.coinMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.coinMeshes.delete(id);
    }
  }
  for (const coin of activeCoins) {
    if (!state.coinMeshes.has(coin.id)) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.14, 24),
        new THREE.MeshStandardMaterial({ color: 0xffcf32, metalness: 0.45, roughness: 0.28 })
      );
      mesh.rotation.x = Math.PI / 2;
      state.coinMeshes.set(coin.id, mesh);
      scene.add(mesh);
    }
    const mesh = state.coinMeshes.get(coin.id);
    mesh.position.set(coin.x, coin.y + Math.sin(Date.now() * 0.006 + coin.x) * 0.16, coin.z);
    mesh.rotation.z += 0.08;
  }
}

function updateSurvivalPickupMeshes(pickups) {
  const active = pickups.filter((pickup) => !pickup.taken);
  const ids = new Set(active.map((pickup) => pickup.id));
  for (const [id, mesh] of state.survivalPickupMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.survivalPickupMeshes.delete(id);
    }
  }
  for (const pickup of active) {
    if (!state.survivalPickupMeshes.has(pickup.id)) {
      const mesh = createSurvivalPickupMesh(pickup.kind);
      state.survivalPickupMeshes.set(pickup.id, mesh);
      scene.add(mesh);
    }
    const mesh = state.survivalPickupMeshes.get(pickup.id);
    mesh.position.set(pickup.x, pickup.y, pickup.z);
    mesh.rotation.y += 0.03;
  }
}

function createSurvivalPickupMesh(kind) {
  return new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.65), new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.55 }));
}

function updateHazardMeshes(hazards, me) {
  const canSeeMonsters = me?.isHost || me?.survivalMode === "adult";
  const activeHazards = canSeeMonsters ? hazards.filter((hazard) => !hazard.dead) : [];
  const ids = new Set(activeHazards.map((hazard) => hazard.id));
  for (const [id, mesh] of state.hazardMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.hazardMeshes.delete(id);
    }
  }
  for (const hazard of activeHazards) {
    if (!state.hazardMeshes.has(hazard.id)) {
      const mesh = createMonsterMesh();
      state.hazardMeshes.set(hazard.id, mesh);
      scene.add(mesh);
    }
    const mesh = state.hazardMeshes.get(hazard.id);
    mesh.position.set(hazard.x, hazard.y, hazard.z);
    mesh.scale.set(1.15, 0.82 + Math.abs(Math.sin(Date.now() * 0.006)) * 0.35, 1.15);
    updateMonsterFlash(mesh, hazard);
  }
}

function createMonsterMesh() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 12), new THREE.MeshStandardMaterial({ color: 0xfff1a8, roughness: 0.45 }));
  body.userData.baseColor = 0xfff1a8;
  group.add(body);
  [-0.35, 0.35].forEach((x) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xd9c7ff, roughness: 0.5 }));
    horn.position.set(x, 0.82, 0);
    group.add(horn);
  });
  return group;
}

function updateMonsterFlash(group, hazard) {
  const hit = Number(hazard.hitUntil || 0) > Date.now();
  group.traverse((part) => {
    if (!part.isMesh || part.userData.baseColor === undefined) return;
    part.material.color.setHex(hit ? 0xff4f5f : part.userData.baseColor);
  });
}

function updateBushMeshes(bushes) {
  const visibleBushes = bushes.filter((bush) => !bush.searched);
  const ids = new Set(visibleBushes.map((bush) => bush.id));
  for (const [id, mesh] of state.bushMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.bushMeshes.delete(id);
    }
  }
  for (const bush of visibleBushes) {
    if (!state.bushMeshes.has(bush.id)) {
      const mesh = createBushMesh();
      state.bushMeshes.set(bush.id, mesh);
      scene.add(mesh);
    }
    const mesh = state.bushMeshes.get(bush.id);
    mesh.userData.bush = bush;
    mesh.position.set(bush.x, bush.y, bush.z);
    mesh.rotation.y += 0.004;
  }
}

function createBushMesh() {
  const group = new THREE.Group();
  const colors = [0x2f8f5b, 0x46b46c, 0x7ed982];
  const offsets = [
    [0, 0.55, 0],
    [-0.8, 0.45, 0.2],
    [0.75, 0.42, -0.15],
    [0.1, 0.86, -0.52],
    [-0.2, 0.28, 0.72]
  ];
  offsets.forEach(([x, y, z], index) => {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(index === 0 ? 0.95 : 0.7, 12, 8),
      new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.84 })
    );
    leaf.position.set(x, y, z);
    group.add(leaf);
  });
  const sparkle = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ color: 0x8ed7ff, emissive: 0x17527a, roughness: 0.35 })
  );
  sparkle.position.set(0.2, 1.4, 0.1);
  group.add(sparkle);
  return group;
}

function updateHouseMeshes(houses) {
  const ids = new Set(houses.map((house) => house.owner));
  for (const [id, mesh] of state.houseMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.houseMeshes.delete(id);
    }
  }
  for (const house of houses) {
    if (!state.houseMeshes.has(house.owner)) {
      const mesh = createHouseMesh(house.owner);
      state.houseMeshes.set(house.owner, mesh);
      scene.add(mesh);
    }
    const mesh = state.houseMeshes.get(house.owner);
    mesh.position.set(house.x, house.y, house.z);
    mesh.rotation.y = house.yaw || 0;
    updateHousePaint(mesh, house.paint || {});
  }
}

function createHouseMesh(owner) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7, 5, 7),
    new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.68 })
  );
  body.name = "body";
  body.position.y = 2.5;
  group.add(body);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5.8, 3.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xd9c7ff, roughness: 0.62 })
  );
  roof.name = "roof";
  roof.position.y = 6.8;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 2.7, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x8ed7ff, roughness: 0.6 })
  );
  door.position.set(0, 1.35, 3.6);
  group.add(door);
  group.userData.owner = owner;
  return group;
}

function updateHousePaint(group, paint) {
  const body = group.getObjectByName("body");
  const roof = group.getObjectByName("roof");
  setPaintMaterial(body, paint.body || "default-body");
  setPaintMaterial(roof, paint.roof || "default-roof");
  updateStarryLayer(group, body, "body", paint.body === "starry-night");
  updateStarryLayer(group, roof, "roof", paint.roof === "starry-night");
}

function setPaintMaterial(mesh, paintId) {
  const look = HOUSE_PAINT_LOOKS[paintId];
  const cacheKey = look ? paintId : mesh.name === "roof" ? "default-roof" : "default-body";
  if (mesh.userData.paintKey === cacheKey) return;
  mesh.userData.paintKey = cacheKey;
  if (!look) {
    mesh.material = new THREE.MeshStandardMaterial({
      color: mesh.name === "roof" ? 0xd9c7ff : 0xffc5dc,
      roughness: 0.64
    });
    return;
  }
  mesh.material = new THREE.MeshStandardMaterial({
    color: look.color || 0xffffff,
    emissive: look.emissive || 0x000000,
    map: look.texture ? makePaintTexture(look.texture) : null,
    roughness: 0.58
  });
}

function makePaintTexture(colors) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 128, 128);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(1, colors.length - 1), color);
  });
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function updateStarryLayer(group, mesh, part, isVisible) {
  const key = `${part}Stars`;
  if (!group.userData[key]) {
    group.userData[key] = createStarryLayer(part);
    group.add(group.userData[key]);
  }
  const layer = group.userData[key];
  layer.visible = isVisible;
  if (!isVisible) return;
  layer.children.forEach((star, index) => {
    star.material.opacity = 0.35 + Math.sin(Date.now() * 0.006 + index) * 0.28 + 0.28;
  });
}

function createStarryLayer(part) {
  const layer = new THREE.Group();
  const positions = part === "roof"
    ? [[0, 7.35, 3.2], [-1.6, 6.7, 3.45], [1.7, 6.35, 3.3], [0.9, 7.6, 2.2], [-0.8, 6.05, 3.8]]
    : [[-2.2, 4.2, 3.62], [0, 3.1, 3.62], [2.1, 4.4, 3.62], [-1.1, 1.8, 3.62], [1.3, 2.1, 3.62], [0.8, 4.9, 3.62]];
  for (const [x, y, z] of positions) {
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: 0xfff7b8, transparent: true, opacity: 0.8 })
    );
    star.position.set(x, y, z);
    layer.add(star);
  }
  return layer;
}

function updateRoomFurniture(items) {
  const ids = new Set(items.map((item) => item.id));
  for (const [id, mesh] of state.furnitureMeshes) {
    if (!ids.has(id)) {
      scene.remove(mesh);
      state.furnitureMeshes.delete(id);
    }
  }
  for (const item of items) {
    if (!state.furnitureMeshes.has(item.id)) {
      const mesh = createFurnitureMesh(item.itemId);
      state.furnitureMeshes.set(item.id, mesh);
      scene.add(mesh);
    }
    state.furnitureMeshes.get(item.id).position.set(item.x, item.y, item.z);
  }
}

function createFurnitureMesh(itemId) {
  const palette = furniturePalette(itemId);
  const material = new THREE.MeshStandardMaterial({
    color: palette.color,
    roughness: 0.58,
    emissive: palette.glow ? palette.color : 0x000000,
    emissiveIntensity: palette.glow ? 0.22 : 0
  });

  if (itemId.includes("bed") || itemId.includes("sofa") || itemId.includes("beanbag")) {
    return new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 3.3), material);
  }
  if (itemId.includes("table") || itemId.includes("desk") || itemId.includes("stand") || itemId.includes("tea")) {
    return makeTable(material);
  }
  if (itemId.includes("chair") || itemId.includes("stool") || itemId.includes("pillow") || itemId.includes("cushion")) {
    return new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 1.1, 18), material);
  }
  if (itemId.includes("lamp") || itemId.includes("lantern") || itemId.includes("light")) {
    return makeLamp(material, palette.color);
  }
  if (itemId.includes("plant")) {
    return makePlant(material);
  }
  if (itemId.includes("rug") || itemId.includes("carpet") || itemId.includes("mat")) {
    const rug = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 3.2), material);
    rug.position.y = 0.08;
    return rug;
  }
  if (itemId.includes("shelf") || itemId.includes("cabinet") || itemId.includes("drawer") || itemId.includes("wardrobe") || itemId.includes("fridge")) {
    return new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 1.4), material);
  }
  if (itemId.includes("poster") || itemId.includes("window") || itemId.includes("curtain") || itemId.includes("garland")) {
    return new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.18), material);
  }
  if (itemId.includes("tv") || itemId.includes("mirror") || itemId.includes("clock")) {
    return new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.35), material);
  }
  if (itemId.includes("piano") || itemId.includes("kitchen") || itemId.includes("bathtub")) {
    return new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.1, 2.4), material);
  }
  if (itemId.includes("fishbowl") || itemId.includes("snow")) {
    return new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 14), material);
  }
  return new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), material);
}

function furniturePalette(itemId) {
  const colors = [0xffc5dc, 0xbfe8ff, 0xd9c7ff, 0xfff1a8, 0x66d9a6, 0xffb47f, 0xffffff];
  let hash = 0;
  for (const char of itemId) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return {
    color: colors[hash % colors.length],
    glow: itemId.includes("lamp") || itemId.includes("lantern") || itemId.includes("moon") || itemId.includes("star")
  };
}

function makeTable(material) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.35, 18), material);
  top.position.y = 1.4;
  group.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.4, 10), material);
  leg.position.y = 0.7;
  group.add(leg);
  return group;
}

function makeLamp(material, color) {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2, 10), material);
  stand.position.y = 1;
  group.add(stand);
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.78 }));
  shade.position.y = 2.25;
  group.add(shade);
  return group;
}

function makePlant(material) {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.55, 0.9, 12), material);
  pot.position.y = 0.45;
  group.add(pot);
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x66d9a6, roughness: 0.6 }));
  leaves.position.y = 1.4;
  group.add(leaves);
  return group;
}

function updateSwingMesh(swing) {
  if (!swingSeatGroup || !swing) return;
  swingSeatGroup.rotation.z = swing.angle || 0;
}

function updateFerrisMesh(ferris) {
  if (!ferrisWheelGroup || !ferris) return;
  ferrisWheelGroup.rotation.z = ferris.angle || 0;
  ferrisIconGroup.rotation.z = -(ferris.angle || 0);
  ferrisCabinGroup.clear();
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.55 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.5 });
  for (let index = 0; index < ferris.seats; index += 1) {
    const angle = (index * Math.PI * 2) / ferris.seats;
    const cabin = new THREE.Group();
    cabin.position.set(Math.sin(angle) * ferris.radius, -Math.cos(angle) * ferris.radius, 0);
    cabin.rotation.z = -(ferris.angle || 0);
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2), cabinMaterial);
    cabin.add(box);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.8, 4), roofMaterial);
    roof.position.y = 0.95;
    roof.rotation.y = Math.PI / 4;
    cabin.add(roof);
    ferrisCabinGroup.add(cabin);
  }
  updateFerrisIcon(ferris.icon || "jump-cat");
}

function updateFerrisIcon(icon) {
  if (!ferrisIconGroup) return;
  ferrisIconGroup.clear();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xffc5dc, roughness: 0.55 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.55 });
  const addMiniCat = (x, y, color = bodyMaterial) => {
    const cat = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.58, 0.2), color);
    cat.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.2), color);
    head.position.y = 0.5;
    cat.add(head);
    [-0.2, 0.2].forEach((earX) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 4), color);
      ear.position.set(earX, 0.8, 0);
      ear.rotation.y = Math.PI / 4;
      cat.add(ear);
    });
    cat.position.set(x, y, 0);
    ferrisIconGroup.add(cat);
    return cat;
  };
  if (icon === "cloud-cat") {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 10), blueMaterial);
    cloud.scale.set(1.6, 0.45, 0.25);
    cloud.position.y = -0.45;
    ferrisIconGroup.add(cloud);
    addMiniCat(0, 0.15);
  } else if (icon === "play-cats") {
    addMiniCat(-0.55, -0.05, bodyMaterial).rotation.z = -0.18;
    addMiniCat(0.55, -0.05, accentMaterial).rotation.z = 0.18;
  } else if (icon === "star-cat") {
    const star = new THREE.Mesh(new THREE.CircleGeometry(1, 5), new THREE.MeshStandardMaterial({ color: 0xfff1a8, roughness: 0.45 }));
    star.rotation.z = Math.PI / 5;
    ferrisIconGroup.add(star);
    addMiniCat(0, 0.05);
  } else if (icon === "diamond-cat") {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), new THREE.MeshStandardMaterial({ color: 0x8ed7ff, roughness: 0.35 }));
    gem.scale.z = 0.2;
    ferrisIconGroup.add(gem);
    addMiniCat(0, 0.05, accentMaterial);
  } else {
    const cat = addMiniCat(0, 0.05);
    cat.rotation.z = -0.35;
  }
}

function getChallengePlatforms(level = 1) {
  const difficulty = clampChallengeLevel(level);
  const start = challengeStartForLevel(difficulty);
  const length = 7 + Math.floor((difficulty - 1) / 20);
  const stepX = 7.2 + Math.min(1.8, difficulty * 0.018);
  const stepY = Math.min(MAX_CHALLENGE_STEP_Y, 1.75 + difficulty * 0.011);
  const zSpread = Math.min(18, 3 + difficulty * 0.15);
  const width = Math.max(4.8, 13 - difficulty * 0.07);
  const depth = Math.max(4.2, 9 - difficulty * 0.05);
  return Array.from({ length }, (_, index) => ({
    x: start.x + index * stepX,
    y: Number((start.y + index * stepY).toFixed(3)),
    z: start.z + (index === 0 ? 0 : (index % 2 === 0 ? 1 : -1) * Math.min(zSpread, 2 + index * 1.15)),
    w: index === 0 ? 17 : width,
    d: index === 0 ? 10 : depth,
    color: CHALLENGE_STAGE_COLORS[index % CHALLENGE_STAGE_COLORS.length]
  }));
}

function challengeStartForLevel(level = 1) {
  const difficulty = clampChallengeLevel(level);
  return {
    x: CHALLENGE_BASE.x - (difficulty - 1) * 130,
    y: CHALLENGE_BASE.y,
    z: CHALLENGE_BASE.z - (difficulty % 5) * 110
  };
}

function challengeFinishForLevel(level) {
  const platforms = getChallengePlatforms(level);
  const last = platforms.at(-1);
  return { x: last.x + 4, y: last.y + 2.2, z: last.z };
}

function clampChallengeLevel(level = 1) {
  const number = Number(level);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(MAX_PLAYER_LEVEL, Math.floor(number)));
}

function createChallengeStage(level = 1) {
  challengeStageGroup = new THREE.Group();
  scene.add(challengeStageGroup);
  updateChallengeStage(level);
}

function updateChallengeStage(level = 1) {
  const difficulty = clampChallengeLevel(level);
  if (!challengeStageGroup || renderedChallengeLevel === difficulty) return;
  renderedChallengeLevel = difficulty;
  challengeStageGroup.clear();
  const platforms = getChallengePlatforms(difficulty);
  const first = platforms[0];
  const last = platforms.at(-1);
  const stageWidth = Math.max(112, last.x - first.x + 36);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(stageWidth, 1, 68),
    new THREE.MeshStandardMaterial({ color: 0x1b2030, roughness: 0.8 })
  );
  const start = challengeStartForLevel(difficulty);
  base.position.set((first.x + last.x) / 2, -3, start.z);
  challengeStageGroup.add(base);
  for (const platform of platforms) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(platform.w, 0.8, platform.d),
      new THREE.MeshStandardMaterial({ color: platform.color, roughness: 0.62 })
    );
    mesh.position.set(platform.x, platform.y, platform.z);
    challengeStageGroup.add(mesh);
  }
  const finishPosition = challengeFinishForLevel(difficulty);
  const finish = new THREE.Mesh(
    new THREE.BoxGeometry(8, 8, 1),
    new THREE.MeshStandardMaterial({ color: 0xfff1a8, roughness: 0.45 })
  );
  finish.position.set(finishPosition.x, finishPosition.y, finishPosition.z);
  challengeStageGroup.add(finish);
}

function updateCatMesh(mesh, player) {
  mesh.position.set(player.x, player.y, player.z);
  mesh.rotation.y = player.yaw;
  const baseScale = player.survivalMode === "adult" ? 1.15 : 1;
  mesh.scale.setScalar(baseScale * (player.id === state.myId ? 1.12 : 1));
  if (mesh.userData.tail) {
    updateTailMesh(mesh.userData.tail, player.equipped?.tail);
  }
  updateHatMesh(mesh.userData.hatGroup, player.equipped?.hat);
  updateClothesMesh(mesh.userData.clothesGroup, player.equipped?.clothes);
  updatePetMesh(mesh.userData.petGroup, player);
  updateTrail(mesh, player);
  updateHitFlash(mesh, player);
  const displayName = player.displayName || player.accountCode;
  const title = player.title || {};
  const labelKey = `${title.id || ""}:${title.name || ""}:${title.color || ""}:${(title.colors || []).join(",")}:${displayName}`;
  if (mesh.userData.lastName !== labelKey) {
    const ctx = mesh.userData.label.getContext("2d");
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = "rgba(5, 10, 14, 0.7)";
    ctx.fillRect(0, 4, 256, 56);
    ctx.font = "800 20px sans-serif";
    ctx.textAlign = "center";
    drawTitleText(ctx, title.name || "新手貓貓", title, 128, 27);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 18px sans-serif";
    ctx.fillText(displayName, 128, 51);
    mesh.userData.texture.needsUpdate = true;
    mesh.userData.lastName = labelKey;
  }
}

function drawTitleText(ctx, text, title, x, y) {
  const colors = title.colors || null;
  if (!colors?.length) {
    ctx.fillStyle = titleCanvasFill(title.color || "black", ctx, 256);
    ctx.fillText(text, x, y);
    return;
  }
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  let cursor = x - widths.reduce((sum, width) => sum + width, 0) / 2;
  chars.forEach((char, index) => {
    const width = widths[index];
    ctx.fillStyle = titleCanvasFill(colors[index % colors.length], ctx, 256);
    ctx.fillText(char, cursor + width / 2, y);
    cursor += width;
  });
}

function titleCanvasFill(colorId, ctx, width) {
  const value = state.titleColors?.[colorId] || colorId || "#111111";
  if (value === "rainbow" || value === "aurora") {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const colors = value === "aurora"
      ? ["#62b7ff", "#8fffd2", "#ff8fcb", "#b78cff"]
      : ["#ff4f5f", "#ff9b3d", "#ffd95a", "#67d88a", "#62b7ff", "#5b6dff", "#b78cff"];
    colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
    return gradient;
  }
  return value;
}

function updateHitFlash(mesh, player) {
  const isHit = Number(player.hitUntil || 0) > Date.now();
  mesh.traverse((part) => {
    if (!part.isMesh || !part.material?.color || part.userData.baseColor === undefined) return;
    part.material.color.setHex(isHit ? 0xff4f5f : part.userData.baseColor);
    if (part.material.emissive) {
      part.material.emissive.setHex(isHit ? 0x5a0008 : 0x000000);
    }
  });
}

function updateTailMesh(tail, tailId) {
  tail.visible = Boolean(tailId);
  if (!tailId) return;
  tail.material.color.setHex(itemColor(tailId));
  tail.scale.set(tailId.includes("dino") ? 1.35 : 1, tailId.includes("rainbow") ? 1.25 : 1, 1);
}

function updateHatMesh(group, hatId) {
  if (!group) return;
  group.clear();
  if (!hatId) return;
  const color = itemColor(hatId);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.55 });
  let mesh;
  if (hatId.includes("crown")) {
    mesh = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.7, 8), material);
  } else if (hatId.includes("antenna")) {
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.08, 8, 18), material);
    mesh.rotation.x = Math.PI / 2;
  } else {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 0.42, 18), material);
  }
  mesh.position.y = 1.72;
  group.add(mesh);
}

function updateClothesMesh(group, clothesId) {
  if (!group) return;
  group.clear();
  if (!clothesId) return;
  if (clothesId.includes("wing") || clothesId === "wings") {
    addWingPair(group);
    return;
  }
  const material = new THREE.MeshStandardMaterial({ color: itemColor(clothesId), roughness: 0.55 });
  const vest = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.68, 1.72), material);
  vest.position.y = 0.42;
  group.add(vest);
  if (clothesId.includes("cape")) {
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.35), material);
    cape.position.set(0, 0.35, -0.94);
    cape.rotation.x = -0.18;
    group.add(cape);
  }
}

function addWingPair(group) {
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
  const left = new THREE.Mesh(new THREE.CircleGeometry(0.76, 24, 0, Math.PI), material);
  left.position.set(-0.82, 0.84, -0.98);
  left.rotation.set(0.2, -0.45, 0.7);
  group.add(left);
  const right = left.clone();
  right.position.x = 0.82;
  right.rotation.set(0.2, 0.45, -0.7);
  group.add(right);
}

function updatePetMesh(group, player) {
  if (!group) return;
  group.clear();
  const petId = player.equipped?.pet;
  if (!petId || player.location === "challenge") return;
  const palette = catPalette(player.catVariant);
  const material = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.58 });
  const faceMaterial = new THREE.MeshBasicMaterial({ color: palette.body });
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1f2630 });
  const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0xff6f9f });
  const bob = Math.sin(Date.now() * 0.004) * 0.12;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.56, 0.72), material);
  body.position.set(-1.45, 0.42 + bob, -2.05);
  group.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.48), material);
  head.position.set(-1.45, 0.95 + bob, -1.72);
  group.add(head);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), faceMaterial);
  face.position.set(-1.45, 0.95 + bob, -1.47);
  group.add(face);
  if (player.catVariant === "calico") {
    const patchMaterialA = new THREE.MeshBasicMaterial({ color: 0x2c231f, transparent: true, opacity: 0.92 });
    const patchMaterialB = new THREE.MeshBasicMaterial({ color: 0xd77a2d, transparent: true, opacity: 0.92 });
    const patchA = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.11), patchMaterialA);
    patchA.position.set(-1.55, 1.02 + bob, -1.462);
    group.add(patchA);
    const patchB = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.1), patchMaterialB);
    patchB.position.set(-1.35, 0.93 + bob, -1.462);
    group.add(patchB);
  }
  [-0.09, 0.09].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), eyeMaterial);
    eye.position.set(-1.45 + x, 1 + bob, -1.465);
    group.add(eye);
  });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 8, 18, Math.PI), mouthMaterial);
  mouth.position.set(-1.45, 0.91 + bob, -1.46);
  mouth.rotation.z = Math.PI;
  group.add(mouth);
  [-0.22, 0.22].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 4), material);
    ear.position.set(-1.45 + x, 1.32 + bob, -1.75);
    ear.rotation.y = Math.PI / 4;
    group.add(ear);
  });
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.5, 4, 10), material);
  tail.position.set(-1.45, 0.62 + bob, -2.48);
  tail.rotation.x = Math.PI / 2.6;
  tail.rotation.z = Math.sin(Date.now() * 0.006) * 0.35;
  group.add(tail);
}

function itemColor(itemId) {
  const colors = [0xffc5dc, 0xbfe8ff, 0xd9c7ff, 0xfff1a8, 0x66d9a6, 0xffb47f, 0xffffff, 0xff8fb3];
  let hash = 0;
  for (const char of String(itemId || "")) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function updateTrail(mesh, player) {
  const trailId = player.equipped?.trail;
  const points = mesh.userData.trailPoints;
  if (!trailId) {
    mesh.userData.trailGroup.clear();
    points.length = 0;
    mesh.userData.lastTrailId = null;
    return;
  }
  if (mesh.userData.lastTrailId && mesh.userData.lastTrailId !== trailId) {
    points.length = 0;
  }
  mesh.userData.lastTrailId = trailId;
  const now = Date.now();
  const last = points[0];
  if (!last || Math.hypot(last.x - player.x, last.z - player.z) > 0.32 || now - last.time > 180) {
    points.unshift({
      x: player.x,
      y: trailHeightFor(player),
      z: player.z,
      time: now
    });
  }
  while (points.length && now - points.at(-1).time > 5000) points.pop();
  mesh.userData.trailGroup.clear();
  points.forEach((point, index) => {
    const ageRatio = Math.min(1, (now - point.time) / 5000);
    const meshlet = createTrailParticle(trailId, index, ageRatio);
    meshlet.position.set(point.x, point.y, point.z);
    meshlet.scale.setScalar(0.35 + 0.65 * (1 - ageRatio));
    mesh.userData.trailGroup.add(meshlet);
  });
}

function trailHeightFor(player) {
  if (player.location === "challenge") return player.y - 0.46;
  if (player.location === "room") return player.y - 0.46;
  return Math.max(player.y - 0.48, -1);
}

function createTrailParticle(trailId, index, ageRatio = 0) {
  const opacity = Math.max(0, 0.62 * (1 - ageRatio));
  const material = new THREE.MeshBasicMaterial({
    color: trailColor(trailId, index),
    transparent: true,
    opacity,
    depthWrite: false
  });
  let particle;
  if (trailId === "poop-trail") {
    particle = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 8), material);
  } else if (trailId === "takoyaki-trail") {
    particle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), material);
  } else if (trailId === "cloud-trail") {
    particle = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), material);
  } else if (trailId === "bubble-trail") {
    particle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 18), material);
    particle.rotation.x = Math.PI / 2;
  } else {
    particle = new THREE.Mesh(new THREE.CircleGeometry(0.24, 18), material);
    particle.rotation.x = -Math.PI / 2;
  }
  particle.renderOrder = 4;
  return particle;
}

function trailColor(trailId, index) {
  const rainbow = [0xff6b8a, 0xffcf32, 0x66d9a6, 0x8ed7ff, 0xd9c7ff];
  return {
    "cloud-trail": 0xffffff,
    "star-trail": 0xfff1a8,
    "bubble-trail": 0x8ed7ff,
    "pudding-trail": 0xffd48a,
    "poop-trail": 0x8b5a2b,
    "takoyaki-trail": 0xd9874a
  }[trailId] || rainbow[index % rainbow.length];
}

function animate() {
  requestAnimationFrame(animate);
  clock.getDelta();
  const me = state.players.get(state.myId);
  if (me) {
    const distance = 15.8;
    const baseYaw = -0.6 + state.cameraYaw;
    const target = new THREE.Vector3(
      me.x + Math.sin(baseYaw) * distance,
      me.y + 8,
      me.z + Math.cos(baseYaw) * distance
    );
    camera.position.lerp(target, 0.08);
    camera.lookAt(me.x, me.y + 1, me.z);
  } else {
    camera.position.set(0, 16, 32);
    camera.lookAt(0, 0, 0);
  }
  renderer.render(scene, camera);
}

function resizeRenderer() {
  const width = Math.max(1, els.gameScreen.clientWidth || window.innerWidth);
  const height = Math.max(1, els.gameScreen.clientHeight || window.innerHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function sendInput() {
  if (!state.account || state.socket?.readyState !== WebSocket.OPEN) return;
  const input = { x: 0, z: 0, y: state.flyY, jump: state.jump };
  let localX = 0;
  let localZ = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("KeyA")) localX -= 1;
  if (state.keys.has("ArrowRight") || state.keys.has("KeyD")) localX += 1;
  if (state.keys.has("ArrowUp") || state.keys.has("KeyW")) localZ -= 1;
  if (state.keys.has("ArrowDown") || state.keys.has("KeyS")) localZ += 1;
  localX += state.joystick.x;
  localZ += state.joystick.z;
  const length = Math.hypot(localX, localZ);
  if (length > 1) {
    localX /= length;
    localZ /= length;
  }
  const cameraAngle = -0.6 + state.cameraYaw;
  const forwardX = -Math.sin(cameraAngle);
  const forwardZ = -Math.cos(cameraAngle);
  const rightX = Math.cos(cameraAngle);
  const rightZ = -Math.sin(cameraAngle);
  const forwardAmount = -localZ;
  input.x = rightX * localX + forwardX * forwardAmount;
  input.z = rightZ * localX + forwardZ * forwardAmount;
  state.socket.send(JSON.stringify({ type: "input", input }));
}

function bindJoystick() {
  const radius = 48;
  const center = () => {
    const rect = els.joystick.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  const move = (event) => {
    if (!state.joystick.active) return;
    const point = event.touches?.[0] || event;
    const origin = center();
    const dx = point.clientX - origin.x;
    const dy = point.clientY - origin.y;
    const distance = Math.min(radius, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    els.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    state.joystick.x = knobX / radius;
    state.joystick.z = knobY / radius;
  };
  const end = () => {
    state.joystick.active = false;
    state.joystick.x = 0;
    state.joystick.z = 0;
    els.joystickKnob.style.transform = "translate(0, 0)";
  };
  els.joystick.addEventListener("pointerdown", (event) => {
    state.joystick.active = true;
    els.joystick.setPointerCapture(event.pointerId);
    move(event);
  });
  els.joystick.addEventListener("pointermove", move);
  els.joystick.addEventListener("pointerup", end);
  els.joystick.addEventListener("pointercancel", end);
}

function holdButton(button, down, up) {
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    down();
  });
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
}

function showCoinModal() {
  openModal("金幣代碼", `
    <form id="coinForm" class="list">
      <input id="coinCodeInput" placeholder="輸入代碼" />
      <button class="primary-button" type="submit">兌換</button>
    </form>
  `);
  document.querySelector("#coinForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("redeem", { code: document.querySelector("#coinCodeInput").value });
  });
}

function showShopModal() {
  openModal("商城", `
    <div class="list">
      <input id="shopSearchInput" autocomplete="off" placeholder="搜尋想買的東西" />
      <div id="shopItemsList" class="list"></div>
    </div>
  `);
  const renderShopItems = () => {
    const query = document.querySelector("#shopSearchInput").value.trim().toLowerCase();
    const items = state.shopItems.filter((item) => {
      const text = `${item.name} ${item.id} ${item.type || ""} ${item.slot || ""}`.toLowerCase();
      return !query || text.includes(query);
    });
    document.querySelector("#shopItemsList").innerHTML = items.map((item) => `
      <div class="list-item">
        <div class="split">
          <strong>${item.name}</strong>
          <span>${priceText(item)} · ${item.type || "裝備"}</span>
        </div>
        <button data-buy="${item.id}">購買</button>
      </div>
    `).join("") || `<p class="muted-line">找不到這個商品。</p>`;
    document.querySelectorAll("[data-buy]").forEach((button) => {
      button.addEventListener("click", () => send("buy", { itemId: button.dataset.buy }));
    });
  };
  document.querySelector("#shopSearchInput").addEventListener("input", renderShopItems);
  renderShopItems();
}

function showLevelRewardsModal() {
  const rewards = state.levelRewards || [];
  const level = Number(state.account?.level || 1);
  const claimed = new Set(state.account?.claimedLevelRewards || []);
  openModal("等級獎勵", rewards.length ? `<div class="list">${rewards.map((reward) => {
    const canClaim = !state.account?.isHost && level >= reward.level && !claimed.has(reward.level);
    const status = state.account?.isHost
      ? "主機是無限資源"
      : claimed.has(reward.level)
        ? "已領"
        : level >= reward.level
          ? "可以領"
          : `還差 ${reward.level - level} 級`;
    return `
      <div class="list-item">
        <div class="split">
          <strong>Lv. ${reward.level}</strong>
          <span>${status}</span>
        </div>
        <p class="muted-line">${levelRewardText(reward)}</p>
        <button ${canClaim ? "" : "disabled"} data-claim-level="${reward.level}">領取</button>
      </div>
    `;
  }).join("")}</div>` : "<p>現在還沒有等級獎勵。</p>");
  document.querySelectorAll("[data-claim-level]").forEach((button) => {
    button.addEventListener("click", () => send("claimLevelReward", { level: Number(button.dataset.claimLevel) }));
  });
}

function showSurvivalModeModal() {
  openModal("選擇模式", `
    <div class="list">
      <div class="list-item">
        <strong>小孩模式</strong>
        <p class="muted-line">不會有飢餓和水分，比較輕鬆，被撞到只會彈一下。</p>
        <button class="primary-button" data-survival-mode="child">選小孩模式</button>
      </div>
      <div class="list-item">
        <strong>大人模式</strong>
        <p class="muted-line">角色變大，會有飢餓和水分；要喝溪流補水、打倒怪物拿食物。</p>
        <button data-survival-mode="adult">選大人模式</button>
      </div>
    </div>
  `);
  document.querySelectorAll("[data-survival-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      send("setSurvivalMode", { mode: button.dataset.survivalMode });
      closeModal();
    });
  });
}

function shouldShowAdultIntro() {
  if (state.account?.isHost || state.account?.survivalMode !== "adult") return false;
  return localStorage.getItem(adultIntroKey()) !== "seen";
}

function adultIntroKey() {
  return `square-cat-adult-intro:${state.account?.code || "guest"}`;
}

function showAdultIntroModal() {
  openModal("大人模式說明", `
    <div class="list">
      <div class="list-item">
        <strong>照顧飢餓和水分</strong>
        <p class="muted-line">左上角會顯示飽腹值和水分。任何一個變成 0，就會回到安全狀態重新開始。</p>
      </div>
      <div class="list-item">
        <strong>喝溪流補水</strong>
        <p class="muted-line">走到島上的藍色溪流旁邊，水分會慢慢回復。</p>
      </div>
      <div class="list-item">
        <strong>打怪物拿食物</strong>
        <p class="muted-line">地上不會直接長食物了。把彈跳怪物打倒，才會掉出肉塊。</p>
      </div>
      <button id="adultIntroOk" class="primary-button">知道了，開始玩</button>
    </div>
  `);
  document.querySelector("#adultIntroOk").addEventListener("click", () => {
    localStorage.setItem(adultIntroKey(), "seen");
    closeModal();
  });
}

function showFerrisIconModal() {
  openModal("摩天輪中心圖案", `<div class="list">${FERRIS_ICON_OPTIONS.map(([id, label]) => `
    <div class="list-item">
      <div class="split">
        <strong>${label}</strong>
        <span>${state.ferris?.icon === id ? "使用中" : "可更換"}</span>
      </div>
      <button data-ferris-icon="${id}">設定</button>
    </div>
  `).join("")}</div>`);
  document.querySelectorAll("[data-ferris-icon]").forEach((button) => {
    button.addEventListener("click", () => send("setFerrisIcon", { icon: button.dataset.ferrisIcon }));
  });
}

function levelRewardText(reward) {
  const parts = [`${Number(reward.coins || 0)} 金幣`];
  if (Number(reward.diamonds || 0) > 0) parts.push(`${reward.diamonds} 鑽石`);
  if (reward.itemName) parts.push(reward.itemName);
  return parts.join("、");
}

function priceText(item) {
  return item.diamondPrice ? `${item.diamondPrice} 鑽石` : `${item.price} 金幣`;
}

function showBagModal() {
  const owned = state.shopItems.filter((item) => state.account.inventory.includes(item.id));
  const ownedTitles = (state.account.titles || []).map((id) => state.titleCatalog[id]).filter(Boolean);
  const itemHtml = owned.length ? `<div class="list">${owned.map((item) => `
    <div class="list-item">
      <div class="split">
        <strong>${item.name}</strong>
        <span>${item.slot ? (state.account.equipped[item.slot] === item.id ? "裝備中" : item.slot) : item.type}</span>
      </div>
      ${bagActionButton(item)}
    </div>
  `).join("")}</div>` : "<p>背包現在沒有商品道具。</p>";
  const titleHtml = `
    <h3>稱號</h3>
    <div class="list">${ownedTitles.map((title) => `
      <div class="list-item">
        <div class="split">
          <strong style="color:${cssTitleColor(title.color)}">${escapeHtml(title.name)}</strong>
          <span>${state.account.equipped?.title === title.id ? "裝備中" : "稱號"}</span>
        </div>
        <button data-equip-title="${escapeHtml(title.id)}">${state.account.equipped?.title === title.id ? "已裝備" : "裝備稱號"}</button>
      </div>
    `).join("")}</div>
  `;
  openModal("背包", `${titleHtml}${itemHtml}`);
  document.querySelectorAll("[data-equip]").forEach((button) => {
    button.addEventListener("click", () => send("equip", { itemId: button.dataset.equip }));
  });
  document.querySelectorAll("[data-equip-title]").forEach((button) => {
    button.addEventListener("click", () => send("equipTitle", { titleId: button.dataset.equipTitle }));
  });
  document.querySelectorAll("[data-place-house]").forEach((button) => {
    button.addEventListener("click", () => send("placeHouse"));
  });
  document.querySelectorAll("[data-place-furniture]").forEach((button) => {
    button.addEventListener("click", () => send("placeFurniture", { itemId: button.dataset.placeFurniture }));
  });
  document.querySelectorAll("[data-use-house-paint]").forEach((button) => {
    button.addEventListener("click", () => send("useHousePaint", { itemId: button.dataset.useHousePaint }));
  });
}

function cssTitleColor(colorId) {
  const value = state.titleColors?.[colorId] || colorId || "#111111";
  return value === "rainbow" || value === "aurora" ? "#62b7ff" : value;
}

function bagActionButton(item) {
  if (item.type === "house") return `<button data-place-house="${item.id}">蓋在前方</button>`;
  if (item.type === "furniture") return `<button data-place-furniture="${item.id}">擺到房間</button>`;
  if (item.type === "house-paint") return `<button data-use-house-paint="${item.id}">使用噴漆</button>`;
  return `<button data-equip="${item.id}">${state.account.equipped[item.slot] === item.id ? "卸下" : "裝備"}</button>`;
}

function showFriendsModal() {
  const gifts = state.account.giftInbox || [];
  openModal("好友", `
    <form id="friendForm" class="list">
      <input id="friendCodeInput" placeholder="輸入好友帳號亂碼" />
      <button class="primary-button" type="submit">加好友</button>
    </form>
    <h3>收到的禮物</h3>
    <div class="list">
      ${gifts.map((gift) => {
        const isCoinGift = gift.kind === "coins";
        const isDiamondGift = gift.kind === "diamonds";
        const item = isCoinGift || isDiamondGift ? null : state.shopItems.find((candidate) => candidate.id === gift.itemId);
        return `
          <div class="list-item">
            <div class="split">
              <strong>${isCoinGift ? `${gift.coins} 金幣` : isDiamondGift ? `${gift.diamonds} 顆鑽石` : (item?.name || gift.itemId)}</strong>
              <span>來自 ${escapeHtml(gift.from)}</span>
            </div>
            <div class="row">
              <button data-accept-gift="${gift.id}" class="primary-button">收下</button>
              <button data-return-gift="${gift.id}">退回好友</button>
            </div>
          </div>
        `;
      }).join("") || "<p>目前沒有禮物。</p>"}
    </div>
    <h3>組隊</h3>
    <p>按好友旁邊的組隊後，再按「進入闖關」，在線隊友會一起進去。</p>
    <button id="leaveTeamButton">離開隊伍</button>
    <div class="list">
      ${(state.account.friends || []).map((friend) => `
        <div class="list-item">
          <div class="split"><strong>${friend}</strong><button data-team-invite="${escapeHtml(friend)}">組隊</button></div>
          <button data-gift-friend="${escapeHtml(friend)}">贈送</button>
        </div>
      `).join("") || "<p>還沒有好友。</p>"}
    </div>
  `);
  document.querySelector("#friendForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("addFriend", { friendCode: document.querySelector("#friendCodeInput").value });
  });
  document.querySelector("#leaveTeamButton").addEventListener("click", () => send("leaveTeam"));
  document.querySelectorAll("[data-team-invite]").forEach((button) => {
    button.addEventListener("click", () => send("teamInvite", { friendCode: button.dataset.teamInvite }));
  });
  document.querySelectorAll("[data-gift-friend]").forEach((button) => {
    button.addEventListener("click", () => showGiftShop(button.dataset.giftFriend));
  });
  document.querySelectorAll("[data-accept-gift]").forEach((button) => {
    button.addEventListener("click", () => send("acceptGift", { giftId: button.dataset.acceptGift }));
  });
  document.querySelectorAll("[data-return-gift]").forEach((button) => {
    button.addEventListener("click", () => send("returnGift", { giftId: button.dataset.returnGift }));
  });
}

function showGiftShop(friendCode) {
  openModal(`贈送給 ${friendCode}`, `
    <form id="coinGiftForm" class="panel list">
      <strong>送金幣</strong>
      <input id="coinGiftAmount" inputmode="numeric" maxlength="6" placeholder="輸入金幣數量" />
      <button class="primary-button" type="submit">送出金幣</button>
    </form>
    <form id="diamondGiftForm" class="panel list">
      <strong>送鑽石</strong>
      <input id="diamondGiftAmount" inputmode="numeric" maxlength="4" placeholder="輸入鑽石數量" />
      <button class="primary-button" type="submit">送出鑽石</button>
    </form>
    <div class="list">
      ${state.shopItems.map((item) => `
        <div class="list-item">
          <div class="split">
            <strong>${item.name}</strong>
            <span>${priceText(item)}</span>
          </div>
          <button data-send-gift="${item.id}" class="primary-button">送這個</button>
        </div>
      `).join("")}
    </div>
  `);
  document.querySelector("#coinGiftForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("sendCoinGift", {
      friendCode,
      coins: document.querySelector("#coinGiftAmount").value
    });
    closeModal();
  });
  document.querySelector("#diamondGiftForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("sendDiamondGift", {
      friendCode,
      diamonds: document.querySelector("#diamondGiftAmount").value
    });
    closeModal();
  });
  document.querySelectorAll("[data-send-gift]").forEach((button) => {
    button.addEventListener("click", () => {
      send("sendGift", { friendCode, itemId: button.dataset.sendGift });
      closeModal();
    });
  });
}

function showChallengeModal() {
  const me = state.players.get(state.myId);
  const inChallenge = me?.location === "challenge";
  openModal("闖關/組隊", `
    <div class="list">
      <div class="list-item">
        <strong>上跳闖關</strong>
        <p>這會把你傳送到真正的上跳關卡。完成可獲得 500 金幣並升 1 級。</p>
      </div>
      <div class="list-item">
        <strong>組隊玩法</strong>
        <p>先到好友頁面和朋友組隊，再回來進入闖關。組隊難度會看隊伍裡最低等級。</p>
      </div>
      <button id="enterChallengeAction" class="primary-button">${inChallenge ? "離開闖關" : "進入闖關"}</button>
    </div>
  `);
  document.querySelector("#enterChallengeAction").addEventListener("click", () => {
    send(inChallenge ? "leaveChallenge" : "enterChallenge");
    closeModal();
  });
}

function showOnlinePlayersModal() {
  if (!state.account?.isHost) {
    showNotice("只有主機可以查看在線玩家。");
    return;
  }
  const players = [...state.players.values()].sort((a, b) => {
    if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
    return String(a.displayName || a.accountCode).localeCompare(String(b.displayName || b.accountCode));
  });
  openModal("在線玩家", `
    <div class="list">
      <div class="list-item">
        <div class="split">
          <strong>加入過遊戲</strong>
          <span>${state.totalAccounts || players.length} 個帳號</span>
        </div>
      </div>
      <div class="list-item">
        <div class="split">
          <strong>目前在線</strong>
          <span>${players.length} 隻貓</span>
        </div>
      </div>
      ${players.map((player) => `
        <div class="list-item">
          <div class="split">
            <strong>${escapeHtml(player.displayName || player.accountCode)}</strong>
            <span>${player.isHost ? "主機" : `Lv. ${player.level || 1}`}</span>
          </div>
          <small>${locationLabel(player.location)} · 金幣 ${player.isHost ? "∞" : Number(player.coins || 0)} · 鑽石 ${player.isHost ? "∞" : Number(player.diamonds || 0)}</small>
        </div>
      `).join("") || "<p>目前沒有玩家在線。</p>"}
    </div>
  `);
}

function locationLabel(location) {
  return {
    island: "貓眼星雲島",
    challenge: "闖關中",
    room: "房間裡"
  }[location] || "未知位置";
}

function showAdminModal() {
  const colorOptions = Object.entries(state.titleColors || {}).map(([id, value]) => `<option value="${id}">${titleColorName(id, value)}</option>`).join("");
  const playerOptions = (state.titlePlayers || []).map((player) => `<option value="${escapeHtml(player.code)}">${escapeHtml(player.code)}</option>`).join("");
  const titleRows = Object.values(state.titleCatalog || {}).map((title) => `
    <div class="list-item">
      <div class="split">
        <strong style="color:${cssTitleColor(title.color || title.colors?.[0])}">${escapeHtml(title.name)}</strong>
        <span>${titleColorLabel(title)}</span>
      </div>
      <div class="row">
        <select data-title-player="${escapeHtml(title.id)}">${playerOptions}</select>
        <button data-grant-title="${escapeHtml(title.id)}">發給玩家</button>
      </div>
    </div>
  `).join("");
  const codeRows = Object.entries(state.coinCodes).map(([code, entry]) => `
    <div class="list-item">
      <div class="split">
        <strong>${escapeHtml(code)}</strong>
        <span>${entry.type === "item" ? entry.item : `${entry.coins} 金幣`} · ${entry.active === false ? "下架" : "上架"}</span>
      </div>
      <div class="row">
        <button data-toggle-code="${escapeHtml(code)}">${entry.active === false ? "重新上架" : "下架"}</button>
        <button data-delete-code="${escapeHtml(code)}">刪除</button>
      </div>
    </div>
  `).join("") || `<p class="muted-line">目前還沒有新增過 Password。</p>`;
  openModal("新增 Password", `
    <form id="adminTitleForm" class="list">
      <strong>新增稱號</strong>
      <input id="adminTitleNameInput" maxlength="14" placeholder="稱號名稱，例如 超級喵喵" />
      <select id="adminTitleColorInput">${colorOptions}</select>
      <button class="primary-button" type="submit">新增稱號</button>
    </form>
    <h3>稱號庫</h3>
    <div class="list">${titleRows}</div>
    <form id="adminCodeForm" class="list">
      <strong>新增金幣/道具 Password</strong>
      <input id="adminCodeInput" placeholder="新代碼" />
      <select id="adminRewardType">
        <option value="coins">金幣</option>
        <option value="item">道具</option>
      </select>
      <input id="adminCoinInput" inputmode="numeric" placeholder="可得到多少金幣" />
      <select id="adminItemInput">
        ${state.shopItems.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}
      </select>
      <button class="primary-button" type="submit">新增代碼</button>
    </form>
    <div class="list">${codeRows}</div>
  `);
  document.querySelector("#adminTitleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("adminUpsertTitle", {
      name: document.querySelector("#adminTitleNameInput").value,
      color: document.querySelector("#adminTitleColorInput").value
    });
  });
  document.querySelector("#adminCodeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    send("adminUpsertCode", {
      code: document.querySelector("#adminCodeInput").value,
      rewardType: document.querySelector("#adminRewardType").value,
      coins: document.querySelector("#adminCoinInput").value,
      itemId: document.querySelector("#adminItemInput").value
    });
  });
  document.querySelectorAll("[data-toggle-code]").forEach((button) => {
    button.addEventListener("click", () => send("adminToggleCode", { code: button.dataset.toggleCode }));
  });
  document.querySelectorAll("[data-delete-code]").forEach((button) => {
    button.addEventListener("click", () => {
      if (confirm("確定要刪除這個 Password 嗎？")) {
        send("adminDeleteCode", { code: button.dataset.deleteCode });
      }
    });
  });
  document.querySelectorAll("[data-grant-title]").forEach((button) => {
    button.addEventListener("click", () => {
      const titleId = button.dataset.grantTitle;
      const select = button.closest(".list-item")?.querySelector("[data-title-player]");
      send("adminGrantTitle", { titleId, accountCode: select?.value });
    });
  });
}

function titleColorLabel(title) {
  if (title.colors?.length) return title.colors.map((color) => titleColorName(color, state.titleColors?.[color])).join(" / ");
  return titleColorName(title.color, state.titleColors?.[title.color]);
}

function titleColorName(id, value) {
  return {
    black: "黑色",
    white: "白色",
    red: "紅色",
    orange: "橙色",
    yellow: "黃色",
    green: "綠色",
    blue: "藍色",
    indigo: "靛色",
    purple: "紫色",
    pink: "粉色",
    magenta: "桃紅色",
    lightBlue: "淺藍",
    deepBlue: "深藍",
    starryBlue: "星夜藍",
    aurora: "極光色",
    rainbow: "彩虹色",
    peach: "蜜桃色",
    mint: "薄荷色",
    gold: "金色"
  }[id] || value || id;
}

function openModal(title, body) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = body;
  els.modal.classList.remove("hidden");
}

function closeModal() {
  els.modal.classList.add("hidden");
}

function renderChat(chatLog) {
  els.chatLog.innerHTML = chatLog.map((message) => `
    <div><strong>${escapeHtml(message.sender)}:</strong> ${escapeHtml(message.text)}</div>
  `).join("");
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function showNotice(text) {
  if (!text) return;
  const item = document.createElement("div");
  item.innerHTML = `<strong>系統:</strong> ${escapeHtml(text)}`;
  els.chatLog.append(item);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function showFlightInvite(message) {
  const item = document.createElement("div");
  item.className = "invite-message";
  item.innerHTML = `
    <span><strong>${escapeHtml(message.leaderName)}</strong> 邀請大家一起飛。</span>
    <button type="button" class="primary-button">接收</button>
  `;
  item.querySelector("button").addEventListener("click", () => {
    send("acceptFlightInvite", { leaderId: message.leaderId });
    item.remove();
  });
  els.chatLog.append(item);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function showFerrisCenterInvite(message) {
  const item = document.createElement("div");
  item.className = "invite-message";
  item.innerHTML = `
    <span><strong>${escapeHtml(message.leaderName)}</strong> 邀請你上摩天輪中心平台。</span>
    <button type="button" class="primary-button">進入</button>
  `;
  item.querySelector("button").addEventListener("click", () => {
    send("acceptFerrisCenterInvite", { leaderId: message.leaderId });
    item.remove();
  });
  els.chatLog.append(item);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showNotice("這個瀏覽器目前不能使用語音輸入。");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "zh-TW";
  recognition.onresult = (event) => {
    els.chatInput.value = event.results[0][0].transcript;
  };
  recognition.start();
}

function send(type, payload = {}) {
  if (state.socket?.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify({ type, ...payload }));
    return true;
  }
  showAuthStatus("伺服器還沒連上，請等一下或重新整理頁面。", true);
  return false;
}

function sendAction(type, payload = {}) {
  const now = Date.now();
  if (now - Number(state.actionCooldowns[type] || 0) < 180) return false;
  state.actionCooldowns[type] = now;
  return send(type, payload);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
