import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

export const HOST_CODE = process.env.HOST_ACCOUNT_CODE || null;
export const HOST_PASSWORD = process.env.HOST_PASSWORD || null;

export const DEFAULT_COIN_CODES = {};
export const CAT_VARIANTS = ["black", "white", "calico", "orange"];
export const MAX_PLAYER_LEVEL = 100;
export const MAX_CHALLENGE_STEP_Y = 2.8;
export const CHALLENGE_BASE = { x: -760, y: 1.2, z: -720 };
export const SURVIVAL_DRAIN_PER_SECOND = { hunger: 0.18, thirst: 0.24 };

export const EXTRA_NON_FURNITURE_ITEMS = [
  ["sun-hat", "太陽帽", "hat", "wearable", 140],
  ["moon-hat", "月亮帽", "hat", "wearable", 140],
  ["cloud-hat", "雲朵帽", "hat", "wearable", 130],
  ["rainbow-hat", "彩虹帽", "hat", "wearable", 180],
  ["fish-hat", "小魚帽", "hat", "wearable", 150],
  ["octo-hat", "章魚燒帽", "hat", "wearable", 160],
  ["ufo-hat", "飛碟帽", "hat", "wearable", 220],
  ["planet-hat", "星球帽", "hat", "wearable", 200],
  ["crown-hat", "小皇冠", "hat", "wearable", 260],
  ["flower-hat", "小花帽", "hat", "wearable", 120],
  ["cookie-hat", "餅乾帽", "hat", "wearable", 110],
  ["pudding-hat", "布丁帽", "hat", "wearable", 150],
  ["bubble-hat", "泡泡帽", "hat", "wearable", 135],
  ["shell-hat", "貝殼帽", "hat", "wearable", 145],
  ["crystal-hat", "水晶帽", "hat", "wearable", 210],
  ["ribbon-hat", "蝴蝶結", "hat", "wearable", 120],
  ["strawberry-hat", "草莓帽", "hat", "wearable", 150],
  ["banana-hat", "香蕉帽", "hat", "wearable", 150],
  ["peach-hat", "水蜜桃帽", "hat", "wearable", 150],
  ["wizard-hat", "魔法帽", "hat", "wearable", 240],
  ["angel-hood", "天使兜帽", "hat", "wearable", 230],
  ["dino-hood", "恐龍兜帽", "hat", "wearable", 210],
  ["bee-antenna", "蜜蜂觸角", "hat", "wearable", 160],
  ["star-crown", "星星皇冠", "hat", "wearable", 280],
  ["sleep-cap", "睡睡帽", "hat", "wearable", 130],
  ["snow-cap", "雪花帽", "hat", "wearable", 160],
  ["nebula-cape", "星雲披風", "clothes", "wearable", 260],
  ["cloud-cape", "雲朵披風", "clothes", "wearable", 240],
  ["raincoat", "彩虹雨衣", "clothes", "wearable", 230],
  ["fish-shirt", "小魚衣服", "clothes", "wearable", 180],
  ["star-jacket", "星星外套", "clothes", "wearable", 240],
  ["moon-poncho", "月亮斗篷", "clothes", "wearable", 240],
  ["bubble-suit", "泡泡套裝", "clothes", "wearable", 260],
  ["pudding-shirt", "布丁衣服", "clothes", "wearable", 190],
  ["ufo-pack", "飛碟背包", "clothes", "wearable", 310],
  ["rocket-pack", "火箭背包", "clothes", "wearable", 350],
  ["angel-wings", "天使白翅膀", "clothes", "wearable", 1700],
  ["mini-wings", "小白翅膀", "clothes", "wearable", 900],
  ["butterfly-wings", "蝴蝶翅膀", "clothes", "wearable", 1200],
  ["snow-wings", "雪花翅膀", "clothes", "wearable", 1300],
  ["heart-cape", "愛心披風", "clothes", "wearable", 260],
  ["dino-suit", "恐龍衣服", "clothes", "wearable", 320],
  ["bee-suit", "蜜蜂衣服", "clothes", "wearable", 300],
  ["pajamas", "星星睡衣", "clothes", "wearable", 210],
  ["wizard-robe", "魔法袍", "clothes", "wearable", 360],
  ["peach-vest", "水蜜桃背心", "clothes", "wearable", 190],
  ["banana-vest", "香蕉背心", "clothes", "wearable", 190],
  ["crystal-armor", "水晶盔甲", "clothes", "wearable", 420],
  ["milk-scarf", "牛奶圍巾", "clothes", "wearable", 160],
  ["stripe-tail", "條紋尾巴", "tail", "wearable", 180],
  ["cloud-tail", "雲朵尾巴", "tail", "wearable", 190],
  ["rainbow-tail", "彩虹尾巴", "tail", "wearable", 230],
  ["fish-tail", "小魚尾巴", "tail", "wearable", 200],
  ["star-tail", "星星尾巴", "tail", "wearable", 220],
  ["moon-tail", "月亮尾巴", "tail", "wearable", 220],
  ["bubble-tail", "泡泡尾巴", "tail", "wearable", 190],
  ["octo-tail", "章魚燒尾巴", "tail", "wearable", 210],
  ["pudding-tail", "布丁尾巴", "tail", "wearable", 200],
  ["ufo-tail", "飛碟尾巴", "tail", "wearable", 250],
  ["heart-tail", "愛心尾巴", "tail", "wearable", 210],
  ["crystal-tail", "水晶尾巴", "tail", "wearable", 260],
  ["bee-tail", "蜜蜂尾巴", "tail", "wearable", 210],
  ["dino-tail", "恐龍尾巴", "tail", "wearable", 240],
  ["snow-tail", "雪花尾巴", "tail", "wearable", 210],
  ["sparkle-trail", "閃亮拖尾", "trail", "trail", 340],
  ["heart-trail", "愛心拖尾", "trail", "trail", 300],
  ["moon-trail", "月亮拖尾", "trail", "trail", 320],
  ["fish-trail", "小魚拖尾", "trail", "trail", 280],
  ["ufo-trail", "飛碟拖尾", "trail", "trail", 380],
  ["snow-trail", "雪花拖尾", "trail", "trail", 300],
  ["cookie-trail", "餅乾拖尾", "trail", "trail", 260],
  ["milk-trail", "牛奶拖尾", "trail", "trail", 240],
  ["peach-trail", "水蜜桃拖尾", "trail", "trail", 260],
  ["banana-trail", "香蕉拖尾", "trail", "trail", 260],
  ["bee-trail", "蜜蜂拖尾", "trail", "trail", 290],
  ["crystal-trail", "水晶拖尾", "trail", "trail", 360],
  ["cat-pet", "小貓寵物", "pet", "pet", 450],
  ["cloud-pet", "雲朵寵物", "pet", "pet", 420],
  ["fish-pet", "小魚寵物", "pet", "pet", 420],
  ["star-pet", "星星寵物", "pet", "pet", 460],
  ["moon-pet", "月亮寵物", "pet", "pet", 460],
  ["bubble-pet", "泡泡寵物", "pet", "pet", 380],
  ["octo-pet", "章魚燒寵物", "pet", "pet", 440],
  ["ufo-pet", "飛碟寵物", "pet", "pet", 520],
  ["rocket-pet", "火箭寵物", "pet", "pet", 520],
  ["pudding-pet", "布丁寵物", "pet", "pet", 400],
  ["bee-pet", "蜜蜂寵物", "pet", "pet", 430],
  ["dino-pet", "恐龍寵物", "pet", "pet", 500],
  ["crystal-pet", "水晶寵物", "pet", "pet", 500],
  ["snow-pet", "雪花寵物", "pet", "pet", 430],
  ["peach-pet", "水蜜桃寵物", "pet", "pet", 420],
  ["banana-pet", "香蕉寵物", "pet", "pet", 420],
  ["cookie-pet", "餅乾寵物", "pet", "pet", 390],
  ["milk-pet", "牛奶寵物", "pet", "pet", 390],
  ["shell-pet", "貝殼寵物", "pet", "pet", 410],
  ["angel-pet", "天使寵物", "pet", "pet", 550],
  ["wizard-pet", "魔法寵物", "pet", "pet", 540]
].map(([id, name, slot, type, price]) => ({ id, name, slot, type, price }));

export const FURNITURE_ITEMS = [
  ["cloud-bed", "雲朵床", 180],
  ["fish-table", "小魚桌", 150],
  ["moon-lamp", "月亮燈", 130],
  ["star-rug", "星星地毯", 90],
  ["bubble-chair", "泡泡椅", 120],
  ["cat-sofa", "貓掌沙發", 260],
  ["shell-bookshelf", "貝殼書櫃", 210],
  ["planet-clock", "星球時鐘", 160],
  ["nebula-poster", "星雲海報", 80],
  ["tiny-fridge", "小冰箱", 240],
  ["pudding-stool", "布丁椅凳", 110],
  ["rainbow-carpet", "彩虹地毯", 170],
  ["octo-cushion", "章魚燒抱枕", 95],
  ["sunny-window", "太陽窗戶", 190],
  ["comet-mirror", "彗星鏡子", 180],
  ["fishbowl", "小魚缸", 220],
  ["rocket-shelf", "火箭置物架", 230],
  ["marshmallow-bed", "棉花糖小床", 250],
  ["paw-desk", "貓掌書桌", 200],
  ["mint-plant", "薄荷盆栽", 75],
  ["crystal-plant", "水晶盆栽", 140],
  ["star-lantern", "星星提燈", 125],
  ["cloud-curtain", "雲朵窗簾", 115],
  ["candy-drawer", "糖果抽屜", 165],
  ["music-box", "喵喵音樂盒", 185],
  ["floor-pillow", "圓圓坐墊", 70],
  ["space-tv", "太空電視", 300],
  ["mini-slide-toy", "迷你溜滑梯玩具", 210],
  ["swing-model", "小鞦韆模型", 210],
  ["cat-tree", "貓跳台", 280],
  ["yarn-basket", "毛線籃", 85],
  ["cookie-plate", "餅乾盤", 60],
  ["milk-cup", "牛奶杯", 50],
  ["star-garland", "星星掛飾", 100],
  ["moon-mat", "月亮腳踏墊", 90],
  ["bubble-lamp", "泡泡燈", 145],
  ["fish-cabinet", "小魚櫃", 230],
  ["rainbow-shelf", "彩虹架", 220],
  ["takoyaki-stand", "章魚燒小攤", 260],
  ["poop-statue", "便便雕像", 75],
  ["peach-beanbag", "水蜜桃懶骨頭", 150],
  ["banana-phone", "香蕉電話", 120],
  ["snow-globe", "星球雪花球", 175],
  ["ufo-mobile", "飛碟吊飾", 195],
  ["kitty-wardrobe", "小貓衣櫃", 270],
  ["cloud-kitchen", "雲朵廚房", 320],
  ["star-bathtub", "星星浴缸", 290],
  ["round-tea-set", "圓桌茶具", 160],
  ["nebula-beanbag", "星雲懶骨頭", 190],
  ["tiny-piano", "小鋼琴", 340]
].map(([id, name, price]) => ({ id, name, type: "furniture", price }));

export const HOUSE_PAINT_STYLES = [
  ["red", "紅色", 0xff5a6c, "solid", 120],
  ["orange", "橙色", 0xff9b3d, "solid", 120],
  ["yellow", "黃色", 0xffd95a, "solid", 120],
  ["green", "綠色", 0x67d88a, "solid", 120],
  ["blue", "藍色", 0x62b7ff, "solid", 120],
  ["electric", "電色", 0x48f4ff, "solid", 180],
  ["purple", "紫色", 0xb78cff, "solid", 120],
  ["rainbow", "紅橙黃綠藍電紫色", 0xffffff, "rainbow", 420],
  ["ruby-violet-blue", "紅紫藍漸層", 0xffffff, "gradient", 360],
  ["starry-night", "星夜圖案", 0x11295f, "starry", 520]
].map(([id, name, color, paintStyle, price]) => ({ id, name, color, paintStyle, price }));

export const HOUSE_PAINT_ITEMS = HOUSE_PAINT_STYLES.flatMap((paint) => [
  {
    id: `house-body-paint-${paint.id}`,
    name: `${paint.name}房體噴漆`,
    type: "house-paint",
    slot: "houseBodyPaint",
    target: "body",
    paint,
    price: paint.price
  },
  {
    id: `house-roof-paint-${paint.id}`,
    name: `${paint.name}屋頂噴漆`,
    type: "house-paint",
    slot: "houseRoofPaint",
    target: "roof",
    paint,
    price: paint.price
  }
]);

export const SHOP_ITEMS = [
  { id: "star-hat", name: "星星帽", slot: "hat", type: "wearable", price: 120 },
  { id: "nebula-scarf", name: "星雲圍巾", slot: "clothes", type: "wearable", price: 220 },
  { id: "comet-tail", name: "彗星尾巴", slot: "tail", type: "wearable", price: 180 },
  { id: "wings", name: "貓眼星雲翅膀", slot: "clothes", type: "wearable", price: 1500 },
  { id: "cloud-trail", name: "雲朵拖尾", slot: "trail", type: "trail", price: 260 },
  { id: "rainbow-trail", name: "彩虹拖尾", slot: "trail", type: "trail", price: 360 },
  { id: "star-trail", name: "星星拖尾", slot: "trail", type: "trail", price: 300 },
  { id: "bubble-trail", name: "泡泡拖尾", slot: "trail", type: "trail", price: 220 },
  { id: "pudding-trail", name: "布丁拖尾", slot: "trail", type: "trail", price: 280 },
  { id: "poop-trail", name: "便便拖尾", slot: "trail", type: "trail", price: 180 },
  { id: "takoyaki-trail", name: "章魚燒拖尾", slot: "trail", type: "trail", price: 320 },
  { id: "cat-house", name: "小貓房子", type: "house", price: 1000 },
  ...HOUSE_PAINT_ITEMS,
  ...EXTRA_NON_FURNITURE_ITEMS,
  ...FURNITURE_ITEMS
].map((item) => {
  if (["wings", "angel-wings", "butterfly-wings", "snow-wings", "crystal-armor", "ufo-pack", "rocket-pack"].includes(item.id)) {
    return { ...item, diamondPrice: Math.max(2, Math.ceil(item.price / 350)) };
  }
  if (item.type === "house-paint" && ["rainbow", "ruby-violet-blue", "starry-night"].includes(item.paint?.id)) {
    return { ...item, diamondPrice: Math.max(1, Math.ceil(item.price / 260)) };
  }
  if (item.type === "pet" || item.type === "trail") {
    return { ...item, diamondPrice: Math.max(1, Math.ceil(item.price / 420)) };
  }
  return item;
});

export const LEVEL_REWARDS = [
  { level: 2, coins: 120, diamonds: 0, itemId: null },
  { level: 3, coins: 180, diamonds: 0, itemId: null },
  { level: 5, coins: 320, diamonds: 1, itemId: null },
  { level: 7, coins: 420, diamonds: 1, itemId: "star-hat" },
  { level: 10, coins: 700, diamonds: 2, itemId: "cat-pet" },
  { level: 15, coins: 1200, diamonds: 3, itemId: "rainbow-trail" },
  { level: 20, coins: 1800, diamonds: 5, itemId: "mini-wings" },
  { level: 25, coins: 2600, diamonds: 8, itemId: "house-body-paint-starry-night" },
  { level: 30, coins: 3200, diamonds: 10, itemId: "angel-wings" },
  { level: 40, coins: 4500, diamonds: 14, itemId: "crystal-trail" },
  { level: 50, coins: 6000, diamonds: 18, itemId: "crystal-pet" },
  { level: 75, coins: 9000, diamonds: 25, itemId: "house-roof-paint-starry-night" },
  { level: 100, coins: 15000, diamonds: 40, itemId: "crown-hat" }
].map((reward) => {
  const item = reward.itemId ? SHOP_ITEMS.find((candidate) => candidate.id === reward.itemId) : null;
  return { ...reward, itemName: item?.name || null };
});

function loadLocalEnv() {
  if ((process.env.HOST_ACCOUNT_CODE && process.env.HOST_PASSWORD) || !existsSync(".env")) return;
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function isValidNewAccountCode(code) {
  return /^[A-Za-z0-9]{1,10}$/.test(String(code || ""));
}

export function normalizeAccountCode(code) {
  return String(code || "").trim();
}

export function createAccount(code, overrides = {}) {
  const accountCode = normalizeAccountCode(code);
  const isHost = Boolean(HOST_CODE && accountCode === HOST_CODE);
  return {
    code: accountCode,
    level: isHost ? null : 1,
    coins: isHost ? 999999999 : 0,
    diamonds: isHost ? 999999999 : 0,
    isHost,
    catVariant: isHost ? "host" : pickRandomCatVariant(),
    inventory: [],
    equipped: {
      hat: null,
      clothes: null,
      tail: null,
      trail: null,
      pet: null
    },
    house: null,
    roomItems: [],
    giftInbox: [],
    redeemedCodes: [],
    claimedLevelRewards: [],
    friends: [],
    survivalMode: isHost ? "host" : null,
    hunger: 100,
    thirst: 100,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function pickRandomCatVariant() {
  return CAT_VARIANTS[Math.floor(Math.random() * CAT_VARIANTS.length)];
}

export function makeGuestAccount() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return createAccount(`guest-${suffix}`, {
    isGuest: true,
    code: `guest-${suffix}`
  });
}

export function redeemCode(account, codeBook, rawCode) {
  const code = normalizeAccountCode(rawCode);
  const entry = codeBook[code];
  if (!entry || entry.active === false) {
    return { ok: false, message: "沒有這個代碼，或代碼已下架。" };
  }
  if (account.redeemedCodes.includes(code)) {
    return { ok: false, message: "這個代碼已經使用過了。" };
  }

  const nextAccount = structuredClone(account);
  nextAccount.redeemedCodes.push(code);

  if (entry.type === "item") {
    if (!nextAccount.inventory.includes(entry.item)) {
      nextAccount.inventory.push(entry.item);
    }
    return {
      ok: true,
      account: nextAccount,
      message: `獲得 ${entry.item === "wings" ? "翅膀" : entry.item}。`
    };
  }

  nextAccount.coins += Number(entry.coins || 0);
  return {
    ok: true,
    account: nextAccount,
    message: `獲得 ${Number(entry.coins || 0)} 金幣。`
  };
}

export function buyItem(account, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) {
    return { ok: false, message: "商城沒有這個商品。" };
  }
  if (account.inventory.includes(itemId)) {
    return { ok: false, message: "你已經有這個商品了。" };
  }
  const usesDiamonds = Number(item.diamondPrice || 0) > 0;
  if (!account.isHost && usesDiamonds && Number(account.diamonds || 0) < item.diamondPrice) {
    return { ok: false, message: "鑽石不夠。" };
  }
  if (!account.isHost && !usesDiamonds && account.coins < item.price) {
    return { ok: false, message: "金幣不夠。" };
  }

  const nextAccount = structuredClone(account);
  if (!nextAccount.isHost && usesDiamonds) {
    nextAccount.diamonds -= item.diamondPrice;
  } else if (!nextAccount.isHost) {
    nextAccount.coins -= item.price;
  }
  nextAccount.inventory.push(itemId);
  return { ok: true, account: nextAccount, message: `買到 ${item.name}。` };
}

export function equipItem(account, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) {
    return { ok: false, message: "找不到這個裝備。" };
  }
  if (!account.inventory.includes(itemId)) {
    return { ok: false, message: "你還沒有這個裝備。" };
  }
  if (!item.slot) {
    return { ok: false, message: "這個物品不能直接裝備。" };
  }

  const nextAccount = structuredClone(account);
  nextAccount.equipped[item.slot] = nextAccount.equipped[item.slot] === itemId ? null : itemId;
  return { ok: true, account: nextAccount, message: "背包已更新。" };
}

export function applyHousePaint(account, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || item.type !== "house-paint") {
    return { ok: false, message: "找不到這個房子噴漆。" };
  }
  if (!account.inventory.includes(itemId)) {
    return { ok: false, message: "你還沒有這個噴漆。" };
  }
  if (!account.house) {
    return { ok: false, message: "你要先蓋房子，才能使用噴漆。" };
  }

  const nextAccount = structuredClone(account);
  nextAccount.house.paint ||= {};
  nextAccount.house.paint[item.target] = item.paint.id;
  return { ok: true, account: nextAccount, message: `${item.name}已使用。` };
}

export function canFly(account) {
  return account.equipped.clothes === "wings" || String(account.equipped.clothes || "").includes("wings");
}

export function addFriend(account, friendCode) {
  const code = normalizeAccountCode(friendCode);
  if (!code || code === account.code) {
    return { ok: false, message: "不能加入這個好友。" };
  }
  if (account.friends.includes(code)) {
    return { ok: false, message: "已經是好友了。" };
  }
  const nextAccount = structuredClone(account);
  nextAccount.friends.push(code);
  return { ok: true, account: nextAccount, message: "好友已加入。" };
}

export function sendCoinGift(sender, recipient, rawAmount, giftDetails = {}) {
  const amount = Math.floor(Number(rawAmount));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "請輸入要送出的金幣數量。" };
  }
  if (amount > 999999) {
    return { ok: false, message: "一次最多可以送 999999 金幣。" };
  }
  if (!sender.friends.includes(recipient.code)) {
    return { ok: false, message: "只能送給你的好友。" };
  }
  if (!sender.isHost && sender.coins < amount) {
    return { ok: false, message: "金幣不夠，不能送出。" };
  }

  const nextSender = structuredClone(sender);
  const nextRecipient = structuredClone(recipient);
  if (!nextSender.isHost) nextSender.coins -= amount;
  nextRecipient.giftInbox ||= [];
  nextRecipient.giftInbox.push({
    id: giftDetails.id || null,
    from: nextSender.code,
    kind: "coins",
    coins: amount,
    sentAt: giftDetails.sentAt || null
  });

  return {
    ok: true,
    sender: nextSender,
    recipient: nextRecipient,
    message: `已送出 ${amount} 金幣。`
  };
}

export function sendDiamondGift(sender, recipient, rawAmount, giftDetails = {}) {
  const amount = Math.floor(Number(rawAmount));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "請輸入要送出的鑽石數量。" };
  }
  if (amount > 9999) {
    return { ok: false, message: "一次最多可以送 9999 顆鑽石。" };
  }
  if (!sender.friends.includes(recipient.code)) {
    return { ok: false, message: "只能送給你的好友。" };
  }
  if (!sender.isHost && Number(sender.diamonds || 0) < amount) {
    return { ok: false, message: "鑽石不夠，不能送出。" };
  }

  const nextSender = structuredClone(sender);
  const nextRecipient = structuredClone(recipient);
  if (!nextSender.isHost) nextSender.diamonds -= amount;
  nextRecipient.giftInbox ||= [];
  nextRecipient.giftInbox.push({
    id: giftDetails.id || null,
    from: nextSender.code,
    kind: "diamonds",
    diamonds: amount,
    sentAt: giftDetails.sentAt || null
  });

  return {
    ok: true,
    sender: nextSender,
    recipient: nextRecipient,
    message: `已送出 ${amount} 顆鑽石。`
  };
}

export function challengeLevelForAccounts(accounts) {
  const hasOnlyHosts = accounts.length > 0 && accounts.every((account) => account.isHost);
  if (hasOnlyHosts) return MAX_PLAYER_LEVEL;
  const levels = accounts
    .map((account) => Number(account.level))
    .filter((level) => Number.isFinite(level) && level > 0);
  return clampChallengeLevel(Math.min(...(levels.length ? levels : [1])));
}

export function completeChallenge(account, rewardCoins = 500) {
  if (account.isHost) {
    return { ok: true, account: structuredClone(account), coinsAdded: 0, levelAdded: 0, message: "主機完成闖關。" };
  }
  const nextAccount = structuredClone(account);
  const previousLevel = clampChallengeLevel(nextAccount.level || 1);
  const nextLevel = Math.min(MAX_PLAYER_LEVEL, previousLevel + 1);
  nextAccount.coins += rewardCoins;
  nextAccount.level = nextLevel;
  const levelAdded = nextLevel - previousLevel;
  return {
    ok: true,
    account: nextAccount,
    coinsAdded: rewardCoins,
    levelAdded,
    message: levelAdded
      ? `闖關成功，獲得 ${rewardCoins} 金幣，升到 Lv. ${nextAccount.level}。`
      : `闖關成功，獲得 ${rewardCoins} 金幣，等級已經是 Lv. ${MAX_PLAYER_LEVEL}。`
  };
}

export function clampChallengeLevel(level = 1) {
  const number = Number(level);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(MAX_PLAYER_LEVEL, Math.floor(number)));
}

export function getChallengePlatforms(level = 1) {
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
    d: index === 0 ? 10 : depth
  }));
}

export function challengeStartForLevel(level = 1) {
  const difficulty = clampChallengeLevel(level);
  return {
    x: CHALLENGE_BASE.x - (difficulty - 1) * 130,
    y: CHALLENGE_BASE.y,
    z: CHALLENGE_BASE.z - (difficulty % 5) * 110
  };
}

export function challengeFinishForLevel(level = 1) {
  const platforms = getChallengePlatforms(level);
  const last = platforms.at(-1);
  return { x: last.x + 4, y: last.y + 2.2, z: last.z, w: 8, d: 8 };
}

export function richestDiamondAccountCode(accounts = []) {
  const ranked = accounts
    .filter((account) => account?.code)
    .map((account) => ({
      code: account.code,
      diamonds: account.isHost ? Number.MAX_SAFE_INTEGER : Number(account.diamonds || 0)
    }))
    .sort((a, b) => b.diamonds - a.diamonds || String(a.code).localeCompare(String(b.code)));
  return ranked[0]?.code || null;
}

export function updateSurvivalStats(account, seconds = 0) {
  const nextAccount = structuredClone(account);
  nextAccount.hunger = clampPercent(nextAccount.hunger ?? 100);
  nextAccount.thirst = clampPercent(nextAccount.thirst ?? 100);
  if (nextAccount.survivalMode !== "adult" || nextAccount.isHost) {
    return { account: nextAccount, died: false };
  }
  nextAccount.hunger = clampPercent(nextAccount.hunger - seconds * SURVIVAL_DRAIN_PER_SECOND.hunger);
  nextAccount.thirst = clampPercent(nextAccount.thirst - seconds * SURVIVAL_DRAIN_PER_SECOND.thirst);
  const died = nextAccount.hunger <= 0 || nextAccount.thirst <= 0;
  if (died) {
    nextAccount.hunger = 100;
    nextAccount.thirst = 100;
  }
  return { account: nextAccount, died };
}

export function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 100;
  return Math.max(0, Math.min(100, number));
}

export function claimLevelReward(account, level) {
  if (account.isHost) {
    return { ok: false, message: "主機不用領等級獎勵，已經是無限資源。" };
  }
  const rewardLevel = Number(level);
  const reward = LEVEL_REWARDS.find((candidate) => candidate.level === rewardLevel);
  if (!reward) {
    return { ok: false, message: "這個等級沒有獎勵。" };
  }
  if (Number(account.level || 1) < reward.level) {
    return { ok: false, message: `要 Lv. ${reward.level} 才能領這個獎勵。` };
  }
  const claimed = Array.isArray(account.claimedLevelRewards) ? account.claimedLevelRewards : [];
  if (claimed.includes(reward.level)) {
    return { ok: false, message: "這個等級獎勵已經領過了。" };
  }

  const nextAccount = structuredClone(account);
  nextAccount.claimedLevelRewards = [...claimed, reward.level].sort((a, b) => a - b);
  nextAccount.coins += Number(reward.coins || 0);
  nextAccount.diamonds = Number(nextAccount.diamonds || 0) + Number(reward.diamonds || 0);
  if (reward.itemId && !nextAccount.inventory.includes(reward.itemId)) {
    nextAccount.inventory.push(reward.itemId);
  }

  const itemText = reward.itemName ? `，獲得 ${reward.itemName}` : "";
  return {
    ok: true,
    account: nextAccount,
    reward,
    message: `領到 Lv. ${reward.level} 獎勵：${reward.coins} 金幣、${reward.diamonds || 0} 鑽石${itemText}。`
  };
}
