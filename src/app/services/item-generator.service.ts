import {Injectable} from '@angular/core';
import {Armor, Item, Shield, Weapon} from "../models/item.model";
import {RelicManagerService} from "./relic-manager.service";

@Injectable({
  providedIn: 'root'
})
export class ItemGeneratorService {

  slots = ["Head", "Neck", "Shoulders", "Back", "Chest", "Wrists", "Hands", "Waist", "Legs", "Feet", "Finger", "Trinket", "Main Hand", "Off Hand"];
  mainHandTypes = ["Sword", "Mace", "Dagger"];
  offHandTypes = ["Shield", "Offhand Dagger"];
  _itemName: Map<string, string[]> = new Map<string, string[]>();

  constructor(
    private relicService: RelicManagerService
  ) {
    this._itemName.set("Head", ["Helmet", "Helm"]);
    this._itemName.set("Neck", ["Amulet", "Necklace"]);
    this._itemName.set("Shoulders", ["Pauldrons", "Shoulder-guards"]);
    this._itemName.set("Back", ["Cape", "Mantle"]);
    this._itemName.set("Chest", ["Chestplate", "Breastplate"]);
    this._itemName.set("Wrists", ["Greaves", "Wrist-guards"]);
    this._itemName.set("Hands", ["Gloves", "Mittens"]);
    this._itemName.set("Waist", ["Belt", "Clincher"]);
    this._itemName.set("Legs", ["Pants", "Leg-guards"]);
    this._itemName.set("Feet", ["Shoes", "Boots"]);
    this._itemName.set("Finger", ["Ring"]);
    this._itemName.set("Trinket", ["Trinket", "Bauble"]);

    this._itemName.set("Shield", ["Shield", "Buckler"]);
    this._itemName.set("Offhand Dagger", ["Dagger", "Needle"]);
    this._itemName.set("Sword", ["Sword", "Broadsword"]);
    this._itemName.set("Mace", ["Mace", "Hammer"]);
    this._itemName.set("Dagger", ["Dagger", "Blade"]);
  }

  generateItem(level: number, rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Random", slot?: string, avoidWeapon?: boolean, minRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"): Item {
    if (!rarity || rarity === "Random") {
      rarity = this.getRandomRarity(minRarity, this.relicService.totalRareDropBonus * 100); // uses Common as fallback min
      // e.g. at lvl100 → 0.0005*100*100 = 5 → +5% Rare drop chance
    }

    let item: Item;
    if (!slot) {
      slot = this.slots[this._getRandomInt(this.slots.length)];
    }
    while(avoidWeapon && slot == "Main Hand") {
      slot = this.slots[this._getRandomInt(this.slots.length)];
    }
    if (slot == "Main Hand") {
      const type = this.mainHandTypes[this._getRandomInt(this.mainHandTypes.length)];
      const weaponStats = this.getWeaponStats(level, rarity);
      item = new Weapon(this.getRandomName(type), slot, this.getRandomImage(type), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, weaponStats.maxMinDamage, weaponStats.maxMaxDamage, weaponStats.maxAttackSpeed, type, level, weaponStats.stats, weaponStats.maxStats, rarity);
    } else if (slot == "Off Hand") {
      const type = this.offHandTypes[this._getRandomInt(this.offHandTypes.length)];
      if (type == 'Offhand Dagger') {
        const weaponStats = this.getWeaponStats(level, rarity);
        item = new Weapon(this.getRandomName(type, weaponStats.stats, rarity), slot, this.getRandomImage('Dagger'), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, weaponStats.maxMinDamage, weaponStats.maxMaxDamage, weaponStats.maxAttackSpeed, type, level, weaponStats.stats, weaponStats.maxStats, rarity);
      } else if (type == 'Shield') {
        const armorStats = this.getShieldStats(level, rarity);
        item = new Shield(this.getRandomName(type), slot, this.getRandomImage(type), armorStats.armor, armorStats.maxArmor, level, armorStats.stats, armorStats.maxStats, rarity);
      }
    } else {
      const armorStats = this.getArmorStats(level, rarity);
      item = new Armor(this.getRandomName(slot), slot, this.getRandomImage(slot), armorStats.armor, armorStats.maxArmor, armorStats.armorType, level, armorStats.stats, armorStats.maxStats, rarity);
    }

    return item!;
  }

  getMinDropRarity(monsterRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss"): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" {
    switch (monsterRarity) {
      case "Boss": return "Legendary";
      case "Legendary": return "Epic";
      case "Epic": return "Rare";
      case "Rare": return "Uncommon";
      case "Uncommon": return "Common";
      case "Common":
      default: return "Common";
    }
  }

  private getRandomRarity(
    minRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common",
    rareBonusPct: number = 0   // e.g. 5 for +5% Rare from relic
  ): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" {
    // 1) base % chances (sum to 100)
    const base = {
      Common:  51,
      Uncommon:25,
      Rare:    14,
      Epic:     7,
      Legendary:2,
      Mythic:   1
    };

    // 2) adjust Rare & Common
    const adjRare   = base.Rare   + rareBonusPct;
    const adjCommon = Math.max(0, base.Common - rareBonusPct);

    // 3) rebuild cumulative ranges
    const order: Array<keyof typeof base> = ["Common","Uncommon","Rare","Epic","Legendary","Mythic"];
    const probs = {
      Common:  adjCommon,
      Uncommon:base.Uncommon,
      Rare:    adjRare,
      Epic:    base.Epic,
      Legendary:base.Legendary,
      Mythic:  base.Mythic
    };

    // ensure total is 100 (tiny floating‐point fix)
    const total = Object.values(probs).reduce((a,b) => a+b, 0);
    if (total !== 100) {
      // scale down/up proportionally
      const scale = 100 / total;
      order.forEach(r => (probs[r] = probs[r] * scale));
    }

    // 4) roll
    const roll = Math.random() * 100;
    let cumulative = 0;
    let rolled: keyof typeof base = "Common";
    for (const key of order) {
      cumulative += probs[key];
      if (roll < cumulative) {
        rolled = key;
        break;
      }
    }

    // 5) respect minRarity floor
    const minIndex    = order.indexOf(minRarity);
    const rolledIndex = order.indexOf(rolled);
    return order[Math.max(minIndex, rolledIndex)];
  }


  upgradeWeapon(weapon: Weapon, newRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic"): Weapon {
    // const originalDps = (weapon.minDamage + weapon.maxDamage) / weapon.attackSpeed;

    let bestDps = 0;
    let bestRoll!: {minDamage: number, maxDamage: number, attackSpeed: number, stats: { stat: string, amount: number }[], maxMinDamage: number, maxMaxDamage: number, maxAttackSpeed: number, maxStats: { stat: string, amount: number }[] };

    // Try up to 10 times to roll better DPS
    for (let i = 0; i < 10; i++) {
      const roll = this.getWeaponStats(weapon.level, newRarity, weapon.stats.map(s => ({ stat: s.stat })));
      const newDps = (roll.minDamage + roll.maxDamage) / roll.attackSpeed;

      if (newDps > bestDps) {
        bestDps = newDps;
        bestRoll = roll;
      }
    }

    // Apply the new, stronger stats
    weapon._minDamage = bestRoll.minDamage;
    weapon._maxDamage = bestRoll.maxDamage;
    weapon._attackSpeed = bestRoll.attackSpeed;
    weapon._maxMinDamage = bestRoll.maxMinDamage;
    weapon._maxMaxDamage = bestRoll.maxMaxDamage;
    weapon._maxAttackSpeed = bestRoll.maxAttackSpeed;
    weapon.stats = bestRoll.stats;
    weapon.maxStats = bestRoll.maxStats;
    weapon.rarity = newRarity;

    return weapon;
  }

  getStatCountForRarity(rarity: string): number {
    switch (rarity) {
      case "Mythic": return 5;
      case "Legendary": return 4;
      case "Epic": return 3;
      case "Rare": return 2;
      case "Uncommon": return 1;
      default: return 0;
    }
  }

  getWeaponStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic", minStats: { stat: string }[] = []): {
    minDamage: number;
    maxDamage: number;
    attackSpeed: number;
    stats: { stat: string, amount: number }[];
    maxMinDamage: number;
    maxMaxDamage: number;
    maxAttackSpeed: number;
    maxStats: { stat: string, amount: number }[];
  } {
    const skew = this.getRaritySkewPercent(rarity);

    const roll = this._getRandomInt(skew);
    const reduction = (roll / skew) * 0.7;
    const attackSpeed = Math.max(0.8, 1.5 - reduction);

    const minDamage = Math.round(2 * level * (1 + ((this._getRandomInt(skew / 2) + skew) / 100)));
    const maxDamage = Math.round(2 * level * 1.5 * (1 + (2 * (this._getRandomInt(skew / 2) + skew) / 100)));

    // Ensure we include minStats first, then fill up to rarity limit
    const totalStatsNeeded = this.getStatCountForRarity(rarity);
    const statNames = ["Strength", "Stamina", "Agility", "Intellect", "Spirit"];
    const picked = new Set<string>();
    const stats: { stat: string, amount: number }[] = [];
    const maxStats: { stat: string, amount: number }[] = [];

    for (const s of minStats) {
      picked.add(s.stat);
      const amount = Math.round(level * (1 + this._getRandomInt(skew) / 100));
      const maxAmount = Math.round(level * (1 + skew / 100));
      stats.push({ stat: s.stat, amount });
      maxStats.push({ stat: s.stat, amount: maxAmount });
    }

    const remainingStats = statNames.filter(s => !picked.has(s));
    while (stats.length < totalStatsNeeded && remainingStats.length > 0) {
      const stat = remainingStats.splice(this._getRandomInt(remainingStats.length), 1)[0];
      const amount = Math.round(level * (1 + this._getRandomInt(skew) / 100));
      const maxAmount = Math.round(level * (1 + skew / 100));
      stats.push({ stat, amount });
      maxStats.push({ stat, amount: maxAmount });
    }

    return {
      minDamage,
      maxDamage,
      attackSpeed,
      stats,
      maxMinDamage: Math.round(2 * level * (1 + (1.5 * skew) / 100)),
      maxMaxDamage: Math.round(2 * level * 1.5 * (1 + (3.0 * skew) / 100)),
      maxAttackSpeed: 0.8,
      maxStats
    };
  }

  getShieldStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"): {
    armor: number;
    stats: { stat: string, amount: number }[];
    maxArmor: number;
    maxStats: { stat: string, amount: number }[];
  } {
    const skew = this.getRaritySkewPercent(rarity);
    const armor = Math.round(level * (1 + ((this._getRandomInt(skew / 2) + skew) / 100)));
    const {stats, maxStats} = this.getRandomStats(level, rarity);

    return {
      armor,
      stats,
      maxArmor: Math.round(level * 2 * (1 + (1.5 * skew) / 100)),
      maxStats
    };
  }

  getArmorStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"): {
    armor: number;
    armorType: "Cloth" | "Leather" | "Plate";
    stats: { stat: string, amount: number }[];
    maxArmor: number;
    maxStats: { stat: string, amount: number }[];
  } {
    const skew = this.getRaritySkewPercent(rarity);
    const armor = Math.round(level * 2 * (1 + ((this._getRandomInt(skew / 2) + skew) / 100)));
    const {stats, maxStats} = this.getRandomStats(level, rarity);

    return {
      armor,
      armorType: this.getRandomArmorType(),
      stats,
      maxArmor: Math.round(level * 2 * (1 + (1.5 * skew) / 100)),
      maxStats
    };
  }


  getRandomStats(
    level: number,
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic"
  ): { stats: {stat: string, amount: number}[], maxStats: {stat: string, amount: number}[] } {
    const statNames = ["Strength", "Stamina", "Agility", "Intellect", "Spirit"];
    const draws = this.getStatCountForRarity(rarity);
    const pickedStats: string[] = [];

    while (pickedStats.length < draws) {
      const statName = statNames[this._getRandomInt(statNames.length)];
      if (!pickedStats.includes(statName)) {
        pickedStats.push(statName);
      }
    }

    const skew = this.getRaritySkewPercent(rarity);
    const stats = pickedStats.map(stat => {
      const roll = this._getRandomInt(skew);
      return {
        stat,
        amount: Math.round(level * (1 + roll / 100))
      };
    });

    const maxStats = pickedStats.map(stat => ({
      stat,
      amount: Math.round(level * (1 + skew / 100))
    }));

    return { stats, maxStats };
  }


  getRandomArmorType() {
    const r = this._getRandomInt(3);
    switch (r) {
      case 2: return "Plate";
      case 1: return "Leather";
      default: return "Cloth";
    }
  }

  getRaritySkewPercent(rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic"): number {
    switch (rarity) {
      case "Common": return 5;
      case "Uncommon": return 12;
      case "Rare": return 25;
      case "Epic": return 40;
      case "Legendary": return 60;
      case "Mythic": return 85;
      default: return 5;
    }
  }

  getRandomName(identifier: string, stats?: {stat: string, amount: number}[], rarity?: string): string {
    const rarityPrefix = this.getPrefixForRarity(rarity);
    const base = this._getRandomItemName(identifier);
    const suffix = this.getSuffixFromStats(stats);
    return `${rarityPrefix} ${base} of the ${suffix}`;
  }

  getPrefixForRarity(rarity?: string): string {
    const common = this._prefixes.slice(0, 10);
    const uncommon = this._prefixes.slice(10, 20);
    const rare = this._prefixes.slice(20, 30);
    const epic = this._prefixes.slice(30, 40);
    const legendary = this._prefixes.slice(40, 50);
    const mythic = this._prefixes.slice(50, 60);

    switch (rarity) {
      case "Mythic": return this._randomFrom(mythic);
      case "Legendary": return this._randomFrom(legendary);
      case "Epic": return this._randomFrom(epic);
      case "Rare": return this._randomFrom(rare);
      case "Uncommon": return this._randomFrom(uncommon);
      default: return this._randomFrom(common);
    }
  }

  _randomFrom(arr: string[]): string {
    return arr[this._getRandomInt(arr.length)];
  }

  getSuffixFromStats(stats?: {stat: string, amount: number}[]): string {
    if (!stats || stats.length === 0) return this._getRandomAdj();

    // Score suffixes by matching stat weights
    const suffixWeights: { [key: string]: number } = {};

    for (const {stat, amount} of stats) {
      const suffixes = this._suffixesByStat[stat as keyof typeof this._suffixesByStat];
      if (!suffixes) continue;

      for (const s of suffixes) {
        suffixWeights[s] = (suffixWeights[s] || 0) + amount;
      }
    }

    const all = Object.entries(suffixWeights);
    if (all.length === 0) return this._getRandomAdj();

    // Pick based on highest score (or weighted roll if you prefer)
    all.sort((a, b) => b[1] - a[1]);
    return all[0][0];
  }

  _prefixes = [
    // Common
    "Cracked", "Rugged", "Plain", "Rusty", "Splintered", "Bent", "Faded", "Tarnished", "Simple", "Chipped",
    // Uncommon
    "Polished", "Sturdy", "Honed", "Runed", "Ornate", "Spiked", "Silent", "Glinting", "Tempered", "Refined",
    // Rare
    "Enchanted", "Mystic", "Blessed", "Cursed", "Shimmering", "Serrated", "Warded", "Engraved", "Arcane", "Shadowy",
    // Epic
    "Shadowed", "Twisted", "Demonic", "Bloodforged", "Gleaming", "Darkforged", "Phantom", "Hexed", "Voidbound", "Frosted",
    // Legendary
    "Eternal", "Celestial", "Ironbound", "Sunforged", "Hellborn", "Starforged", "Draconic", "Mythwoven", "Emberforged", "Spiritbound",
    // Mythic
    "Primordial", "Godforged", "Ancient", "Titanforged", "Worldsplitter", "Astral", "Runebound", "Netherborn", "Firstborn", "Originbound"
  ];
  _suffixesByStat = {
    Strength: ["Bear", "Bull", "Mountain", "Titan"],
    Agility: ["Fox", "Monkey", "Wind", "Panther"],
    Intellect: ["Sage", "Owl", "Mind", "Archmage"],
    Spirit: ["Whisper", "Tree", "Seer", "Light"],
    Stamina: ["Boar", "Stone", "Endurance", "Oak"]
  };
  _getRandomAdj(): string {
    return this._prefixes[this._getRandomInt(this._prefixes.length)];
  }

  _getRandomItemName(identifier: string) {
    const adjs = this._itemName.get(identifier)!;
    return adjs[this._getRandomInt(adjs.length)];
  }

  // generates a number from 0 to max - 1
  _getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  maxImages = 2;
  getRandomImage(identifier: string) {
    return `${identifier}_${this._getRandomInt(this.maxImages)+1}.jpg`;
  }
}
