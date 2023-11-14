export abstract class Item {
  name: string;
  slot: string;
  level: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  imagePath: string;
  stats: {stat: string, amount: number}[];
  lastUpdatedWeight: number = 0;

  get strength() {
    let total = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Strength') {
        total += stat.amount;
      }
    }
    return total;
  }
  get stamina() {
    let total = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Stamina') {
        total += stat.amount;
      }
    }
    return total;
  }
  get agility() {
    let total = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Agility') {
        total += stat.amount;
      }
    }
    return total;
  }
  get intellect() {
    let total = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Intellect') {
        total += stat.amount;
      }
    }
    return total;
  }
  get spirit() {
    let total = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Spirit') {
        total += stat.amount;
      }
    }
    return total;
  }

  abstract get type(): string;

  abstract get tooltipLines(): string[][];

  get color(): string {
    switch (this.rarity) {
      case 'Common': return "#dedee8";
      case 'Uncommon': return "#4fc75d";
      case 'Rare': return "#515fed";
      case 'Epic': return "#8821b4";
      case 'Legendary': return "#b98523";
      default: return "#dedee8";
    }
  }

  protected constructor(name: string, slot: string, imagePath: string, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common") {
    this.name = name;
    this.slot = slot;
    this.imagePath = imagePath;
    this.level = level;
    this.stats = stats;
    this.rarity = rarity;
  }
}

export class Armor extends Item {
  armorType: "Cloth" | "Leather" | "Plate";
  armor: number;

  get type(): string {
    return this.armorType;
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor`]];
  }

  constructor(name: string, slot: string, imagePath: string, armor: number, armorType: "Cloth" | "Leather" | "Plate", level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this.armor = armor;
    this.armorType = armorType;
  }
}

export class Shield extends Item {
  armor: number;

  get type(): string {
    return "Shield";
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor`]];
  }

  constructor(name: string, slot: string, imagePath: string, armor: number, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this.armor = armor;
  }
}

export class Weapon extends Item {
  minDamage: number;
  maxDamage: number;
  attackSpeed: number;
  weaponType: string;

  get type(): string {
    return this.weaponType;
  }

  get DPS(): string {
    return ((this.minDamage + this.maxDamage) / this.attackSpeed).toFixed(2);
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.minDamage} - ${this.maxDamage} Damage`, `Speed ${this.attackSpeed.toFixed(2)}`], [`(${this.DPS} damage per second)`]];
  }

  constructor(name: string, slot: string, imagePath: string, minDamage: number, maxDamage: number, attackSpeed: number, weaponType: string, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this.minDamage = minDamage;
    this.maxDamage = maxDamage;
    this.attackSpeed = attackSpeed;
    this.weaponType = weaponType;
  }
}
