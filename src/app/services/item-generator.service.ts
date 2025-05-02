import {Injectable} from '@angular/core';
import {Armor, Item, Shield, Weapon} from "../models/item.model";

@Injectable({
  providedIn: 'root'
})
export class ItemGeneratorService {

  slots = ["Head", "Neck", "Shoulders", "Back", "Chest", "Wrists", "Hands", "Waist", "Legs", "Feet", "Finger", "Trinket", "Main Hand", "Off Hand"];
  mainHandTypes = ["Sword", "Mace", "Dagger"];
  offHandTypes = ["Shield", "Offhand Dagger"];
  _itemName: Map<string, string[]> = new Map<string, string[]>();

  constructor() {
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

  generateItem(level: number, rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Random", slot?: string, avoidWeapon?: boolean, minRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common"): Item {
    if (!rarity || rarity === "Random") {
      rarity = this.getRandomRarity(minRarity); // uses Common as fallback min
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
      item = new Weapon(this.getRandomName(type), slot, this.getRandomImage(type), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, type, level, weaponStats.stats, rarity);
    } else if (slot == "Off Hand") {
      const type = this.offHandTypes[this._getRandomInt(this.offHandTypes.length)];
      if (type == 'Offhand Dagger') {
        const weaponStats = this.getWeaponStats(level, rarity);
        item = new Weapon(this.getRandomName(type, weaponStats.stats, rarity), slot, this.getRandomImage('Dagger'), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, type, level, weaponStats.stats, rarity);
      } else if (type == 'Shield') {
        const armorStats = this.getShieldStats(level, rarity);
        item = new Shield(this.getRandomName(type), slot, this.getRandomImage(type), armorStats.armor, level, armorStats.stats, rarity);
      }
    } else {
      const armorStats = this.getArmorStats(level, rarity);
      item = new Armor(this.getRandomName(slot), slot, this.getRandomImage(slot), armorStats.armor, armorStats.armorType, level, armorStats.stats, rarity);
    }

    return item!;
  }

  getMinDropRarity(monsterRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss"): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" {
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

  private getRandomRarity(minRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common"): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" {
    const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
    const minIndex = rarityOrder.indexOf(minRarity);
    const roll = this._getRandomInt(100);

    let rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common";
    if (roll > 98) rarity = "Legendary";
    else if (roll > 95) rarity = "Epic";
    else if (roll > 80) rarity = "Rare";
    else if (roll > 50) rarity = "Uncommon";
    else rarity = "Common";

    const rolledIndex = rarityOrder.indexOf(rarity);
    return rarityOrder[Math.max(rolledIndex, minIndex)];
  }

  upgradeWeapon(weapon: Weapon, newRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"): Weapon {
    weapon._minDamage = Math.round(weapon.level * (1 + (this.getRaritySkewPercent(newRarity) / 100)));
    weapon._maxDamage = Math.round(weapon.level * 1.5 * (1 + (2 * (this.getRaritySkewPercent(newRarity) / 100))));
    weapon.stats = this.getRandomStats(weapon.level, newRarity);
    weapon.rarity = newRarity;
    return weapon;
  }

  getWeaponStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary", type?: string): {
    minDamage: number;
    maxDamage: number;
    attackSpeed: number;
    stats: { stat: string, amount: number }[];
  } {
    const statBias = this.getStatBiasForWeapon(type);

    return {
      minDamage: Math.round(level * (1 + ((this._getRandomInt(this.getRaritySkewPercent(rarity) / 2) + this.getRaritySkewPercent(rarity)) / 100))),
      maxDamage: Math.round(level * 1.5 * (1 + (2 * (this._getRandomInt(this.getRaritySkewPercent(rarity) / 2) + this.getRaritySkewPercent(rarity)) / 100))),
      attackSpeed: 1 + (this._getRandomInt(this.getRaritySkewPercent(rarity)) / 100),
      stats: this.getRandomStats(level, rarity, statBias)
    };
  }

  getStatBiasForWeapon(type?: string): string[] {
    switch (type) {
      case "Sword": return ["Strength", "Agility"];
      case "Mace": return ["Intellect", "Spirit"];
      case "Dagger": return ["Agility"];
      default: return [];
    }
  }

  getShieldStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common"): {armor: number, stats: {stat: string, amount: number}[]} {
    return {
      armor: Math.round(level * (1 + ((this._getRandomInt(this.getRaritySkewPercent(rarity)/2) + this.getRaritySkewPercent(rarity)) / 100))),
      stats: this.getRandomStats(level, rarity)
    };
  }

  getArmorStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common"): {armor: number, armorType: "Cloth" | "Leather" | "Plate", stats: {stat: string, amount: number}[]} {
    return {
      armor: Math.round(level * 2 * (1 + ((this._getRandomInt(this.getRaritySkewPercent(rarity)/2) + this.getRaritySkewPercent(rarity)) / 100))),
      armorType: this.getRandomArmorType(),
      stats: this.getRandomStats(level, rarity)
    };
  }

  getRandomStats(
    level: number,
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary",
    preferredStats: string[] = []
  ): {stat: string, amount: number}[] {
    const statNames = ["Strength", "Stamina", "Agility", "Intellect", "Spirit"];
    let draws = 0;
    switch (rarity) {
      case "Legendary": draws = 4; break;
      case "Epic": draws = 3; break;
      case "Rare": draws = 2; break;
      case "Uncommon": draws = 1; break;
      default: break;
    }

    const pickedStats: string[] = [];

    while (draws > 0) {
      // 70% chance to prefer a biased stat if given
      const usePreferred = preferredStats.length && Math.random() < 0.7;
      const pool = usePreferred ? preferredStats : statNames;

      const statName = pool[this._getRandomInt(pool.length)];
      if (!pickedStats.includes(statName)) {
        pickedStats.push(statName);
        draws--;
      }
    }

    return statNames
      .filter(stat => pickedStats.includes(stat))
      .map(stat => ({
        stat,
        amount: Math.round(level * (1 + (this._getRandomInt(this.getRaritySkewPercent(rarity)) / 100)))
      }));
  }


  getRandomArmorType() {
    const r = this._getRandomInt(3);
    switch (r) {
      case 2: return "Plate";
      case 1: return "Leather";
      default: return "Cloth";
    }
  }

  getRaritySkewPercent(rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"): number {
    switch (rarity) {
      case "Common": return  10;
      case "Uncommon": return 20;
      case "Rare": return 40;
      case "Epic": return 80;
      case "Legendary": return 160;
      default: return 10;
    }
  }

  getRandomName(identifier: string, stats?: {stat: string, amount: number}[], rarity?: string): string {
    const rarityPrefix = this.getPrefixForRarity(rarity);
    const base = this._getRandomItemName(identifier);
    const suffix = this.getSuffixFromStats(stats);
    return `${rarityPrefix} ${base} of the ${suffix}`;
  }

  getPrefixForRarity(rarity?: string): string {
    switch (rarity) {
      case "Legendary": return "Mythic";
      case "Epic": return "Shadowed";
      case "Rare": return "Enchanted";
      case "Uncommon": return this._prefixes[this._getRandomInt(this._prefixes.length)];
      default: return this._prefixes[this._getRandomInt(this._prefixes.length)];
    }
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
    "Ancient", "Cracked", "Burnished", "Runed", "Polished", "Savage", "Sturdy", "Mystic",
    "Spiked", "Ornate", "Glinting", "Corroded", "Silent", "Rugged", "Twisted", "Serrated",
    "Shimmering", "Honed", "Blessed", "Cursed", "Ironbound", "Bone", "Demonic", "Celestial"
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

  // generates a number from 0 to max
  _getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  maxImages = 2;
  getRandomImage(identifier: string) {
    return `${identifier}_${this._getRandomInt(this.maxImages)+1}.jpg`;
  }
}
