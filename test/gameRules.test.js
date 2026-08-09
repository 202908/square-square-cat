import test from "node:test";
import assert from "node:assert/strict";
import {
  BLIND_BOX_BASE_DIAMOND_COST,
  BLIND_BOX_PITY_DRAWS,
  BLIND_BOX_SKIN_COIN_VALUE,
  CAT_VARIANTS,
  CAT_VARIANT_RARITIES,
  COIN_TO_DIAMOND_RATE,
  DEFAULT_TITLE_ID,
  DEFAULT_TITLES,
  FURNITURE_ITEMS,
  FREE_ISLAND_CODES,
  GENDER_OPTIONS,
  HOST_AVATAR_URL,
  HOST_DEFAULT_HOUSE,
  HOST_DEFAULT_INVENTORY,
  HOST_DEFAULT_ROCKET_PAINT,
  HOST_DEFAULT_ROOM_FURNITURE_IDS,
  HOST_ISLAND_CODE,
  ISLAND_CODES,
  LEVEL_REWARDS,
  LEVEL_TASKS,
  MAX_CHALLENGE_STEP_Y,
  MAX_PLAYER_LEVEL,
  MONTHLY_CAT_VARIANTS,
  REMOVED_ITEM_IDS,
  ROOM_BOUNDS,
  ROCKET_MAX_LEVEL,
  SHOP_ITEMS,
  WEATHER_MODES,
  addFriend,
  accountWealthScore,
  applyHousePaint,
  areHouseFriends,
  buyItem,
  blindBoxCostForDraw,
  blindBoxStateForAccount,
  canTravelToIsland,
  canAttackPlayerTarget,
  canUsePlayerAttack,
  challengeLevelForAccounts,
  challengeFinishForLevel,
  claimLevelReward,
  completeChallenge,
  createAccount,
  createHostDefaultRoomItems,
  damageAdultThirst,
  deleteInventoryItem,
  drawMonthlyBlindBox,
  equipItem,
  equipCatVariant,
  exchangeCoinsForDiamonds,
  getChallengePlatforms,
  claimHostDayGift,
  hostDayGiftState,
  levelTaskProgress,
  updateSurvivalStats,
  damageMonster,
  richestDiamondAccountCode,
  richestIslandDiamondAccountCode,
  richestIslandWealthAccountCode,
  rocketParkingSpot,
  isValidNewAccountCode,
  makeGuestAccount,
  monthlyCatVariantForMonth,
  normalizeAvatarDataUrl,
  normalizeGender,
  normalizeIslandCode,
  normalizeWeatherMode,
  pickRandomCatVariant,
  roomFurniturePlatforms,
  roomFurniturePlacement,
  redeemCode,
  removeFriend,
  rocketLevelCanReachIsland,
  sendCoinGift,
  sendDiamondGift,
  upgradeRocket,
  useRocketPaint,
  useConsumable
} from "../src/gameRules.js";

const TEST_CODE_BOOK = {
  "test-coins": { coins: 100, type: "coins", active: true },
  "test-item": { item: "wings", type: "item", active: true }
};

function sequenceRandom(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

test("new player account codes accept 1 to 10 letters or numbers", () => {
  assert.equal(isValidNewAccountCode("a"), true);
  assert.equal(isValidNewAccountCode("abc123"), true);
  assert.equal(isValidNewAccountCode("1234567890"), true);
  assert.equal(isValidNewAccountCode("12345678901"), false);
  assert.equal(isValidNewAccountCode("cat!"), false);
  assert.equal(isValidNewAccountCode(""), false);
});

test("host account can be created without exposing a real secret", () => {
  const account = createAccount("test-host", { isHost: true, level: null, coins: 999999999, catVariant: "host" });
  assert.equal(account.isHost, true);
  assert.equal(account.level, null);
  assert.equal(account.catVariant, "host");
  assert.ok(account.coins > 1000000);
});

test("avatar data urls are normalized before saving to accounts", () => {
  const avatar = "data:image/png;base64,aGVsbG8=";
  const account = createAccount("avatar1", { avatar, gender: "female" });
  assert.equal(account.avatar, avatar);
  assert.equal(account.gender, "female");
  assert.equal(normalizeAvatarDataUrl("data:image/gif;base64,R0lGODlhAQABAAAAACw="), null);
  assert.equal(normalizeAvatarDataUrl("data:video/mp4;base64,AAAA"), null);
  assert.equal(normalizeAvatarDataUrl("data:image/svg+xml;base64,PHN2Zz4="), null);
  assert.equal(normalizeAvatarDataUrl(`data:image/webp;base64,${"a".repeat(120000)}`)?.startsWith("data:image/webp"), true);
});

test("player account gets one allowed cat skin at creation", () => {
  const account = createAccount("abc");
  assert.equal(CAT_VARIANTS.includes(account.catVariant), true);
  assert.equal(account.catVariant === "host", false);
  assert.equal(account.diamonds, 0);
  assert.equal(account.prefers2D, false);
  assert.equal(account.gender, "private");
  assert.deepEqual(account.giftInbox, []);
  assert.equal(account.equipped.title, DEFAULT_TITLE_ID);
  assert.equal(account.titles.includes(DEFAULT_TITLE_ID), true);
  assert.deepEqual(DEFAULT_TITLES[DEFAULT_TITLE_ID], { id: DEFAULT_TITLE_ID, name: "新手貓貓", color: "black" });
});

test("cat skin rarity table keeps host exclusive and rare skins rare", () => {
  const totalWeight = CAT_VARIANT_RARITIES.reduce((sum, entry) => sum + entry.weight, 0);
  const weightById = Object.fromEntries(CAT_VARIANT_RARITIES.map((entry) => [entry.id, entry.weight]));
  assert.equal(totalWeight, 100);
  assert.equal(CAT_VARIANTS.includes("host"), false);
  assert.equal(CAT_VARIANT_RARITIES.some((entry) => entry.id === "host"), false);
  assert.equal(weightById.blue, 2);
  assert.equal(weightById.moonPinkEar, 2);
  for (const entry of CAT_VARIANT_RARITIES) {
    assert.equal(CAT_VARIANTS.includes(entry.id), true);
  }
});

test("random cat skin picker can exclude the current skin", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    assert.equal(pickRandomCatVariant("black"), "white");
  } finally {
    Math.random = originalRandom;
  }
});

test("monthly blind box has one limited skin for every month", () => {
  assert.equal(MONTHLY_CAT_VARIANTS.length, 12);
  assert.equal(BLIND_BOX_BASE_DIAMOND_COST, 10);
  assert.equal(BLIND_BOX_PITY_DRAWS, 10);
  assert.equal(COIN_TO_DIAMOND_RATE, 10);
  assert.equal(blindBoxCostForDraw(1), 10);
  assert.equal(blindBoxCostForDraw(2), 15);
  assert.equal(blindBoxCostForDraw(3), 23);
  for (let month = 1; month <= 12; month += 1) {
    const variant = monthlyCatVariantForMonth(month);
    assert.equal(variant.month, month);
    assert.equal(CAT_VARIANTS.includes(variant.id), true);
    assert.equal(CAT_VARIANT_RARITIES.some((entry) => entry.id === variant.id), false);
  }
  assert.equal(monthlyCatVariantForMonth(12).tier, "special");
});

test("coins can convert to diamonds but not back to coins", () => {
  const account = createAccount("trade", { coins: 25, diamonds: 1 });
  const exchanged = exchangeCoinsForDiamonds(account, 2);
  assert.equal(exchanged.ok, true);
  assert.equal(exchanged.account.coins, 5);
  assert.equal(exchanged.account.diamonds, 3);
  assert.equal(exchangeCoinsForDiamonds(exchanged.account, 1).ok, false);
});

test("monthly blind box uses chance and guarantees the tenth draw", () => {
  const date = new Date("2026-08-09T00:00:00Z");
  const firstAccount = createAccount("box", { diamonds: 200, catVariant: "black" });
  const miss = drawMonthlyBlindBox(firstAccount, date, sequenceRandom([0.99, 0]));
  assert.equal(miss.ok, true);
  assert.equal(miss.won, false);
  assert.equal(miss.reward.kind, "coins");
  assert.equal(miss.account.coins, 60);
  assert.equal(miss.account.catVariant, "black");
  assert.equal(miss.account.diamonds, 190);
  assert.equal(blindBoxStateForAccount(miss.account, date).nextCost, 15);

  const pityAccount = createAccount("pity", {
    diamonds: 1000,
    catVariant: "black",
    blindBoxPity: { month: 8, draws: 9 }
  });
  const result = drawMonthlyBlindBox(pityAccount, date, () => 0.99);
  assert.equal(result.ok, true);
  assert.equal(result.won, true);
  assert.equal(result.variant.id, "augNebula");
  assert.equal(result.account.catVariant, "augNebula");
  assert.equal(result.account.ownedCatVariants.includes("augNebula"), true);
  assert.equal(result.account.blindBoxPity.draws, 0);

  const host = createAccount("host", { isHost: true, diamonds: 999999999, catVariant: "host" });
  const hostResult = drawMonthlyBlindBox(host, date, () => 0);
  assert.equal(hostResult.ok, true);
  assert.equal(hostResult.won, true);
  assert.equal(hostResult.account.catVariant, "host");
  assert.equal(hostResult.account.ownedCatVariants.includes("augNebula"), true);
});

test("monthly blind box consolation prizes give items and refund duplicate equipment", () => {
  const date = new Date("2026-08-09T00:00:00Z");
  const newItemAccount = createAccount("new-item", { diamonds: 200, catVariant: "black" });
  const newItem = drawMonthlyBlindBox(newItemAccount, date, sequenceRandom([0.99, 0.51]));
  assert.equal(newItem.ok, true);
  assert.equal(newItem.won, false);
  assert.equal(newItem.reward.kind, "item");
  assert.equal(newItem.reward.itemId, "star-hat");
  assert.equal(newItem.account.inventory.includes("star-hat"), true);
  assert.equal(newItem.message.includes("恭喜獲得"), true);

  const duplicateAccount = createAccount("dup-item", {
    diamonds: 200,
    coins: 4,
    catVariant: "black",
    inventory: ["star-hat"]
  });
  const duplicate = drawMonthlyBlindBox(duplicateAccount, date, sequenceRandom([0.99, 0.51]));
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.won, false);
  assert.equal(duplicate.reward.kind, "duplicateItem");
  assert.equal(duplicate.reward.coins, 80);
  assert.equal(duplicate.account.inventory.filter((itemId) => itemId === "star-hat").length, 1);
  assert.equal(duplicate.account.coins, 84);
});

test("monthly blind box refunds a skin that was already drawn before", () => {
  const date = new Date("2026-08-09T00:00:00Z");
  const account = createAccount("dup-skin", {
    diamonds: 1000,
    catVariant: "black",
    ownedCatVariants: ["black", "augNebula"],
    blindBoxPity: { month: 8, draws: 9 }
  });
  const duplicate = drawMonthlyBlindBox(account, date, () => 0.99);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.won, true);
  assert.equal(duplicate.reward.kind, "duplicateSkin");
  assert.equal(duplicate.reward.coins, Math.floor(BLIND_BOX_SKIN_COIN_VALUE * 2 / 3));
  assert.equal(duplicate.account.catVariant, "black");
});

test("drawn cat skins stay owned and can be equipped again from the bag", () => {
  const date = new Date("2026-08-09T00:00:00Z");
  const account = createAccount("skin-bag", {
    diamonds: 1000,
    catVariant: "black",
    ownedCatVariants: ["black"],
    blindBoxPity: { month: 8, draws: 9 }
  });
  const won = drawMonthlyBlindBox(account, date, () => 0.99);
  assert.equal(won.account.catVariant, "augNebula");
  assert.deepEqual(won.account.ownedCatVariants.sort(), ["augNebula", "black"].sort());

  const backToBlack = equipCatVariant(won.account, "black");
  assert.equal(backToBlack.ok, true);
  assert.equal(backToBlack.account.catVariant, "black");
  const backToNebula = equipCatVariant(backToBlack.account, "augNebula");
  assert.equal(backToNebula.ok, true);
  assert.equal(backToNebula.account.catVariant, "augNebula");
});

test("host day gift can be claimed once per year on December 27", () => {
  const account = createAccount("host-day", { coins: 0, diamonds: 0 });
  const before = claimHostDayGift(account, new Date("2026-12-26T12:00:00Z"));
  assert.equal(before.ok, false);

  const first = claimHostDayGift(account, new Date("2026-12-27T12:00:00Z"));
  assert.equal(first.ok, true);
  assert.equal(first.account.coins, 100);
  assert.equal(first.account.diamonds, 50);
  assert.equal(hostDayGiftState(first.account, new Date("2026-12-27T13:00:00Z")).claimed, true);

  const duplicate = claimHostDayGift(first.account, new Date("2026-12-27T14:00:00Z"));
  assert.equal(duplicate.ok, false);

  const nextYear = claimHostDayGift(first.account, new Date("2027-12-27T12:00:00Z"));
  assert.equal(nextYear.ok, true);
  assert.equal(nextYear.account.coins, 200);
  assert.equal(nextYear.account.diamonds, 100);
});

test("account gender display uses fixed choices and falls back to private", () => {
  assert.deepEqual(GENDER_OPTIONS, ["male", "female", "private"]);
  assert.equal(normalizeGender("male"), "male");
  assert.equal(normalizeGender("female"), "female");
  assert.equal(normalizeGender("private"), "private");
  assert.equal(normalizeGender("sparkle"), "private");
  assert.equal(createAccount("boycat", { gender: "male" }).gender, "male");
  assert.equal(createAccount("girlcat", { gender: "female" }).gender, "female");
  assert.equal(createAccount("mystery", { gender: "nope" }).gender, "private");
  assert.equal(makeGuestAccount().gender, "private");
});

test("player account can remember a 2D display preference", () => {
  const account = createAccount("flatcat", { prefers2D: true });
  assert.equal(account.prefers2D, true);
});

test("guest account can use a 2D display preference", () => {
  const account = makeGuestAccount({ prefers2D: true });
  assert.equal(account.isGuest, true);
  assert.equal(account.prefers2D, true);
});

test("weather modes are fixed and invalid choices fall back to auto", () => {
  assert.deepEqual(WEATHER_MODES, ["auto", "rain", "thunder", "rainbow", "aurora"]);
  assert.equal(normalizeWeatherMode("rain"), "rain");
  assert.equal(normalizeWeatherMode("thunder"), "thunder");
  assert.equal(normalizeWeatherMode("nope"), "auto");
});

test("islands include A to Z plus the host island", () => {
  assert.equal(ISLAND_CODES.length, 26);
  assert.equal(ISLAND_CODES[0], "A");
  assert.equal(ISLAND_CODES.at(-1), "Z");
  assert.equal(HOST_ISLAND_CODE, "Inn");
  assert.equal(normalizeIslandCode("b"), "B");
  assert.equal(normalizeIslandCode("inn"), "Inn");
  assert.equal(normalizeIslandCode("??"), "A");
});

test("host account starts on Inn island with a prepared rainbow house", () => {
  const account = createAccount(process.env.HOST_ACCOUNT_CODE || "host");
  if (!account.isHost) return;
  assert.deepEqual(account.house, HOST_DEFAULT_HOUSE);
  for (const itemId of HOST_DEFAULT_INVENTORY) {
    assert.equal(account.inventory.includes(itemId), true);
  }
  assert.equal(account.equipped.clothes, "wings");
  assert.equal(account.equipped.tail, null);
  assert.equal(account.equipped.trail, "rainbow-trail");
  assert.equal(account.equipped.pet, "cat-pet");
  assert.equal(account.rocketPaint, HOST_DEFAULT_ROCKET_PAINT);
  assert.equal(account.gender, "private");
  assert.equal(account.avatar, HOST_AVATAR_URL);
  assert.equal(account.roomItems.length, HOST_DEFAULT_ROOM_FURNITURE_IDS.length);
  assert.equal(canTravelToIsland(account, "Z"), true);
});

test("host default room starts packed with placed furniture", () => {
  const roomItems = createHostDefaultRoomItems();
  assert.equal(roomItems.length, HOST_DEFAULT_ROOM_FURNITURE_IDS.length);
  assert.equal(roomItems.length, FURNITURE_ITEMS.length);
  assert.equal(roomItems.length, 30);
  assert.equal(new Set(roomItems.map((item) => item.id)).size, roomItems.length);
  assert.ok(roomItems.some((item) => item.itemId === "cat-tree"));
  assert.ok(roomItems.some((item) => item.itemId === "mini-slide-toy"));
  assert.ok(roomItems.every((item) => item.x >= ROOM_BOUNDS.minX && item.x <= ROOM_BOUNDS.maxX));
  assert.ok(roomItems.every((item) => item.z >= ROOM_BOUNDS.minZ && item.z <= ROOM_BOUNDS.maxZ));
});

test("built-in achievement titles have the requested names and colors", () => {
  assert.deepEqual(DEFAULT_TITLES["super-cat"].colors, ["red", "deepBlue", "red", "deepBlue"]);
  assert.deepEqual(DEFAULT_TITLES["park-lover-kitten"].colors, ["pink", "lightBlue"]);
  assert.equal(DEFAULT_TITLES["monster-king"].color, "yellow");
  assert.equal(DEFAULT_TITLES["lucky-coin-king"].color, "yellow");
  assert.deepEqual(DEFAULT_TITLES["chat-king"].colors, ["red", "yellow"]);
  assert.equal(DEFAULT_TITLES["host-cat"].name, "月之貓");
  assert.deepEqual(DEFAULT_TITLES["host-cat"].colors, ["pink", "white", "lightBlue"]);
});

test("shop keeps thirty furniture items for a lighter server", () => {
  const furniture = SHOP_ITEMS.filter((item) => item.type === "furniture");
  assert.equal(furniture.length, 30);
  assert.ok(furniture.some((item) => item.id === "cat-tree"));
  assert.ok(furniture.some((item) => item.id === "mini-slide-toy"));
});

test("shop keeps rainbow trail and only the small cat pet", () => {
  const pets = SHOP_ITEMS.filter((item) => item.type === "pet");
  assert.deepEqual(pets.map((item) => item.id), ["cat-pet"]);
  assert.ok(SHOP_ITEMS.some((item) => item.id === "rainbow-trail" && item.name === "彩虹拖尾特效"));
  assert.ok(SHOP_ITEMS.some((item) => item.id === "wings" && item.name === "貓眼星雲翅膀"));
  assert.equal(SHOP_ITEMS.some((item) => item.slot === "tail"), false);
});

test("shop does not include removed poop items", () => {
  assert.equal(SHOP_ITEMS.some((item) => REMOVED_ITEM_IDS.has(item.id) || item.name.includes("便便")), false);
});

test("room furniture placement uses fixed slots inside the smaller room", () => {
  const placement = roomFurniturePlacement("cozy-cat-bed", []);
  assert.ok(placement.x >= ROOM_BOUNDS.minX && placement.x <= ROOM_BOUNDS.maxX);
  assert.ok(placement.z >= ROOM_BOUNDS.minZ && placement.z <= ROOM_BOUNDS.maxZ);
  assert.equal(placement.y, 1);
});

test("room furniture placement avoids overlapping occupied slots", () => {
  const first = roomFurniturePlacement("cozy-cat-bed", []);
  const second = roomFurniturePlacement("cloud-sofa", [{ id: "one", itemId: "cozy-cat-bed", ...first }]);
  assert.notDeepEqual({ x: second.x, z: second.z }, { x: first.x, z: first.z });
});

test("cat tree and room slide have climbable furniture platforms", () => {
  assert.equal(roomFurniturePlatforms("cat-tree").length, 3);
  assert.ok(roomFurniturePlatforms("cat-tree").some((platform) => platform.y > 4));
  assert.ok(roomFurniturePlatforms("mini-slide-toy").some((platform) => platform.y > 3));
});

test("cat tree and room slide prefer wall-side placement", () => {
  const catTree = roomFurniturePlacement("cat-tree", []);
  const slide = roomFurniturePlacement("mini-slide-toy", [{ id: "tree", itemId: "cat-tree", ...catTree }]);
  assert.ok(catTree.x < 210);
  assert.ok(slide.x > 228);
});

test("shop has a smaller visible non-furniture catalog", () => {
  const nonFurniture = SHOP_ITEMS.filter((item) => item.type !== "furniture");
  assert.ok(nonFurniture.length < 90);
  assert.ok(nonFurniture.length >= 60);
  assert.equal(nonFurniture.every((item) => item.slot || ["house", "rocket", "rocket-paint", "consumable"].includes(item.type)), true);
});

test("shop includes several one-time toys", () => {
  const consumables = SHOP_ITEMS.filter((item) => item.type === "consumable");
  assert.ok(consumables.length >= 6);
  assert.ok(consumables.some((item) => item.id === "word-firework" && item.needsText));
});

test("shop includes house body and roof paint", () => {
  assert.ok(SHOP_ITEMS.some((item) => item.id === "house-body-paint-blue"));
  assert.ok(SHOP_ITEMS.some((item) => item.id === "house-roof-paint-starry-night"));
});

test("rocket travel requires a rocket unless the player is invited", () => {
  const account = createAccount("abc", { currentIsland: "A" });
  assert.deepEqual(FREE_ISLAND_CODES, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]);
  assert.equal(canTravelToIsland(account, "K"), true);
  assert.equal(canTravelToIsland(account, "L"), false);
  assert.equal(canTravelToIsland(account, "L", true), true);
  assert.equal(canTravelToIsland({ ...account, inventory: ["rocket"], rocketLevel: 1 }, "L"), true);
  assert.equal(canTravelToIsland({ ...account, inventory: ["rocket"], rocketLevel: 1 }, "Z"), false);
  assert.equal(canTravelToIsland({ ...account, inventory: ["rocket"], rocketLevel: 5 }, "Z"), true);
  assert.equal(canTravelToIsland({ ...account, inventory: ["rocket"] }, "Inn"), false);
  assert.equal(rocketLevelCanReachIsland(1, "N"), true);
  assert.equal(rocketLevelCanReachIsland(1, "O"), false);
  assert.equal(rocketLevelCanReachIsland(ROCKET_MAX_LEVEL, "Z"), true);
});

test("rocket needs a house and rocket paint updates the rocket color", () => {
  const noHouse = createAccount("abc", { coins: 600 });
  assert.equal(buyItem(noHouse, "rocket").ok, false);

  const withHouse = createAccount("abc", { coins: 700, house: { x: 0, y: 1, z: 0, island: "A" } });
  const rocket = buyItem(withHouse, "rocket");
  assert.equal(rocket.ok, true);
  assert.equal(rocket.account.inventory.includes("rocket"), true);
  assert.equal(rocket.account.rocketLevel || 1, 1);
  const upgraded = upgradeRocket({ ...rocket.account, coins: 500 });
  assert.equal(upgraded.ok, true);
  assert.equal(upgraded.account.rocketLevel, 2);

  const paint = buyItem({ ...rocket.account, coins: 500 }, "rocket-paint-pink");
  assert.equal(paint.ok, true);
  const painted = useRocketPaint(paint.account, "rocket-paint-pink");
  assert.equal(painted.ok, true);
  assert.equal(painted.account.rocketPaint, "pink");
});

test("rocket parks away from the host swing side", () => {
  const account = createAccount("abc", { house: { x: 2, y: 1, z: -28, yaw: 0 } });
  assert.deepEqual(rocketParkingSpot(account), { x: -6, y: 1, z: -21, yaw: 0 });
});

test("coin codes can only be redeemed once per account", () => {
  const account = createAccount("abc");
  const first = redeemCode(account, TEST_CODE_BOOK, "test-coins");
  assert.equal(first.ok, true);
  assert.equal(first.account.coins, 100);

  const second = redeemCode(first.account, TEST_CODE_BOOK, "test-coins");
  assert.equal(second.ok, false);
  assert.equal(second.account, undefined);
});

test("wings code grants the wings item", () => {
  const account = createAccount("abc");
  const result = redeemCode(account, TEST_CODE_BOOK, "test-item");
  assert.equal(result.ok, true);
  assert.deepEqual(result.account.inventory, ["wings"]);
});

test("shopping and equipping updates inventory and slot", () => {
  const account = createAccount("abc", { coins: 200 });
  const purchase = buyItem(account, "star-hat");
  assert.equal(purchase.ok, true);
  assert.equal(purchase.account.coins, 80);

  const equipped = equipItem(purchase.account, "star-hat");
  assert.equal(equipped.ok, true);
  assert.equal(equipped.account.equipped.hat, "star-hat");
});

test("deleting inventory items refunds two thirds of the price and unequips them", () => {
  const account = createAccount("delete-item", {
    coins: 1,
    inventory: ["star-hat"],
    equipped: { hat: "star-hat", clothes: null, tail: null, trail: null, pet: null, title: DEFAULT_TITLE_ID }
  });
  const result = deleteInventoryItem(account, "star-hat");
  assert.equal(result.ok, true);
  assert.equal(result.refundCoins, 80);
  assert.equal(result.account.coins, 81);
  assert.deepEqual(result.account.inventory, []);
  assert.equal(result.account.equipped.hat, null);
});

test("deleting a consumable removes one copy and refunds with decimals dropped", () => {
  const account = createAccount("delete-consumable", {
    coins: 0,
    inventory: ["word-firework", "word-firework"]
  });
  const result = deleteInventoryItem(account, "word-firework");
  assert.equal(result.ok, true);
  assert.equal(result.refundCoins, 120);
  assert.equal(result.account.coins, 120);
  assert.deepEqual(result.account.inventory, ["word-firework"]);
});

test("consumables can be bought more than once and used one at a time", () => {
  const account = createAccount("abc", { coins: 1000, inventory: ["word-firework"] });
  const bought = buyItem(account, "word-firework");
  assert.equal(bought.ok, true);
  assert.equal(bought.account.inventory.filter((item) => item === "word-firework").length, 2);
  assert.equal(useConsumable(bought.account, "word-firework", "").ok, false);
  const used = useConsumable(bought.account, "word-firework", "Hello");
  assert.equal(used.ok, true);
  assert.equal(used.text, "Hello");
  assert.equal(used.account.inventory.filter((item) => item === "word-firework").length, 1);
  const furTicket = useConsumable(createAccount("fur", { inventory: ["fur-change-ticket"] }), "fur-change-ticket");
  assert.equal(furTicket.ok, true);
  assert.equal(furTicket.effect, "fur-change");
  assert.equal(furTicket.account.inventory.includes("fur-change-ticket"), false);
});

test("some fancy shop items can be bought with diamonds", () => {
  const account = createAccount("abc", { diamonds: 10 });
  const purchase = buyItem(account, "wings");
  assert.equal(purchase.ok, true);
  assert.equal(purchase.account.inventory.includes("wings"), true);
  assert.equal(purchase.account.diamonds < 10, true);
});

test("house paint can be applied after the player has a house", () => {
  const account = createAccount("abc", {
    inventory: ["house-body-paint-ruby-violet-blue", "house-roof-paint-starry-night"],
    house: { x: 1, y: 0, z: 2, yaw: 0 }
  });

  const bodyPainted = applyHousePaint(account, "house-body-paint-ruby-violet-blue");
  assert.equal(bodyPainted.ok, true);
  assert.equal(bodyPainted.account.house.paint.body, "ruby-violet-blue");

  const roofPainted = applyHousePaint(bodyPainted.account, "house-roof-paint-starry-night");
  assert.equal(roofPainted.ok, true);
  assert.equal(roofPainted.account.house.paint.roof, "starry-night");
});

test("friends are unique and cannot be self", () => {
  const account = createAccount("abc");
  const added = addFriend(account, "def");
  assert.equal(added.ok, true);
  assert.deepEqual(added.account.friends, ["def"]);
  assert.equal(addFriend(added.account, "def").ok, false);
  assert.equal(addFriend(added.account, "abc").ok, false);
});

test("friends can be removed from the friend list", () => {
  const account = createAccount("abc", { friends: ["def", "ghi"] });
  const removed = removeFriend(account, "def");
  assert.equal(removed.ok, true);
  assert.deepEqual(removed.account.friends, ["ghi"]);
  assert.equal(removeFriend(removed.account, "def").ok, false);
});

test("house friends can enter without approval from either friend direction", () => {
  const visitor = createAccount("abc", { friends: ["def"] });
  const owner = createAccount("def");
  assert.equal(areHouseFriends(visitor, owner), true);
  assert.equal(areHouseFriends(createAccount("abc"), createAccount("def", { friends: ["abc"] })), true);
  assert.equal(areHouseFriends(createAccount("abc"), createAccount("def")), false);
});

test("coin gifts deduct sender coins and wait in the friend's inbox", () => {
  const sender = createAccount("abc", { coins: 50, friends: ["def"] });
  const recipient = createAccount("def");
  const result = sendCoinGift(sender, recipient, 12, { id: "gift-1", sentAt: 123 });

  assert.equal(result.ok, true);
  assert.equal(result.sender.coins, 38);
  assert.deepEqual(result.recipient.giftInbox, [{
    id: "gift-1",
    from: "abc",
    kind: "coins",
    coins: 12,
    sentAt: 123
  }]);
});

test("coin gifts require enough coins unless the sender is host", () => {
  const sender = createAccount("abc", { coins: 5, friends: ["def"] });
  const recipient = createAccount("def");
  assert.equal(sendCoinGift(sender, recipient, 6).ok, false);

  const host = createAccount("host", { isHost: true, coins: 999999999, friends: ["def"] });
  const hostGift = sendCoinGift(host, recipient, 6000);
  assert.equal(hostGift.ok, true);
  assert.equal(hostGift.sender.coins, 999999999);
});

test("diamond gifts deduct sender diamonds and wait in the friend's inbox", () => {
  const sender = createAccount("abc", { diamonds: 5, friends: ["def"] });
  const recipient = createAccount("def");
  const result = sendDiamondGift(sender, recipient, 2, { id: "diamond-gift", sentAt: 123 });

  assert.equal(result.ok, true);
  assert.equal(result.sender.diamonds, 3);
  assert.deepEqual(result.recipient.giftInbox, [{
    id: "diamond-gift",
    from: "abc",
    kind: "diamonds",
    diamonds: 2,
    sentAt: 123
  }]);
});

test("challenge level uses the lowest player level in a team", () => {
  const levelNine = createAccount("nine", { level: 9 });
  const levelOne = createAccount("one", { level: 1 });
  const levelThree = createAccount("three", { level: 3 });
  const levelEight = createAccount("eight", { level: 8 });
  const levelTwo = createAccount("two", { level: 2 });

  assert.equal(challengeLevelForAccounts([levelNine, levelOne]), 1);
  assert.equal(challengeLevelForAccounts([levelThree, levelEight, levelTwo]), 2);
  assert.equal(challengeLevelForAccounts([createAccount("host", { isHost: true })]), MAX_PLAYER_LEVEL);
  assert.equal(challengeLevelForAccounts([createAccount("over", { level: 140 })]), MAX_PLAYER_LEVEL);
});

test("level tasks cover every upgrade through level one hundred", () => {
  assert.equal(LEVEL_TASKS.length, MAX_PLAYER_LEVEL - 1);
  assert.equal(LEVEL_TASKS[0].level, 1);
  assert.equal(LEVEL_TASKS.at(-1).nextLevel, MAX_PLAYER_LEVEL);
  assert.equal(LEVEL_TASKS.every((task) => task.challengeTarget === task.level), true);
});

test("completing a challenge gives coins but waits for the level task", () => {
  const account = createAccount("abc", { level: 1, coins: 20 });
  const result = completeChallenge(account);

  assert.equal(result.ok, true);
  assert.equal(result.account.coins, 520);
  assert.equal(result.account.level, 1);
  assert.equal(result.account.achievements.challengeCompletions, 1);
  assert.equal(levelTaskProgress(result.account).complete, false);
});

test("higher level teammate does not gain upgrade progress from a lower level challenge", () => {
  const account = createAccount("level50", {
    level: 50,
    coins: 20,
    achievements: { challengeCompletions: 49 }
  });
  const result = completeChallenge(account, 500, 1);

  assert.equal(result.ok, true);
  assert.equal(result.account.coins, 520);
  assert.equal(result.account.level, 50);
  assert.equal(result.account.achievements.challengeCompletions, 49);
  assert.equal(result.levelAdded, 0);
});

test("completing a challenge raises level when the extra task is done", () => {
  const account = createAccount("abc", {
    level: 1,
    coins: 20,
    achievements: { ferrisRides: 1 }
  });
  const result = completeChallenge(account);

  assert.equal(result.ok, true);
  assert.equal(result.account.coins, 520);
  assert.equal(result.account.level, 2);
  assert.equal(result.levelAdded, 1);
});

test("player level caps at the maximum challenge level", () => {
  const account = createAccount("abc", { level: MAX_PLAYER_LEVEL, coins: 20 });
  const result = completeChallenge(account);

  assert.equal(result.ok, true);
  assert.equal(result.account.level, MAX_PLAYER_LEVEL);
  assert.equal(result.levelAdded, 0);
});

test("challenge platforms stay jumpable through level one hundred", () => {
  for (let level = 1; level <= MAX_PLAYER_LEVEL; level += 1) {
    const platforms = getChallengePlatforms(level);
    assert.ok(platforms.length >= 7);
    for (let index = 1; index < platforms.length; index += 1) {
      const rise = platforms[index].y - platforms[index - 1].y;
      assert.ok(rise <= MAX_CHALLENGE_STEP_Y + Number.EPSILON * 16, `Lv. ${level} step ${index} rise ${rise} is too high`);
    }
  }
});

test("challenge finish flag sits on the last platform with a generous trigger area", () => {
  for (const level of [1, 50, MAX_PLAYER_LEVEL]) {
    const platforms = getChallengePlatforms(level);
    const last = platforms.at(-1);
    const finish = challengeFinishForLevel(level);

    assert.equal(finish.y, last.y + 0.4);
    assert.ok(finish.x >= last.x - last.w / 2);
    assert.ok(finish.x <= last.x + last.w / 2);
    assert.ok(finish.w >= 12);
    assert.ok(finish.d >= 10);
  }
});

test("level rewards can be claimed once when the account reaches that level", () => {
  const reward = LEVEL_REWARDS.find((candidate) => candidate.level === 5);
  const account = createAccount("abc", { level: 5, coins: 10, diamonds: 0 });
  const result = claimLevelReward(account, 5);

  assert.equal(result.ok, true);
  assert.equal(result.account.coins, 10 + reward.coins);
  assert.equal(result.account.diamonds, reward.diamonds || 0);
  assert.deepEqual(result.account.claimedLevelRewards, [5]);
  assert.equal(claimLevelReward(result.account, 5).ok, false);
});

test("level rewards can give visible inventory items", () => {
  const account = createAccount("abc", { level: 10, coins: 0, inventory: [] });
  const result = claimLevelReward(account, 10);

  assert.equal(result.ok, true);
  assert.equal(result.account.inventory.includes("cat-pet"), true);
});

test("level rewards include every level from two through one hundred", () => {
  assert.equal(LEVEL_REWARDS.length, MAX_PLAYER_LEVEL - 1);
  assert.deepEqual(LEVEL_REWARDS.map((reward) => reward.level), Array.from({ length: MAX_PLAYER_LEVEL - 1 }, (_, index) => index + 2));
  assert.ok(LEVEL_REWARDS.some((reward) => reward.level === MAX_PLAYER_LEVEL));
});

test("richest diamond account uses diamonds and breaks ties by code", () => {
  const a = createAccount("aaa", { diamonds: 8 });
  const b = createAccount("bbb", { diamonds: 12 });
  const c = createAccount("ccc", { diamonds: 12 });

  assert.equal(richestDiamondAccountCode([a, b, c]), "bbb");
});

test("richest island diamond account ignores host and other islands", () => {
  const host = createAccount("host", { isHost: true, diamonds: 999999999, currentIsland: "A" });
  const islandA = createAccount("aaa", { diamonds: 20, currentIsland: "A" });
  const richerAway = createAccount("bbb", { diamonds: 90, currentIsland: "B" });
  const islandAWinner = createAccount("ccc", { diamonds: 25, currentIsland: "A" });

  assert.equal(richestIslandDiamondAccountCode([host, islandA, richerAway, islandAWinner], "A"), "ccc");
  assert.equal(richestIslandDiamondAccountCode([host, islandA, richerAway, islandAWinner], "B"), "bbb");
});

test("richest island wealth counts each diamond as ten coins", () => {
  const host = createAccount("host", { isHost: true, coins: 999999999, diamonds: 999999999, currentIsland: "A" });
  const coinRich = createAccount("coins", { coins: 100, diamonds: 0, currentIsland: "A" });
  const diamondRich = createAccount("diamonds", { coins: 50, diamonds: 6, currentIsland: "A" });
  const otherIsland = createAccount("away", { coins: 999, diamonds: 999, currentIsland: "B" });

  assert.equal(accountWealthScore(diamondRich), 110);
  assert.equal(richestIslandWealthAccountCode([host, coinRich, diamondRich, otherIsland], "A"), "diamonds");
});

test("survival stats no longer drain for adult or child modes", () => {
  const adult = createAccount("adult", { survivalMode: "adult", hunger: 80, thirst: 70 });
  const child = createAccount("child", { survivalMode: "child", hunger: 80, thirst: 70 });

  const adultResult = updateSurvivalStats(adult, 10);
  const childResult = updateSurvivalStats(child, 10);

  assert.equal(adultResult.account.hunger, 80);
  assert.equal(adultResult.account.thirst, 70);
  assert.equal(childResult.account.hunger, 80);
  assert.equal(childResult.account.thirst, 70);
});

test("survival stats no longer cause death", () => {
  const adult = createAccount("adult", { survivalMode: "adult", hunger: 1, thirst: 1 });
  const result = updateSurvivalStats(adult, 100);

  assert.equal(result.died, false);
  assert.equal(result.account.hunger, 1);
  assert.equal(result.account.thirst, 1);
});

test("attacks no longer reduce thirst for any mode", () => {
  const adult = createAccount("adult", { survivalMode: "adult", thirst: 50 });
  const child = createAccount("child", { survivalMode: "child", thirst: 50 });
  const host = createAccount("host", { isHost: true, survivalMode: "host", thirst: 50 });

  const adultResult = damageAdultThirst(adult, 18);
  const childResult = damageAdultThirst(child, 18);
  const hostResult = damageAdultThirst(host, 18);

  assert.equal(adultResult.account.thirst, 50);
  assert.equal(childResult.account.thirst, 50);
  assert.equal(hostResult.account.thirst, 50);
});

test("host account cannot be targeted by player attacks", () => {
  const host = createAccount("host", { isHost: true });
  const player = createAccount("player");
  const protectedPlayer = createAccount("safe");

  assert.equal(canAttackPlayerTarget(player, host), false);
  assert.equal(canAttackPlayerTarget(host, player), true);
  assert.equal(canAttackPlayerTarget(player, protectedPlayer, true), false);
  assert.equal(canUsePlayerAttack(protectedPlayer, true), false);
  assert.equal(canUsePlayerAttack(host, true), true);
});

test("monster dies after three hits", () => {
  const monster = { hp: 3 };
  const first = damageMonster(monster);
  const second = damageMonster(first.monster);
  const third = damageMonster(second.monster);

  assert.equal(first.dead, false);
  assert.equal(second.dead, false);
  assert.equal(third.dead, true);
});
