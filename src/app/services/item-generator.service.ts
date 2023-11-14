import { Injectable } from '@angular/core';
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

  generateItem(level: number, rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Random", slot?: string, avoidWeapon?: boolean): Item {
    let item: Item;
    if (!slot) {
      slot = this.slots[this._getRandomInt(this.slots.length)];
    }
    while(avoidWeapon && slot == "Main Hand") {
      slot = this.slots[this._getRandomInt(this.slots.length)];
    }
    if (!rarity || rarity == "Random") {
      const rng = this._getRandomInt(100);
      if(rng > 98) {
        rarity = "Legendary"
      } else if (rng > 95) {
        rarity = "Epic";
      } else if (rng > 80) {
        rarity = "Rare";
      } else if (rng > 50) {
        rarity = "Uncommon";
      } else {
        rarity = "Common";
      }
    }
    if (slot == "Main Hand") {
      const type = this.mainHandTypes[this._getRandomInt(this.mainHandTypes.length)];
      const weaponStats = this.getWeaponStats(level, rarity);
      item = new Weapon(this.getRandomName(type), slot, this.getRandomImage(type), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, type, level, weaponStats.stats, rarity);
    } else if (slot == "Off Hand") {
      const type = this.offHandTypes[this._getRandomInt(this.offHandTypes.length)];
      if (type == 'Offhand Dagger') {
        const weaponStats = this.getWeaponStats(level, rarity);
        item = new Weapon(this.getRandomName(type), slot, this.getRandomImage('Dagger'), weaponStats.minDamage, weaponStats.maxDamage, weaponStats.attackSpeed, type, level, weaponStats.stats, rarity);
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

  getWeaponStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common"): {minDamage: number, maxDamage: number, attackSpeed: number, stats: {stat: string, amount: number}[]} {
    return {
      minDamage: Math.round(level * (1 + ((this._getRandomInt(this.getRaritySkewPercent(rarity)/2) + this.getRaritySkewPercent(rarity)) / 100))),
      maxDamage: Math.round(level * 1.5 * (1 + (2 * (this._getRandomInt(this.getRaritySkewPercent(rarity)/2) + this.getRaritySkewPercent(rarity)) / 100))),
      attackSpeed: 1 + (this._getRandomInt(this.getRaritySkewPercent(rarity)) / 100),
      stats: this.getRandomStats(level, rarity)
    };
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

  getRandomStats(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"): {stat: string, amount: number}[] {
    let statNames = ["Strength", "Stamina", "Agility", "Intellect", "Spirit"];
    let draws = 0;
    switch (rarity) {
      case "Legendary": draws = 4; break;
      case "Epic": draws = 3; break;
      case "Rare": draws = 2; break;
      case "Uncommon": draws = 1; break;
      default: break;
    }
    let pickedStats: string[] = [];
    while(draws > 0) {
      let statName = statNames[this._getRandomInt(statNames.length)];
      if (!pickedStats.includes(statName)) {
        pickedStats.push(statName);
        draws--;
      }
    }

    // send the stats in presorted order
    let ret: {stat: string, amount: number}[] = [];
    for (let stat of statNames) {
      if (pickedStats.includes(stat)) {
        ret.push({stat, amount: Math.round(level * (1 + (this._getRandomInt(this.getRaritySkewPercent(rarity)) / 100)))});
      }
    }

    return ret;
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
      case "Legendary": return 80;
      default: return 10;
    }
  }

  getRandomName(identifier: string) {
    return `${this._getRandomAdj()} ${this._getRandomItemName(identifier)} of the ${this._getRandomAdj()}`;
  }

  _prefixes = ["Golden", "Calming", "Vibrant", "Strong", "Broad"];
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
