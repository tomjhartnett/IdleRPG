import {InventorySet} from "./inventory-set.model";

export abstract class Entity {
  level: number;
  abstract strength: number;
  abstract stamina: number;
  abstract agility: number;
  abstract intellect: number;
  abstract spirit: number;
  currentHp: number;
  // name: string;
  // image: string;

  get maxHp(): number {
    return (this.level * 20) + (this.stamina * 10);
  }

  get flatDmgUp(): number {
    return this.strength * 2;
  }

  get baseArmor(): number {
    return 2 * this.agility;
  }

  get critChance(): number {
    return Math.log((this.agility * 2) * (this.intellect * 5));
  }

  get dodgeChance(): number {
    return Math.log(this.agility * 5);
  }

  protected constructor(level: number) {
    this.level = level;
    this.currentHp = this.maxHp;
  }
}

export class Player extends Entity {
  xp: number = 0;
  inventorySet: InventorySet;

  get totalArmor(): number {
    return this.baseArmor + this.inventorySet.totalArmor;
  }

  get xpToNextLevel() {
    return 8 * this.level;
  }

  get strength(): number {
    return this.level * 5;
  }
  get stamina(): number {
    return this.level * 5;
  }
  get agility(): number {
    return this.level * 5;
  }
  get intellect(): number {
    return this.level * 5;
  }
  get spirit(): number {
    return this.level * 5;
  }
  get avgDR() {
    return (this.totalArmor / (this.totalArmor + 400 + (85 * this.level)));
  }

  constructor(inventorySet: InventorySet, level: number = 1) {
    super(level);
    this.inventorySet = inventorySet;
  }

  // add exp to character and level up if needed
  addExp(exp: number) {
    if(this.xp + exp > this.xpToNextLevel) {
      this.xp = this.xp + exp - this.xpToNextLevel;
      this.level++;
    } else {
      this.xp += exp;
    }
  }
}

export class Monster extends Entity {
  rarity: "Common" | "Uncommon" | "Rare" | "Legendary" | "Boss";
  strength: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  stamina: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  agility: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  intellect: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  spirit: number = this.getRandomInt(this.rarityPercent) * this.level * 5;

  get totalArmor(): number {
    return this.baseArmor;
  }

  get rarityPercent(): number {
    switch (this.rarity) {
      case "Common": return  10;
      case "Uncommon": return 20;
      case "Rare": return 40;
      case "Legendary": return 80;
      case "Boss": return 160;
      default: return 10;
    }
  }

  constructor(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Legendary" | "Boss") {
    super(level);
    this.rarity = rarity;
  }

  // generates a number from 0 to max
  getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
