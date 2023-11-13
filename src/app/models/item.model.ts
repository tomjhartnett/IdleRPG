export abstract class Item {
  name: string;
  slot: string;
  level: number;
  rarity: string;
  stats: {stat: string, amount: number}[];

  abstract get type(): string;

  abstract get tooltipLines(): string[][];

  get color(): string {
    let ret = '';
    switch (this.rarity) {
      case 'Common': ret = "#dedee8"; break;
      case 'Uncommon': ret = "#4fc75d"; break;
      case 'Rare': ret = "#515fed"; break;
      case 'Epic': ret = "#8821b4"; break;
      case 'Legendary': ret = "#b98523"; break;
      default: ret = "#dedee8"; break;
    }
    return ret;
  }

  protected constructor(name: string, slot: string, level: number, stats: {stat: string, amount: number}[], rarity: string = "Common") {
    this.name = name;
    this.slot = slot;
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

  constructor(name: string, slot: string, armor: number, armorType: "Cloth" | "Leather" | "Plate", level: number, stats: {stat: string, amount: number}[], rarity: string = "Common") {
    super(name, slot, level, stats, rarity);
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

  constructor(name: string, slot: string, armor: number, armorType: "Cloth" | "Leather" | "Plate", level: number, stats: {stat: string, amount: number}[], rarity: string = "Common") {
    super(name, slot, level, stats, rarity);
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
    return [[this.slot, this.type], [`${this.minDamage} - ${this.maxDamage} Damage`, `Speed ${this.attackSpeed}`], [`(${this.DPS} damage per second)`]];
  }

  constructor(name: string, slot: string, minDamage: number, maxDamage: number, attackSpeed: number, weaponType: string, level: number, stats: {stat: string, amount: number}[], rarity: string = "Common") {
    super(name, slot, level, stats, rarity);
    this.minDamage = minDamage;
    this.maxDamage = maxDamage;
    this.attackSpeed = attackSpeed;
    this.weaponType = weaponType;
  }
}
