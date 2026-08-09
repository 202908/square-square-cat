import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

export const HOST_CODE = process.env.HOST_ACCOUNT_CODE || null;
export const HOST_PASSWORD = process.env.HOST_PASSWORD || null;

export const DEFAULT_COIN_CODES = {};
export const CAT_VARIANTS = [
  "black", "white", "calico", "orange", "blue", "moonPinkEar", "storm", "lavender", "mint", "gold", "chocolate",
  "janSnow", "febHeart", "marSakura", "aprRain", "mayEmerald", "junOcean",
  "julSunset", "augNebula", "sepMooncake", "octPumpkin", "novAurora", "decStarlight"
];
export const CAT_VARIANT_RARITIES = [
  { id: "black", weight: 18, rarity: "common" },
  { id: "white", weight: 18, rarity: "common" },
  { id: "calico", weight: 18, rarity: "common" },
  { id: "orange", weight: 18, rarity: "common" },
  { id: "chocolate", weight: 8, rarity: "uncommon" },
  { id: "mint", weight: 6, rarity: "rare" },
  { id: "gold", weight: 4, rarity: "rare" },
  { id: "lavender", weight: 4, rarity: "rare" },
  { id: "storm", weight: 2, rarity: "ultraRare" },
  { id: "blue", weight: 2, rarity: "ultraRare" },
  { id: "moonPinkEar", weight: 2, rarity: "ultraRare" }
];
export const GENDER_OPTIONS = ["male", "female", "private"];
export const BLIND_BOX_BASE_DIAMOND_COST = 10;
export const BLIND_BOX_PITY_DRAWS = 10;
export const BLIND_BOX_WIN_CHANCE = 0.16;
export const BLIND_BOX_SKIN_COIN_VALUE = 1200;
export const COIN_TO_DIAMOND_RATE = 10;
export const HOST_DAY_GIFT = {
  id: "host-day-12-27",
  month: 12,
  day: 27,
  coins: 100,
  diamonds: 50,
  name: "主機日禮包"
};
export const MONTHLY_CAT_VARIANTS = [
  { month: 1, id: "janSnow", name: "一月雪光貓" },
  { month: 2, id: "febHeart", name: "二月愛心貓" },
  { month: 3, id: "marSakura", name: "三月櫻花貓" },
  { month: 4, id: "aprRain", name: "四月雨滴貓" },
  { month: 5, id: "mayEmerald", name: "五月翡翠貓" },
  { month: 6, id: "junOcean", name: "六月海洋貓" },
  { month: 7, id: "julSunset", name: "七月夕陽貓" },
  { month: 8, id: "augNebula", name: "八月星雲貓" },
  { month: 9, id: "sepMooncake", name: "九月月餅貓" },
  { month: 10, id: "octPumpkin", name: "十月南瓜貓" },
  { month: 11, id: "novAurora", name: "十一月極光貓" },
  { month: 12, id: "decStarlight", name: "十二月星光王冠貓", tier: "special" }
];
export const BLIND_BOX_CONSOLATION_REWARDS = [
  { kind: "coins", coins: 60 },
  { kind: "coins", coins: 100 },
  { kind: "coins", coins: 160 },
  { kind: "diamonds", diamonds: 3 },
  { kind: "diamonds", diamonds: 5 },
  { kind: "item", itemId: "star-hat" },
  { kind: "item", itemId: "nebula-scarf" },
  { kind: "item", itemId: "moon-hat" },
  { kind: "item", itemId: "cloud-trail" },
  { kind: "item", itemId: "rainbow-trail" }
];
export const MAX_PLAYER_LEVEL = 100;
export const MAX_CHALLENGE_STEP_Y = 2.8;
export const CHALLENGE_BASE = { x: -760, y: 1.2, z: -720 };
export const ROOM_CENTER = { x: 220, z: 0 };
export const ROOM_SIZE = 36;
export const ROOM_BOUNDS = {
  minX: ROOM_CENTER.x - ROOM_SIZE / 2 + 3,
  maxX: ROOM_CENTER.x + ROOM_SIZE / 2 - 3,
  minZ: ROOM_CENTER.z - ROOM_SIZE / 2 + 3,
  maxZ: ROOM_CENTER.z + ROOM_SIZE / 2 - 3
};
export const SURVIVAL_DRAIN_PER_SECOND = { hunger: 0.18, thirst: 0.24 };
export const WEATHER_MODES = ["auto", "rain", "thunder", "rainbow", "aurora"];
export const HOST_AVATAR_URL = "/assets/host-avatar.png";
export const MAX_AVATAR_DATA_URL_LENGTH = 500000;
export const CHAT_TEXT_COLORS = {
  pink: "#ff8fcb",
  blue: "#62b7ff",
  red: "#ff5a6c",
  orange: "#ff9b3d",
  yellow: "#ffd95a",
  green: "#67d88a",
  purple: "#b78cff",
  white: "#ffffff",
  black: "#111111",
  gold: "#f7c948",
  mint: "#8fffd2"
};
export const HOST_CHAT_COLOR_CYCLE = ["blue", "white", "pink"];
export const CHAT_MESSAGE_VISIBILITIES = {
  friends: { id: "friends", token: "friend", name: "只給好友看" }
};
export const CHAT_MESSAGE_DECORATIONS = {
  jellyfish: { id: "jellyfish", name: "水母", token: "jellyfish", color: "#74d8ff", icon: "水母" },
  candy: { id: "candy", name: "糖果", token: "candy", color: "#ff8fcb", icon: "糖果" },
  coin: { id: "coin", name: "金幣", token: "coin", color: "#f7c948", icon: "金幣" },
  snake: { id: "snake", name: "蛇蛇", token: "snake", color: "#67d88a", icon: "蛇" },
  planet: { id: "planet", name: "星球", token: "planet", color: "#b78cff", icon: "星球" },
  bow: { id: "bow", name: "蝴蝶結", token: "bow", color: "#ff9bd7", icon: "蝴蝶結" },
  strawberry: { id: "strawberry", name: "草莓", token: "strawberry", color: "#ff7aa8", icon: "草莓" }
};
export const CHAT_EASTER_EGGS = [
  { id: "meow", name: "喵喵足跡", triggers: ["喵", "meow", "cat"], icon: "🐾" },
  { id: "rainbow", name: "彩虹閃閃", triggers: ["彩虹", "rainbow"], icon: "🌈" },
  { id: "moon", name: "月亮小光", triggers: ["月亮", "moon"], icon: "🌙" },
  { id: "star", name: "星星飛出", triggers: ["星星", "star"], icon: "✨" },
  { id: "wing", name: "翅膀飄飄", triggers: ["翅膀", "wings"], icon: "🪽" }
];
export const ISLAND_CODES = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export const FREE_ISLAND_CODES = ISLAND_CODES.slice(0, 11);
export const ROCKET_MAX_LEVEL = 5;
export const ROCKET_UPGRADE_COSTS = [0, 300, 700, 1200, 1800];
export const HOST_ISLAND_CODE = "Inn";
export const HOST_DEFAULT_ROCKET_PAINT = "pink";
export const HOST_DEFAULT_INVENTORY = ["cat-house", "rocket", "wings", "rainbow-trail", "cat-pet"];
export const HOST_DEFAULT_HOUSE = {
  x: 2,
  y: 1,
  z: -28,
  yaw: 0,
  island: HOST_ISLAND_CODE,
  paint: { body: "rainbow", roof: "purple" }
};
export const ROCKET_PARK_OFFSET = { x: -8, z: 7 };
export const WEATHER_LABELS = {
  auto: "晴天/日夜",
  rain: "下雨",
  thunder: "打雷",
  rainbow: "彩虹",
  aurora: "極光"
};
export const REMOVED_ITEM_IDS = new Set(["poop-statue", "poop-trail"]);
export const DEFAULT_TITLE_ID = "rookie-cat";
export const DEFAULT_TITLES = {
  [DEFAULT_TITLE_ID]: { id: DEFAULT_TITLE_ID, name: "新手貓貓", color: "black" },
  "super-cat": { id: "super-cat", name: "超級貓貓", colors: ["red", "deepBlue", "red", "deepBlue"] },
  "park-lover-kitten": { id: "park-lover-kitten", name: "喜愛樂園的小貓", colors: ["pink", "lightBlue"] },
  "monster-king": { id: "monster-king", name: "怪物消滅之王", color: "yellow" },
  "lucky-coin-king": { id: "lucky-coin-king", name: "幸運金幣之王", color: "yellow" },
  "chat-king": { id: "chat-king", name: "團聚貓貓王", colors: ["red", "yellow"] },
  "host-cat": { id: "host-cat", name: "月之貓", colors: ["pink", "white", "lightBlue"] }
};
export const TITLE_COLORS = {
  black: "#111111",
  white: "#ffffff",
  red: "#ff4f5f",
  orange: "#ff9b3d",
  yellow: "#ffd95a",
  green: "#67d88a",
  blue: "#62b7ff",
  indigo: "#5b6dff",
  purple: "#b78cff",
  pink: "#ff8fcb",
  magenta: "#ff3fb4",
  lightBlue: "#9ee7ff",
  deepBlue: "#173d8f",
  starryBlue: "#11295f",
  aurora: "aurora",
  rainbow: "rainbow",
  peach: "#ffb58a",
  mint: "#8fffd2",
  gold: "#ffd166"
};

const KEPT_EXTRA_NON_FURNITURE_ITEM_IDS = new Set([
  "sun-hat", "moon-hat", "cloud-hat", "rainbow-hat", "ufo-hat", "crown-hat", "flower-hat", "ribbon-hat", "star-crown", "sleep-cap",
  "nebula-cape", "cloud-cape", "raincoat", "star-jacket", "moon-poncho", "bubble-suit", "rocket-pack", "angel-wings", "mini-wings", "butterfly-wings",
  "sparkle-trail", "heart-trail", "moon-trail", "snow-trail", "crystal-trail",
  "cat-pet"
]);

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
].filter(([id]) => KEPT_EXTRA_NON_FURNITURE_ITEM_IDS.has(id)).map(([id, name, slot, type, price]) => ({ id, name, slot, type, price }));

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
  ["moon-crystal-statue", "月亮水晶擺飾", 160],
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
].slice(0, 30).map(([id, name, price]) => ({ id, name, type: "furniture", price }));

export const HOST_DEFAULT_ROOM_FURNITURE_IDS = FURNITURE_ITEMS.map((item) => item.id);

export function roomFurniturePlacement(itemId, existingItems = []) {
  const occupied = new Set(existingItems.map((item) => `${Math.round(item.x * 10) / 10}:${Math.round(item.z * 10) / 10}`));
  const baseSlots = [
    { x: 207, z: -13 }, { x: 214, z: -13 }, { x: 221, z: -13 }, { x: 228, z: -13 }, { x: 233, z: -10 },
    { x: 207, z: -6 }, { x: 214, z: -6 }, { x: 221, z: -6 }, { x: 228, z: -6 }, { x: 233, z: -3 },
    { x: 207, z: 2 }, { x: 214, z: 2 }, { x: 221, z: 2 }, { x: 228, z: 2 }, { x: 233, z: 5 },
    { x: 207, z: 10 }, { x: 214, z: 10 }, { x: 221, z: 10 }, { x: 228, z: 10 }, { x: 233, z: 12 }
  ];
  const preferredSlots = furnitureSlotGroup(itemId);
  const preferred = firstAvailableRoomSlot(preferredSlots, occupied, 0);
  if (preferred) return preferred;
  let hash = 0;
  for (const char of itemId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const fallback = firstAvailableRoomSlot(baseSlots, occupied, hash);
  if (fallback) return fallback;
  const denseSlots = Array.from({ length: 7 }, (_, zIndex) =>
    Array.from({ length: 8 }, (_, xIndex) => ({
      x: 205.8 + xIndex * 4.1,
      z: -14 + zIndex * 4.6,
      yaw: 0
    }))
  ).flat();
  const dense = firstAvailableRoomSlot(denseSlots, occupied, hash);
  if (dense) return dense;
  const row = existingItems.length % 8;
  const col = Math.floor(existingItems.length / 8) % 7;
  return { x: 205.8 + row * 4.1, y: 1, z: -14 + col * 4.6, yaw: 0 };
}

function firstAvailableRoomSlot(slots, occupied, startOffset) {
  for (let offset = 0; offset < slots.length; offset += 1) {
    const slot = slots[(startOffset + offset) % slots.length];
    const key = `${Math.round(slot.x * 10) / 10}:${Math.round(slot.z * 10) / 10}`;
    if (!occupied.has(key)) return { x: slot.x, y: 1, z: slot.z, yaw: slot.yaw || 0 };
  }
  return null;
}

export function roomFurniturePlatforms(itemId) {
  if (itemId === "cat-tree") {
    return [
      { offsetX: -1.6, offsetZ: 0.8, w: 2.4, d: 2.2, y: 2.15 },
      { offsetX: 1.4, offsetZ: -0.9, w: 2.5, d: 2.1, y: 3.35 },
      { offsetX: 0, offsetZ: 0.2, w: 2.2, d: 2, y: 4.65 }
    ];
  }
  if (itemId === "mini-slide-toy") {
    return [
      { offsetX: -2.2, offsetZ: 0, w: 2.8, d: 3.4, y: 3.25 },
      { offsetX: 1.2, offsetZ: 0, w: 3.6, d: 3.4, y: 1.65 }
    ];
  }
  if (itemId.includes("rug") || itemId.includes("carpet") || itemId.includes("mat")) {
    return [{ offsetX: 0, offsetZ: 0, w: 5.2, d: 3.6, y: 1.16 }];
  }
  if (itemId.includes("bed") || itemId.includes("sofa") || itemId.includes("beanbag")) {
    return [{ offsetX: 0, offsetZ: 0, w: 5.4, d: 3.5, y: 1.9 }];
  }
  if (itemId.includes("table") || itemId.includes("desk") || itemId.includes("stand") || itemId.includes("tea")) {
    return [{ offsetX: 0, offsetZ: 0, w: 3.8, d: 3.8, y: 2.15 }];
  }
  if (itemId.includes("chair") || itemId.includes("stool") || itemId.includes("pillow") || itemId.includes("cushion")) {
    return [{ offsetX: 0, offsetZ: 0, w: 3, d: 3, y: 1.95 }];
  }
  if (itemId.includes("shelf") || itemId.includes("cabinet") || itemId.includes("drawer") || itemId.includes("wardrobe") || itemId.includes("fridge")) {
    return [{ offsetX: 0, offsetZ: 0, w: 2.8, d: 1.8, y: 4.9 }];
  }
  if (itemId.includes("piano") || itemId.includes("kitchen") || itemId.includes("bathtub")) {
    return [{ offsetX: 0, offsetZ: 0, w: 4.6, d: 2.8, y: 3.35 }];
  }
  if (itemId.includes("lamp") || itemId.includes("lantern") || itemId.includes("light") || itemId.includes("plant") || itemId.includes("fishbowl") || itemId.includes("snow")) {
    return [{ offsetX: 0, offsetZ: 0, w: 2.4, d: 2.4, y: 2.45 }];
  }
  if (itemId.includes("poster") || itemId.includes("window") || itemId.includes("curtain") || itemId.includes("garland") || itemId.includes("tv") || itemId.includes("mirror") || itemId.includes("clock")) {
    return [{ offsetX: 0, offsetZ: 0, w: 3.8, d: 0.7, y: 3.2 }];
  }
  return [{ offsetX: 0, offsetZ: 0, w: 2.6, d: 2.6, y: 2.25 }];
}

function furnitureSlotGroup(itemId) {
  if (itemId === "mini-slide-toy") {
    return [{ x: 232, z: 8, yaw: -Math.PI / 2 }, { x: 232, z: -5, yaw: -Math.PI / 2 }];
  }
  if (itemId === "cat-tree") {
    return [{ x: 207, z: 7, yaw: Math.PI / 2 }, { x: 207, z: -5, yaw: Math.PI / 2 }];
  }
  if (itemId.includes("bed") || itemId.includes("sofa") || itemId.includes("beanbag")) {
    return [{ x: 211, z: -13, yaw: 0 }, { x: 229, z: -13, yaw: 0 }, { x: 211, z: 12, yaw: Math.PI }];
  }
  if (itemId.includes("table") || itemId.includes("desk") || itemId.includes("tea") || itemId.includes("piano")) {
    return [{ x: 220, z: 0 }, { x: 214, z: 4 }, { x: 226, z: 4 }];
  }
  if (itemId.includes("chair") || itemId.includes("stool") || itemId.includes("pillow") || itemId.includes("cushion")) {
    return [{ x: 214, z: -1 }, { x: 226, z: -1 }, { x: 214, z: 7 }, { x: 226, z: 7 }];
  }
  if (itemId.includes("lamp") || itemId.includes("lantern") || itemId.includes("light") || itemId.includes("plant") || itemId.includes("snow")) {
    return [{ x: 207, z: -13 }, { x: 233, z: -13 }, { x: 207, z: 13 }, { x: 233, z: 13 }];
  }
  if (itemId.includes("rug") || itemId.includes("carpet") || itemId.includes("mat")) {
    return [{ x: 220, z: 5 }, { x: 220, z: -5 }, { x: 214, z: 5 }, { x: 226, z: 5 }];
  }
  if (itemId.includes("shelf") || itemId.includes("cabinet") || itemId.includes("drawer") || itemId.includes("wardrobe") || itemId.includes("fridge") || itemId.includes("kitchen")) {
    return [{ x: 206, z: -8, yaw: Math.PI / 2 }, { x: 206, z: 2, yaw: Math.PI / 2 }, { x: 232, z: -8, yaw: -Math.PI / 2 }];
  }
  if (itemId.includes("poster") || itemId.includes("window") || itemId.includes("curtain") || itemId.includes("garland") || itemId.includes("tv") || itemId.includes("mirror") || itemId.includes("clock")) {
    return [{ x: 220, z: -14, yaw: 0 }, { x: 212, z: -14, yaw: 0 }, { x: 228, z: -14, yaw: 0 }];
  }
  return [{ x: 220, z: 9 }, { x: 211, z: 4 }, { x: 229, z: 4 }];
}

export function createHostDefaultRoomItems() {
  const roomItems = [];
  for (const itemId of HOST_DEFAULT_ROOM_FURNITURE_IDS) {
    roomItems.push({
      id: `host-room-${itemId}`,
      itemId,
      ...roomFurniturePlacement(itemId, roomItems)
    });
  }
  return roomItems;
}

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

export const ROCKET_PAINT_STYLES = [
  ["pink", "粉色", 0xff8fcb, 120],
  ["light-blue", "淺藍色", 0x9ee7ff, 120],
  ["red", "紅色", 0xff4f5f, 100],
  ["orange", "橘色", 0xff9b3d, 100],
  ["deep-blue", "深藍色", 0x173d8f, 140],
  ["rainbow", "彩虹色", 0xffffff, 320]
].map(([id, name, color, price]) => ({ id, name, color, price }));

export const ROCKET_PAINT_ITEMS = ROCKET_PAINT_STYLES.map((paint) => ({
  id: `rocket-paint-${paint.id}`,
  name: `${paint.name}火箭噴漆`,
  type: "rocket-paint",
  paint,
  price: paint.price
}));

export const CONSUMABLE_ITEMS = [
  { id: "word-firework", name: "文字煙火", type: "consumable", effect: "firework", needsText: true, price: 180 },
  { id: "heart-firework", name: "愛心煙火", type: "consumable", effect: "heart-firework", needsText: true, price: 220 },
  { id: "star-popper", name: "星星爆竹", type: "consumable", effect: "star-popper", price: 120 },
  { id: "bubble-fountain", name: "泡泡噴泉", type: "consumable", effect: "bubble-fountain", price: 140 },
  { id: "moon-flower", name: "月光花", type: "consumable", effect: "moon-flower", price: 160 },
  { id: "confetti-cannon", name: "彩紙砲", type: "consumable", effect: "confetti-cannon", price: 130 },
  { id: "fur-change-ticket", name: "毛色更改卷", type: "consumable", effect: "fur-change", price: 260 }
];

export const SHOP_ITEMS = [
  { id: "star-hat", name: "星星帽", slot: "hat", type: "wearable", price: 120 },
  { id: "nebula-scarf", name: "星雲圍巾", slot: "clothes", type: "wearable", price: 220 },
  { id: "wings", name: "貓眼星雲翅膀", slot: "clothes", type: "wearable", price: 1500 },
  { id: "cloud-trail", name: "雲朵拖尾", slot: "trail", type: "trail", price: 260 },
  { id: "rainbow-trail", name: "彩虹拖尾特效", slot: "trail", type: "trail", price: 360 },
  { id: "star-trail", name: "星星拖尾", slot: "trail", type: "trail", price: 300 },
  { id: "bubble-trail", name: "泡泡拖尾", slot: "trail", type: "trail", price: 220 },
  { id: "pudding-trail", name: "布丁拖尾", slot: "trail", type: "trail", price: 280 },
  { id: "moonlight-trail", name: "月光拖尾", slot: "trail", type: "trail", price: 300 },
  { id: "takoyaki-trail", name: "章魚燒拖尾", slot: "trail", type: "trail", price: 320 },
  { id: "cat-house", name: "小貓房子", type: "house", price: 1000 },
  { id: "rocket", name: "小貓火箭", type: "rocket", price: 500 },
  ...ROCKET_PAINT_ITEMS,
  ...CONSUMABLE_ITEMS,
  ...HOUSE_PAINT_ITEMS,
  ...EXTRA_NON_FURNITURE_ITEMS,
  ...FURNITURE_ITEMS
].filter((item) => item.type !== "pet" || item.id === "cat-pet").map((item) => {
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

const LEVEL_REWARD_ITEMS = {
  7: "star-hat",
  10: "cat-pet",
  15: "rainbow-trail",
  20: "mini-wings",
  25: "house-body-paint-starry-night",
  30: "angel-wings",
  40: "crystal-trail",
  50: "crystal-pet",
  75: "house-roof-paint-starry-night",
  100: "crown-hat"
};

export const LEVEL_REWARDS = Array.from({ length: MAX_PLAYER_LEVEL - 1 }, (_, index) => {
  const level = index + 2;
  return {
    level,
    coins: 80 + level * 45 + (level % 10 === 0 ? level * 20 : 0),
    diamonds: level % 10 === 0 ? Math.ceil(level / 5) : level % 5 === 0 ? Math.ceil(level / 10) : 0,
    itemId: LEVEL_REWARD_ITEMS[level] || null
  };
}).map((reward) => {
  const item = reward.itemId ? SHOP_ITEMS.find((candidate) => candidate.id === reward.itemId) : null;
  return { ...reward, itemName: item?.name || null };
});

const LEVEL_TASK_PATTERNS = [
  { metric: "ferrisRides", action: "搭摩天輪", unit: "次", baseTarget: 1, every: 12 },
  { metric: "slideRides", action: "溜溜滑梯", unit: "次", baseTarget: 1, every: 10 },
  { metric: "swingRides", action: "盪鞦韆", unit: "次", baseTarget: 1, every: 10 },
  { metric: "riverStays10s", action: "在溪流裡停留滿 10 秒", unit: "次", baseTarget: 1, every: 9 },
  { metric: "diamondsFound", action: "翻草叢找到鑽石", unit: "顆", baseTarget: 1, every: 8 },
  { metric: "coinsCollected", action: "在島上撿金幣", unit: "枚", baseTarget: 8, every: 5 },
  { metric: "bushesSearched", action: "翻開草叢", unit: "次", baseTarget: 2, every: 4 },
  { metric: "itemsBought", action: "在商城買東西", unit: "樣", baseTarget: 1, every: 12 },
  { metric: "furniturePlaced", action: "在房間擺家具", unit: "樣", baseTarget: 1, every: 8 },
  { metric: "housesPlaced", action: "在島上蓋房子", unit: "次", baseTarget: 1, every: 25 },
  { metric: "friendsAdded", action: "加好友", unit: "位", baseTarget: 1, every: 18 },
  { metric: "chatMessages", action: "在聊天區留言", unit: "次", baseTarget: 2, every: 4 },
  { metric: "coinPacksOpened", action: "解開金幣代碼", unit: "次", baseTarget: 1, every: 20 }
];

export const LEVEL_TASKS = Array.from({ length: MAX_PLAYER_LEVEL - 1 }, (_, index) => {
  const level = index + 1;
  const pattern = LEVEL_TASK_PATTERNS[index % LEVEL_TASK_PATTERNS.length];
  const cycle = Math.floor(index / LEVEL_TASK_PATTERNS.length);
  const target = pattern.baseTarget + cycle * pattern.every;
  return {
    level,
    nextLevel: level + 1,
    challengeTarget: level,
    metric: pattern.metric,
    target,
    action: pattern.action,
    unit: pattern.unit,
    description: `完成第 ${level} 次闖關，並且${pattern.action}累積 ${target}${pattern.unit}`
  };
});

const ACHIEVEMENT_DEFAULTS = {
  challengeCompletions: 0,
  ferrisRides: 0,
  swingRides: 0,
  slideRides: 0,
  monstersDefeated: 0,
  coinPacksOpened: 0,
  chatMessages: 0,
  riverStays10s: 0,
  diamondsFound: 0,
  coinsCollected: 0,
  bushesSearched: 0,
  itemsBought: 0,
  furniturePlaced: 0,
  housesPlaced: 0,
  friendsAdded: 0
};

export function withAchievementDefaults(account) {
  const nextAccount = structuredClone(account);
  nextAccount.achievements = {
    ...ACHIEVEMENT_DEFAULTS,
    ...(nextAccount.achievements || {})
  };
  return nextAccount;
}

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

export function normalizeWeatherMode(mode) {
  const value = String(mode || "").trim();
  return WEATHER_MODES.includes(value) ? value : "auto";
}

export function normalizeIslandCode(value) {
  const code = String(value || "").trim();
  if (code.toLowerCase() === HOST_ISLAND_CODE.toLowerCase()) return HOST_ISLAND_CODE;
  const upper = code.toUpperCase();
  return ISLAND_CODES.includes(upper) ? upper : "A";
}

export function canTravelToIsland(account, rawIsland, invited = false) {
  const island = normalizeIslandCode(rawIsland);
  if (island === normalizeIslandCode(account.currentIsland || "A")) return true;
  if (invited) return true;
  if (account.isHost) return true;
  if (island === HOST_ISLAND_CODE) return Boolean(account.isHost);
  if (FREE_ISLAND_CODES.includes(island)) return true;
  if (!account.inventory?.includes("rocket")) return false;
  return rocketLevelCanReachIsland(account.rocketLevel || 1, island);
}

export function rocketLevelCanReachIsland(level, rawIsland) {
  const island = normalizeIslandCode(rawIsland);
  if (FREE_ISLAND_CODES.includes(island)) return true;
  const index = ISLAND_CODES.indexOf(island);
  if (index < FREE_ISLAND_CODES.length) return true;
  const requiredLevel = Math.ceil((index - FREE_ISLAND_CODES.length + 1) / 3);
  return Math.max(1, Math.min(ROCKET_MAX_LEVEL, Number(level || 1))) >= requiredLevel;
}

export function upgradeRocket(account) {
  if (!account.inventory?.includes("rocket")) {
    return { ok: false, message: "你要先有火箭才能升級。" };
  }
  const currentLevel = Math.max(1, Math.min(ROCKET_MAX_LEVEL, Number(account.rocketLevel || 1)));
  if (currentLevel >= ROCKET_MAX_LEVEL) {
    return { ok: false, message: "火箭已經升到最高 5 階了。" };
  }
  const cost = ROCKET_UPGRADE_COSTS[currentLevel] || 0;
  if (!account.isHost && Number(account.coins || 0) < cost) {
    return { ok: false, message: `金幣不夠，升到 ${currentLevel + 1} 階需要 ${cost} 金幣。` };
  }
  const nextAccount = structuredClone(account);
  nextAccount.rocketLevel = currentLevel + 1;
  if (!nextAccount.isHost) nextAccount.coins -= cost;
  return { ok: true, account: nextAccount, message: `火箭升到 ${nextAccount.rocketLevel} 階。` };
}

export function rocketParkingSpot(account) {
  const house = account?.house;
  if (!house) return null;
  return {
    x: house.x + ROCKET_PARK_OFFSET.x,
    y: house.y,
    z: house.z + ROCKET_PARK_OFFSET.z,
    yaw: house.yaw || 0
  };
}

export function normalizeAccountCode(code) {
  return String(code || "").trim();
}

export function normalizeGender(gender) {
  return GENDER_OPTIONS.includes(gender) ? gender : "private";
}

export function normalizeAvatarDataUrl(value) {
  const avatar = String(value || "").trim();
  if (!avatar) return null;
  if (avatar.length > MAX_AVATAR_DATA_URL_LENGTH) return null;
  if (!/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(avatar)) return null;
  return avatar;
}

export function parseChatMessage(rawText) {
  const raw = String(rawText || "").slice(0, 180);
  const suffixMatch = raw.match(/@\(([a-z]+)\)(?:\(([a-z]+)\))?\s*$/);
  const suffixes = suffixMatch ? [suffixMatch[1], suffixMatch[2]].filter(Boolean) : [];
  const color = suffixes.find((suffix) => CHAT_TEXT_COLORS[suffix]) || null;
  const decorationKey = suffixes.find((suffix) => CHAT_MESSAGE_DECORATIONS[suffix]) || null;
  const visibility = suffixes.includes(CHAT_MESSAGE_VISIBILITIES.friends.token) ? CHAT_MESSAGE_VISIBILITIES.friends.id : null;
  const decoration = decorationKey ? CHAT_MESSAGE_DECORATIONS[decorationKey] : null;
  const shouldHideSuffix = Boolean(color || decoration || visibility);
  const text = (shouldHideSuffix ? raw.slice(0, suffixMatch.index) : raw).trim().slice(0, 160);
  const lowered = text.toLowerCase();
  const easterEgg = CHAT_EASTER_EGGS.find((egg) =>
    egg.triggers.some((trigger) => lowered.includes(String(trigger).toLowerCase()))
  ) || null;
  return {
    text,
    color: color || decoration?.id || null,
    colorValue: color ? CHAT_TEXT_COLORS[color] : decoration?.color || null,
    visibility,
    decoration: decoration
      ? { id: decoration.id, name: decoration.name, token: decoration.token, color: decoration.color, icon: decoration.icon }
      : null,
    easterEgg: easterEgg ? { id: easterEgg.id, name: easterEgg.name, icon: easterEgg.icon } : null
  };
}

export function applyHostChatColor(parsedMessage, account, currentIndex = 0) {
  const parsed = parsedMessage || {};
  const index = Math.max(0, Number(currentIndex || 0));
  if (!account?.isHost || parsed.color || parsed.decoration) {
    return { message: parsed, nextIndex: index };
  }
  const color = HOST_CHAT_COLOR_CYCLE[index % HOST_CHAT_COLOR_CYCLE.length];
  const decoration = CHAT_MESSAGE_DECORATIONS.strawberry;
  return {
    message: {
      ...parsed,
      color,
      colorValue: CHAT_TEXT_COLORS[color],
      decoration: { id: decoration.id, name: decoration.name, token: decoration.token, color: decoration.color, icon: decoration.icon }
    },
    nextIndex: index + 1
  };
}

export function createAccount(code, overrides = {}) {
  const accountCode = normalizeAccountCode(code);
  const isHost = Boolean(HOST_CODE && accountCode === HOST_CODE);
  const gender = isHost ? "private" : normalizeGender(overrides.gender);
  const catVariant = overrides.catVariant || (isHost ? "host" : pickRandomCatVariant());
  const avatar = isHost ? HOST_AVATAR_URL : normalizeAvatarDataUrl(overrides.avatar);
  return {
    code: accountCode,
    level: isHost ? null : 1,
    coins: isHost ? 999999999 : 0,
    diamonds: isHost ? 999999999 : 0,
    isHost,
    catVariant,
    ownedCatVariants: normalizeOwnedCatVariants(overrides.ownedCatVariants, catVariant),
    inventory: isHost ? [...HOST_DEFAULT_INVENTORY] : [],
    equipped: {
      hat: null,
      clothes: isHost ? "wings" : null,
      tail: null,
      trail: isHost ? "rainbow-trail" : null,
      pet: isHost ? "cat-pet" : null,
      title: isHost ? "host-cat" : DEFAULT_TITLE_ID
    },
    titles: isHost ? [DEFAULT_TITLE_ID, "host-cat"] : [DEFAULT_TITLE_ID],
    achievements: { ...ACHIEVEMENT_DEFAULTS },
    house: isHost ? structuredClone(HOST_DEFAULT_HOUSE) : null,
    roomItems: isHost ? createHostDefaultRoomItems() : [],
    currentIsland: isHost ? HOST_ISLAND_CODE : "A",
    rocketPaint: isHost ? HOST_DEFAULT_ROCKET_PAINT : "classic",
    rocketLevel: isHost ? ROCKET_MAX_LEVEL : 1,
    giftInbox: [],
    redeemedCodes: [],
    claimedEventGifts: [],
    claimedLevelRewards: [],
    friends: [],
    friendRequests: [],
    gender,
    avatar,
    blindBoxPity: { month: null, draws: 0 },
    survivalMode: isHost ? "host" : null,
    hunger: 100,
    thirst: 100,
    prefers2D: false,
    createdAt: new Date().toISOString(),
    ...overrides,
    catVariant,
    ownedCatVariants: normalizeOwnedCatVariants(overrides.ownedCatVariants, catVariant),
    gender,
    avatar
  };
}

export function normalizeOwnedCatVariants(rawVariants, fallbackVariant = null) {
  const variants = Array.isArray(rawVariants) ? rawVariants : [];
  const normalized = variants.filter((variant) => CAT_VARIANTS.includes(variant) || variant === "host");
  if (fallbackVariant && (CAT_VARIANTS.includes(fallbackVariant) || fallbackVariant === "host")) {
    normalized.push(fallbackVariant);
  }
  return [...new Set(normalized)];
}

export function pickRandomCatVariant(excludedVariant = null) {
  const pool = CAT_VARIANT_RARITIES.filter((entry) => entry.id !== excludedVariant);
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll < 0) return entry.id;
  }
  return pool[0]?.id || CAT_VARIANT_RARITIES[0].id;
}

export function monthlyCatVariantForMonth(rawMonth = new Date().getMonth() + 1) {
  const month = Math.min(12, Math.max(1, Math.floor(Number(rawMonth) || 1)));
  return MONTHLY_CAT_VARIANTS.find((variant) => variant.month === month) || MONTHLY_CAT_VARIANTS[0];
}

export function monthlyCatVariantForDate(date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  return monthlyCatVariantForMonth(parsed.getMonth() + 1);
}

export function blindBoxCostForDraw(drawNumber = 1) {
  const safeDraw = Math.max(1, Math.floor(Number(drawNumber) || 1));
  return Math.ceil(BLIND_BOX_BASE_DIAMOND_COST * (1.5 ** (safeDraw - 1)));
}

export function blindBoxStateForAccount(account, date = new Date()) {
  const monthly = monthlyCatVariantForDate(date);
  const pity = account?.blindBoxPity || {};
  const draws = pity.month === monthly.month ? Math.max(0, Math.floor(Number(pity.draws || 0))) : 0;
  return {
    current: monthly,
    pityDraws: draws,
    nextDrawNumber: draws + 1,
    nextCost: blindBoxCostForDraw(draws + 1),
    pityDrawsRequired: BLIND_BOX_PITY_DRAWS
  };
}

export function makeGuestAccount(overrides = {}) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return createAccount(`guest-${suffix}`, {
    isGuest: true,
    code: `guest-${suffix}`,
    ...overrides
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
  if (item.type === "rocket" && !account.house) {
    return { ok: false, message: "你要先有房子，火箭才有地方停。" };
  }
  if (item.type !== "consumable" && account.inventory.includes(itemId)) {
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
  if (item.type === "rocket") nextAccount.rocketLevel ||= 1;
  return { ok: true, account: nextAccount, message: `買到 ${item.name}。` };
}

export function exchangeCoinsForDiamonds(account, rawDiamonds = 1) {
  const diamonds = Math.floor(Number(rawDiamonds || 0));
  if (!Number.isFinite(diamonds) || diamonds < 1) {
    return { ok: false, message: "請輸入要換幾顆鑽石。" };
  }
  const cost = diamonds * COIN_TO_DIAMOND_RATE;
  if (!account.isHost && Number(account.coins || 0) < cost) {
    return { ok: false, message: `金幣不夠，${diamonds} 顆鑽石需要 ${cost} 金幣。` };
  }
  const nextAccount = structuredClone(account);
  if (!nextAccount.isHost) {
    nextAccount.coins -= cost;
    nextAccount.diamonds = Number(nextAccount.diamonds || 0) + diamonds;
  }
  return { ok: true, account: nextAccount, message: `已用 ${cost} 金幣換到 ${diamonds} 顆鑽石。` };
}

export function drawMonthlyBlindBox(account, date = new Date(), random = Math.random) {
  const state = blindBoxStateForAccount(account, date);
  const monthly = state.current;
  if (Number(account.diamonds || 0) < state.nextCost) {
    return { ok: false, message: `鑽石不夠，這次抽需要 ${state.nextCost} 顆鑽石。` };
  }
  const nextAccount = structuredClone(account);
  nextAccount.ownedCatVariants = normalizeOwnedCatVariants(nextAccount.ownedCatVariants, nextAccount.catVariant);
  if (!nextAccount.isHost) nextAccount.diamonds -= state.nextCost;
  const win = state.nextDrawNumber >= BLIND_BOX_PITY_DRAWS || random() < BLIND_BOX_WIN_CHANCE;
  nextAccount.blindBoxPity = win
    ? { month: monthly.month, draws: 0 }
    : { month: monthly.month, draws: state.nextDrawNumber };
  if (!win) {
    const reward = applyBlindBoxConsolationReward(nextAccount, random);
    return {
      ok: true,
      account: nextAccount,
      variant: monthly,
      reward,
      won: false,
      message: blindBoxConsolationMessage(reward, state.nextDrawNumber)
    };
  }
  if (nextAccount.ownedCatVariants.includes(monthly.id)) {
    const coins = Math.floor(BLIND_BOX_SKIN_COIN_VALUE * 2 / 3);
    nextAccount.coins = Number(nextAccount.coins || 0) + coins;
    return {
      ok: true,
      account: nextAccount,
      variant: monthly,
      reward: { kind: "duplicateSkin", variant: monthly, coins },
      won: true,
      message: `抽到重複的 ${monthly.name} 皮膚，自動換成 ${coins} 金幣。`
    };
  }
  nextAccount.ownedCatVariants.push(monthly.id);
  if (!nextAccount.isHost) nextAccount.catVariant = monthly.id;
  return {
    ok: true,
    account: nextAccount,
    variant: monthly,
    reward: { kind: "skin", variant: monthly },
    won: true,
    message: nextAccount.isHost
      ? `恭喜獲得 ${monthly.name} 皮膚。`
      : `恭喜獲得 ${monthly.name} 皮膚，毛色已永久保存。`
  };
}

export function applyBlindBoxConsolationReward(account, random = Math.random) {
  const reward = BLIND_BOX_CONSOLATION_REWARDS[Math.min(
    BLIND_BOX_CONSOLATION_REWARDS.length - 1,
    Math.floor(random() * BLIND_BOX_CONSOLATION_REWARDS.length)
  )];
  if (reward.kind === "coins") {
    account.coins = Number(account.coins || 0) + reward.coins;
    return { ...reward };
  }
  if (reward.kind === "diamonds") {
    account.diamonds = Number(account.diamonds || 0) + reward.diamonds;
    return { ...reward };
  }
  const item = SHOP_ITEMS.find((candidate) => candidate.id === reward.itemId);
  if (!item) return { kind: "coins", coins: 60 };
  if (Array.isArray(account.inventory) && account.inventory.includes(item.id) && item.type !== "consumable") {
    const coins = Math.floor(Number(item.price || 0) * 2 / 3);
    account.coins = Number(account.coins || 0) + coins;
    return { kind: "duplicateItem", itemId: item.id, itemName: item.name, coins };
  }
  account.inventory = Array.isArray(account.inventory) ? account.inventory : [];
  account.inventory.push(item.id);
  return { kind: "item", itemId: item.id, itemName: item.name };
}

export function blindBoxConsolationMessage(reward, drawNumber) {
  const pityText = `目前 ${drawNumber}/${BLIND_BOX_PITY_DRAWS} 抽，第 10 抽必中。`;
  if (reward.kind === "coins") return `恭喜獲得 ${reward.coins} 金幣。${pityText}`;
  if (reward.kind === "diamonds") return `恭喜獲得 ${reward.diamonds} 顆鑽石。${pityText}`;
  if (reward.kind === "duplicateItem") return `抽到重複的 ${reward.itemName}，自動換成 ${reward.coins} 金幣。${pityText}`;
  return `恭喜獲得 ${reward.itemName}。${pityText}`;
}

export function hostDayGiftState(account, date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  const year = parsed.getFullYear();
  const claimId = `${HOST_DAY_GIFT.id}-${year}`;
  const available = parsed.getMonth() + 1 === HOST_DAY_GIFT.month && parsed.getDate() === HOST_DAY_GIFT.day;
  const claimed = Array.isArray(account?.claimedEventGifts) && account.claimedEventGifts.includes(claimId);
  return {
    ...HOST_DAY_GIFT,
    year,
    claimId,
    available,
    claimed,
    canClaim: available && !claimed
  };
}

export function claimHostDayGift(account, date = new Date()) {
  const state = hostDayGiftState(account, date);
  if (!state.available) {
    return { ok: false, message: `${HOST_DAY_GIFT.name} 要 12 月 27 日才能領。` };
  }
  if (state.claimed) {
    return { ok: false, message: `${HOST_DAY_GIFT.name} 已經領過了。` };
  }

  const nextAccount = structuredClone(account);
  nextAccount.claimedEventGifts = Array.isArray(nextAccount.claimedEventGifts) ? nextAccount.claimedEventGifts : [];
  nextAccount.claimedEventGifts.push(state.claimId);
  if (!nextAccount.isHost) {
    nextAccount.coins = Number(nextAccount.coins || 0) + HOST_DAY_GIFT.coins;
    nextAccount.diamonds = Number(nextAccount.diamonds || 0) + HOST_DAY_GIFT.diamonds;
  }
  return {
    ok: true,
    account: nextAccount,
    gift: HOST_DAY_GIFT,
    message: `領到${HOST_DAY_GIFT.name}：${HOST_DAY_GIFT.coins} 金幣、${HOST_DAY_GIFT.diamonds} 鑽石。`
  };
}

export function useConsumable(account, itemId, rawText = "") {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || item.type !== "consumable") {
    return { ok: false, message: "找不到這個一次性玩具。" };
  }
  const index = account.inventory.indexOf(itemId);
  if (index === -1) {
    return { ok: false, message: "你沒有這個一次性玩具。" };
  }
  const text = String(rawText || "").trim().slice(0, 18);
  if (item.needsText && !text) {
    return { ok: false, message: "請先輸入要顯示的文字。" };
  }
  const nextAccount = structuredClone(account);
  nextAccount.inventory.splice(index, 1);
  return {
    ok: true,
    account: nextAccount,
    effect: item.effect,
    text,
    message: `${item.name}已使用。`
  };
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

export function deleteInventoryItem(account, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) {
    return { ok: false, message: "找不到這個物品。" };
  }
  const index = account.inventory?.indexOf(itemId) ?? -1;
  if (index === -1) {
    return { ok: false, message: "背包裡沒有這個物品。" };
  }

  const refundCoins = Math.floor(Number(item.price || 0) * 2 / 3);
  const nextAccount = structuredClone(account);
  nextAccount.inventory.splice(index, 1);
  nextAccount.coins = Number(nextAccount.coins || 0) + refundCoins;
  if (item.slot && nextAccount.equipped?.[item.slot] === item.id && !nextAccount.inventory.includes(item.id)) {
    nextAccount.equipped[item.slot] = null;
  }

  return {
    ok: true,
    account: nextAccount,
    refundCoins,
    message: `刪除 ${item.name}，退還 ${refundCoins} 金幣。`
  };
}

export function equipCatVariant(account, variantId) {
  const variant = String(variantId || "");
  if (!CAT_VARIANTS.includes(variant) && variant !== "host") {
    return { ok: false, message: "找不到這個毛色。" };
  }
  const owned = normalizeOwnedCatVariants(account.ownedCatVariants, account.catVariant);
  if (!owned.includes(variant)) {
    return { ok: false, message: "你還沒有這個毛色。" };
  }
  if (account.isHost && variant !== "host") {
    return { ok: false, message: "主機外觀不用更換毛色。" };
  }
  const nextAccount = structuredClone(account);
  nextAccount.ownedCatVariants = owned;
  nextAccount.catVariant = variant;
  return { ok: true, account: nextAccount, message: "毛色已更換。" };
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

export function useRocketPaint(account, itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || item.type !== "rocket-paint") {
    return { ok: false, message: "找不到這個火箭噴漆。" };
  }
  if (!account.inventory.includes("rocket")) {
    return { ok: false, message: "你要先有火箭，才能幫火箭噴漆。" };
  }
  if (!account.inventory.includes(itemId)) {
    return { ok: false, message: "你還沒有這個火箭噴漆。" };
  }

  const nextAccount = structuredClone(account);
  nextAccount.rocketPaint = item.paint.id;
  return { ok: true, account: nextAccount, message: `火箭已換成${item.paint.name}。` };
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

export function removeFriend(account, friendCode) {
  const code = normalizeAccountCode(friendCode);
  if (!code || !(account.friends || []).includes(code)) {
    return { ok: false, message: "找不到這個好友。" };
  }
  const nextAccount = structuredClone(account);
  nextAccount.friends = (nextAccount.friends || []).filter((friend) => friend !== code);
  return { ok: true, account: nextAccount, message: "好友已刪除。" };
}

export function areHouseFriends(visitorAccount, ownerAccount) {
  if (!visitorAccount || !ownerAccount) return false;
  return Boolean(
    visitorAccount.code === ownerAccount.code
    || (visitorAccount.friends || []).includes(ownerAccount.code)
    || (ownerAccount.friends || []).includes(visitorAccount.code)
  );
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

export function completeChallenge(account, rewardCoins = 500, completedChallengeLevel = null) {
  if (account.isHost) {
    return { ok: true, account: structuredClone(account), coinsAdded: 0, levelAdded: 0, message: "主機完成闖關。" };
  }
  const nextAccount = withAchievementDefaults(account);
  const previousLevel = clampChallengeLevel(nextAccount.level || 1);
  const finishedLevel = completedChallengeLevel === null ? previousLevel : clampChallengeLevel(completedChallengeLevel);
  const countsForLevel = finishedLevel >= previousLevel;
  if (countsForLevel) {
    nextAccount.achievements.challengeCompletions += 1;
  }
  nextAccount.coins += rewardCoins;
  const task = levelTaskForLevel(previousLevel);
  const completed = countsForLevel && task ? levelTaskProgress(nextAccount, previousLevel).complete : false;
  const nextLevel = completed ? Math.min(MAX_PLAYER_LEVEL, previousLevel + 1) : previousLevel;
  nextAccount.level = nextLevel;
  const levelAdded = nextLevel - previousLevel;
  return {
    ok: true,
    account: nextAccount,
    coinsAdded: rewardCoins,
    levelAdded,
    message: levelAdded
      ? `闖關成功，獲得 ${rewardCoins} 金幣，升到 Lv. ${nextAccount.level}。`
      : previousLevel >= MAX_PLAYER_LEVEL
        ? `闖關成功，獲得 ${rewardCoins} 金幣，等級已經是 Lv. ${MAX_PLAYER_LEVEL}。`
        : !countsForLevel
          ? `闖關成功，獲得 ${rewardCoins} 金幣。這關是 Lv. ${finishedLevel}，不會算進 Lv. ${previousLevel} 的升級進度。`
        : `闖關成功，獲得 ${rewardCoins} 金幣。下一級還需要：${levelTaskProgress(nextAccount, previousLevel).missingText}。`
  };
}

export function levelTaskForLevel(level = 1) {
  const currentLevel = clampChallengeLevel(level);
  return LEVEL_TASKS.find((task) => task.level === currentLevel) || null;
}

export function levelTaskProgress(account, level = account?.level || 1) {
  const task = levelTaskForLevel(level);
  const safeAccount = withAchievementDefaults(account || {});
  if (!task) {
    return { task: null, complete: true, challengeDone: true, actionDone: true, missingText: "已經滿級" };
  }
  const achievements = safeAccount.achievements;
  const challengeValue = Number(achievements.challengeCompletions || 0);
  const actionValue = Number(achievements[task.metric] || 0);
  const challengeDone = challengeValue >= task.challengeTarget;
  const actionDone = actionValue >= task.target;
  const missing = [];
  if (!challengeDone) missing.push(`再完成 ${task.challengeTarget - challengeValue} 次闖關`);
  if (!actionDone) missing.push(`${task.action}還差 ${task.target - actionValue}${task.unit}`);
  return {
    task,
    complete: challengeDone && actionDone,
    challengeDone,
    actionDone,
    challengeValue,
    actionValue,
    missingText: missing.length ? missing.join("，") : "都完成了"
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
  return { x: last.x, y: last.y + 0.4, z: last.z, w: 14, d: 12 };
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

export function richestIslandDiamondAccountCode(accounts = [], island = "A") {
  const targetIsland = normalizeIslandCode(island);
  return richestDiamondAccountCode(accounts.filter((account) => (
    account && !account.isHost && normalizeIslandCode(account.currentIsland || account.house?.island || "A") === targetIsland
  )));
}

export function accountWealthScore(account) {
  return Number(account?.coins || 0) + Number(account?.diamonds || 0) * 10;
}

export function richestIslandWealthAccountCode(accounts = [], island = "A") {
  const targetIsland = normalizeIslandCode(island);
  const ranked = accounts
    .filter((account) => account?.code && !account.isHost && normalizeIslandCode(account.currentIsland || account.house?.island || "A") === targetIsland)
    .map((account) => ({
      code: account.code,
      wealth: accountWealthScore(account)
    }))
    .sort((a, b) => b.wealth - a.wealth || String(a.code).localeCompare(String(b.code)));
  return ranked[0]?.code || null;
}

export function updateSurvivalStats(account, seconds = 0) {
  const nextAccount = structuredClone(account);
  nextAccount.hunger = clampPercent(nextAccount.hunger ?? 100);
  nextAccount.thirst = clampPercent(nextAccount.thirst ?? 100);
  return { account: nextAccount, died: false };
}

export function damageAdultThirst(account, amount = 18) {
  const nextAccount = structuredClone(account);
  nextAccount.thirst = clampPercent(nextAccount.thirst ?? 100);
  return { account: nextAccount, damaged: false, died: false };
}

export function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 100;
  return Math.max(0, Math.min(100, number));
}

export function damageMonster(monster) {
  const nextMonster = structuredClone(monster);
  nextMonster.hp = Math.max(0, Number(nextMonster.hp || 3) - 1);
  nextMonster.hitUntil = Date.now() + 550;
  return { monster: nextMonster, dead: nextMonster.hp <= 0 };
}

export function canUsePlayerAttack(attacker, attackerProtected = false) {
  if (!attacker) return false;
  return Boolean(attacker.isHost) || !Boolean(attackerProtected);
}

export function canAttackPlayerTarget(attacker, target, targetProtected = false) {
  if (!attacker || !target) return false;
  return !Boolean(target.isHost) && !Boolean(targetProtected);
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
