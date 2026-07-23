import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

export const HOST_CODE = process.env.HOST_ACCOUNT_CODE || null;
export const HOST_PASSWORD = process.env.HOST_PASSWORD || null;

export const DEFAULT_COIN_CODES = {};
export const CAT_VARIANTS = ["black", "white", "calico", "orange"];
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
export const WEATHER_LABELS = {
  auto: "晴天/日夜",
  rain: "下雨",
  thunder: "打雷",
  rainbow: "彩虹",
  aurora: "極光"
};
export const DEFAULT_TITLE_ID = "rookie-cat";
export const DEFAULT_TITLES = {
  [DEFAULT_TITLE_ID]: { id: DEFAULT_TITLE_ID, name: "新手貓貓", color: "black" },
  "super-cat": { id: "super-cat", name: "超級貓貓", colors: ["red", "deepBlue", "red", "deepBlue"] },
  "park-lover-kitten": { id: "park-lover-kitten", name: "喜愛樂園的小貓", colors: ["pink", "lightBlue"] },
  "monster-king": { id: "monster-king", name: "怪物消滅之王", color: "yellow" },
  "lucky-coin-king": { id: "lucky-coin-king", name: "幸運金幣之王", color: "yellow" },
  "chat-king": { id: "chat-king", name: "團聚貓貓王", colors: ["red", "yellow"] },
  "host-cat": { id: "host-cat", name: "主機貓", colors: ["pink", "white", "lightBlue"] }
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

export function roomFurniturePlacement(itemId, existingItems = []) {
  const occupied = new Set(existingItems.map((item) => `${Math.round(item.x * 10) / 10}:${Math.round(item.z * 10) / 10}`));
  const baseSlots = [
    { x: 207, z: -13 }, { x: 214, z: -13 }, { x: 221, z: -13 }, { x: 228, z: -13 }, { x: 233, z: -10 },
    { x: 207, z: -6 }, { x: 214, z: -6 }, { x: 221, z: -6 }, { x: 228, z: -6 }, { x: 233, z: -3 },
    { x: 207, z: 2 }, { x: 214, z: 2 }, { x: 221, z: 2 }, { x: 228, z: 2 }, { x: 233, z: 5 },
    { x: 207, z: 10 }, { x: 214, z: 10 }, { x: 221, z: 10 }, { x: 228, z: 10 }, { x: 233, z: 12 }
  ];
  const preferredSlots = furnitureSlotGroup(itemId);
  const slots = [...preferredSlots, ...baseSlots];
  let hash = 0;
  for (const char of itemId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  for (let offset = 0; offset < slots.length; offset += 1) {
    const slot = slots[(hash + offset) % slots.length];
    const key = `${Math.round(slot.x * 10) / 10}:${Math.round(slot.z * 10) / 10}`;
    if (!occupied.has(key)) return { x: slot.x, y: 1, z: slot.z, yaw: slot.yaw || 0 };
  }
  const row = existingItems.length % 5;
  const col = Math.floor(existingItems.length / 5) % 5;
  return { x: 208 + row * 6, y: 1, z: -12 + col * 6, yaw: 0 };
}

function furnitureSlotGroup(itemId) {
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
      pet: null,
      title: isHost ? "host-cat" : DEFAULT_TITLE_ID
    },
    titles: isHost ? [DEFAULT_TITLE_ID, "host-cat"] : [DEFAULT_TITLE_ID],
    achievements: { ...ACHIEVEMENT_DEFAULTS },
    house: null,
    roomItems: [],
    giftInbox: [],
    redeemedCodes: [],
    claimedLevelRewards: [],
    friends: [],
    survivalMode: isHost ? "host" : null,
    hunger: 100,
    thirst: 100,
    prefers2D: false,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function pickRandomCatVariant() {
  return CAT_VARIANTS[Math.floor(Math.random() * CAT_VARIANTS.length)];
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
  const nextAccount = withAchievementDefaults(account);
  const previousLevel = clampChallengeLevel(nextAccount.level || 1);
  nextAccount.achievements.challengeCompletions += 1;
  nextAccount.coins += rewardCoins;
  const task = levelTaskForLevel(previousLevel);
  const completed = task ? levelTaskProgress(nextAccount, previousLevel).complete : false;
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
