import {InventorySet} from "./inventory-set.model";
import {Item} from "./item.model";

export abstract class Entity {
  abstract name: string;
  level: number;
  abstract strength: number;
  abstract stamina: number;
  abstract agility: number;
  abstract intellect: number;
  abstract spirit: number;
  currentHp: number;
  // name: string;
  // image: string;

  abstract get totalArmor(): number;

  get maxHp(): number {
    return Math.round((this.level * 10) + (this.stamina * 5));
  }

  get percentDmgUp(): number {
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

  get avgDR(): string {
    return (100 * this.DR).toFixed(2);
  }

  get DR(): number {
    return (this.totalArmor / (this.totalArmor + 400 + (7 * this.level)));
  }

  protected constructor(level: number) {
    this.level = level;
    this.currentHp = this.maxHp;
  }

  takeDamage(dmg: number): number {
    let modifiedDmg = Math.round(dmg * (1.0 - this.DR));
    if(Math.floor(Math.random() * 100) + 1 <= Math.floor(this.dodgeChance)) {
      modifiedDmg = 0;
    }
    if(this.currentHp - modifiedDmg < 0) {
      this.currentHp = 0;
    } else {
      this.currentHp -= modifiedDmg;
    }
    return modifiedDmg;
  }

  heal() {
    this.currentHp = this.maxHp;
  }
}

export class Player extends Entity {
  name = "Player";
  xp: number = 0;
  inventorySet: InventorySet;

  get totalArmor(): number {
    return this.baseArmor + this.inventorySet?.totalArmor;
  }

  get xpToNextLevel() {
    return Math.round(8 * this.level);
  }

  get strength(): number {
    return this.level * 5 + this.inventorySet?.strength;
  }
  get stamina(): number {
    return this.level * 5 + this.inventorySet?.stamina;
  }
  get agility(): number {
    return this.level * 5 + this.inventorySet?.agility;
  }
  get intellect(): number {
    return this.level * 5 + this.inventorySet?.intellect;
  }
  get spirit(): number {
    return this.level * 5 + this.inventorySet?.spirit;
  }

  constructor(inventorySet: InventorySet, level: number = 1) {
    super(level);
    this.inventorySet = inventorySet;
    this.currentHp = this.maxHp;
  }

  equipItem(item: Item) {
    this.inventorySet.addItem(item);
  }

  // add exp to character and level up if needed
  addExp(exp: number) {
    this.xp = Math.round(this.xp + exp);
    while(this.xp >= this.xpToNextLevel) {
      this.xp = Math.round(this.xp - this.xpToNextLevel);
      this.level++;
    }
  }
}

export class Monster extends Entity {
  name = "Monster";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss";
  strength: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  stamina: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  agility: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  intellect: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  spirit: number = this.getRandomInt(this.rarityPercent) * this.level * 5;
  MAX_MONSTER_IMAGES = 6;
  image: string = `monster_` + (this.getRandomInt(this.MAX_MONSTER_IMAGES) + 1);

  get totalArmor(): number {
    return this.baseArmor;
  }

  get xpAwarded(): number {
    let rarityScale;
    switch (this.rarity) {
      case "Boss": rarityScale = 32; break;
      case "Legendary": rarityScale = 16; break;
      case "Epic": rarityScale = 8; break;
      case "Rare": rarityScale = 4; break;
      case "Uncommon": rarityScale = 2; break;
      default: rarityScale = 1; break;
    }
    return this.level * rarityScale * 2;
  }

  get rarityPercent(): number {
    switch (this.rarity) {
      case "Common": return  1;
      case "Uncommon": return 2;
      case "Rare": return 4;
      case "Epic": return 8;
      case "Legendary": return 16;
      case "Boss": return 32;
      default: return 1;
    }
  }

  constructor(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss") {
    super(level);
    this.rarity = rarity;
    this.currentHp = this.maxHp;
  }

  // generates a number from 0 to max
  getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
