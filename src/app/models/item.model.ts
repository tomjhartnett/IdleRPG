export abstract class Item {
  name: string;
  slot: string;
  level: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  imagePath: string;
  stats: {stat: string, amount: number}[];
  lastUpdatedWeight: number = 0;
  reinforceLevel: number = 0;

  get reinforceMultiplier(): number {
    return 1 + 0.1 * (this.reinforceLevel || 0); // 10% per level
  }

  get strength() {
    let base = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Strength') {
        base += stat.amount;
      }
    }
    return Math.ceil(base * this.reinforceMultiplier);
  }
  get stamina() {
    let base = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Stamina') {
        base += stat.amount;
      }
    }
    return Math.ceil(base * this.reinforceMultiplier);
  }
  get agility() {
    let base = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Agility') {
        base += stat.amount;
      }
    }
    return Math.ceil(base * this.reinforceMultiplier);
  }
  get intellect() {
    let base = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Intellect') {
        base += stat.amount;
      }
    }
    return Math.ceil(base * this.reinforceMultiplier);
  }
  get spirit() {
    let base = 0;
    for(let stat of this.stats) {
      if(stat.stat === 'Spirit') {
        base += stat.amount;
      }
    }
    return Math.ceil(base * this.reinforceMultiplier);
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
      case 'Mythic': return "#cc2c2c";
      default: return "#dedee8";
    }
  }

  protected constructor(name: string, slot: string, imagePath: string, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common", reinforceLevel?: number) {
    this.name = name;
    this.slot = slot;
    this.imagePath = imagePath;
    this.level = level;
    this.stats = stats;
    this.rarity = rarity;
    this.reinforceLevel = reinforceLevel ?? 0;
  }
}

export class Armor extends Item {
  armorType: "Cloth" | "Leather" | "Plate";
  _armor: number;

  get armor() {
    return Math.ceil(this._armor * this.reinforceMultiplier);
  }

  get type(): string {
    return this.armorType;
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor`]];
  }

  constructor(name: string, slot: string, imagePath: string, armor: number, armorType: "Cloth" | "Leather" | "Plate", level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this._armor = armor;
    this.armorType = armorType;
  }
}

export class Shield extends Item {
  _armor: number;

  get armor() {
    return Math.ceil(this._armor * this.reinforceMultiplier);
  }

  get type(): string {
    return "Shield";
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor`]];
  }

  constructor(name: string, slot: string, imagePath: string, armor: number, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this._armor = armor;
  }
}

export class Weapon extends Item {
  _minDamage: number;
  _maxDamage: number;
  _attackSpeed: number;
  weaponType: string;

  get minDamage() {
    return Math.ceil(this._minDamage * this.reinforceMultiplier);
  }

  get maxDamage() {
    return Math.ceil(this._maxDamage * this.reinforceMultiplier);
  }

  get attackSpeed() {
    return parseFloat((this._attackSpeed / this.reinforceMultiplier).toFixed(2));
  }

  get type(): string {
    return this.weaponType;
  }

  get DPS(): string {
    return ((this.minDamage + this.maxDamage) / this.attackSpeed).toFixed(2);
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.minDamage} - ${this.maxDamage} Damage`, `Speed ${this.attackSpeed.toFixed(2)}`], [`(${this.DPS} damage per second)`]];
  }

  constructor(name: string, slot: string, imagePath: string, minDamage: number, maxDamage: number, attackSpeed: number, weaponType: string, level: number, stats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common") {
    super(name, slot, imagePath, level, stats, rarity);
    this._minDamage = minDamage;
    this._maxDamage = maxDamage;
    this._attackSpeed = attackSpeed;
    this.weaponType = weaponType;
  }
}
