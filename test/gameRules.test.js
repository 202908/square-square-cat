import test from "node:test";
import assert from "node:assert/strict";
import {
  CAT_VARIANTS,
  DEFAULT_TITLE_ID,
  DEFAULT_TITLES,
  LEVEL_REWARDS,
  MAX_CHALLENGE_STEP_Y,
  MAX_PLAYER_LEVEL,
  SHOP_ITEMS,
  addFriend,
  applyHousePaint,
  buyItem,
  challengeLevelForAccounts,
  claimLevelReward,
  completeChallenge,
  createAccount,
  damageAdultThirst,
  equipItem,
  getChallengePlatforms,
  updateSurvivalStats,
  damageMonster,
  richestDiamondAccountCode,
  isValidNewAccountCode,
  redeemCode,
  sendCoinGift,
  sendDiamondGift
} from "../src/gameRules.js";

const TEST_CODE_BOOK = {
  "test-coins": { coins: 100, type: "coins", active: true },
  "test-item": { item: "wings", type: "item", active: true }
};

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

test("player account gets one allowed cat skin at creation", () => {
  const account = createAccount("abc");
  assert.equal(CAT_VARIANTS.includes(account.catVariant), true);
  assert.equal(account.diamonds, 0);
  assert.equal(account.prefers2D, false);
  assert.deepEqual(account.giftInbox, []);
  assert.equal(account.equipped.title, DEFAULT_TITLE_ID);
  assert.equal(account.titles.includes(DEFAULT_TITLE_ID), true);
  assert.deepEqual(DEFAULT_TITLES[DEFAULT_TITLE_ID], { id: DEFAULT_TITLE_ID, name: "新手貓貓", color: "black" });
});

test("player account can remember a 2D display preference", () => {
  const account = createAccount("flatcat", { prefers2D: true });
  assert.equal(account.prefers2D, true);
});

test("built-in achievement titles have the requested names and colors", () => {
  assert.deepEqual(DEFAULT_TITLES["super-cat"].colors, ["red", "deepBlue", "red", "deepBlue"]);
  assert.deepEqual(DEFAULT_TITLES["park-lover-kitten"].colors, ["pink", "lightBlue"]);
  assert.equal(DEFAULT_TITLES["monster-king"].color, "yellow");
  assert.equal(DEFAULT_TITLES["lucky-coin-king"].color, "yellow");
  assert.deepEqual(DEFAULT_TITLES["chat-king"].colors, ["red", "yellow"]);
  assert.deepEqual(DEFAULT_TITLES["host-cat"].colors, ["pink", "white", "lightBlue"]);
});

test("shop has at least fifty furniture items", () => {
  assert.ok(SHOP_ITEMS.filter((item) => item.type === "furniture").length >= 50);
});

test("shop has at least one hundred visible non-furniture items", () => {
  const nonFurniture = SHOP_ITEMS.filter((item) => item.type !== "furniture");
  assert.ok(nonFurniture.length >= 100);
  assert.equal(nonFurniture.every((item) => item.slot || item.type === "house"), true);
});

test("shop includes house body and roof paint", () => {
  assert.ok(SHOP_ITEMS.some((item) => item.id === "house-body-paint-blue"));
  assert.ok(SHOP_ITEMS.some((item) => item.id === "house-roof-paint-starry-night"));
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

test("completing a challenge gives coins and raises level", () => {
  const account = createAccount("abc", { level: 4, coins: 20 });
  const result = completeChallenge(account);

  assert.equal(result.ok, true);
  assert.equal(result.account.coins, 520);
  assert.equal(result.account.level, 5);
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

test("level rewards include the level one hundred milestone", () => {
  assert.ok(LEVEL_REWARDS.some((reward) => reward.level === MAX_PLAYER_LEVEL));
});

test("richest diamond account uses diamonds and breaks ties by code", () => {
  const a = createAccount("aaa", { diamonds: 8 });
  const b = createAccount("bbb", { diamonds: 12 });
  const c = createAccount("ccc", { diamonds: 12 });

  assert.equal(richestDiamondAccountCode([a, b, c]), "bbb");
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

test("monster dies after three hits", () => {
  const monster = { hp: 3 };
  const first = damageMonster(monster);
  const second = damageMonster(first.monster);
  const third = damageMonster(second.monster);

  assert.equal(first.dead, false);
  assert.equal(second.dead, false);
  assert.equal(third.dead, true);
});
