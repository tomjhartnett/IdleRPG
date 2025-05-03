export abstract class Item {
  name: string;
  slot: string;
  level: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  imagePath: string;
  stats: {stat: string, amount: number}[];
  maxStats: {stat: string, amount: number}[];
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
  abstract get altTooltipLines(): string[][];
  abstract get averagePercent(): number;

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

  protected constructor(name: string, slot: string, imagePath: string, level: number, stats: {stat: string, amount: number}[], maxStats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common", reinforceLevel?: number) {
    this.name = name;
    this.slot = slot;
    this.imagePath = imagePath;
    this.level = level;
    this.stats = stats;
    this.maxStats = maxStats;
    this.rarity = rarity;
    this.reinforceLevel = reinforceLevel ?? 0;
  }

  getStatPercent(statName: string): number | null {
    const actual = this.getStatValue(statName);
    const maxEntry = this.maxStats?.find(s => s.stat === statName);
    if (!maxEntry || !maxEntry.amount) return null;

    const max = Math.ceil(maxEntry.amount * this.reinforceMultiplier);
    if (max === 0) return null;

    return Math.round((actual / max) * 100);
  }

  getStatValue(statName: string): number {
    const base = this.stats.find(s => s.stat === statName)?.amount || 0;
    return Math.ceil(base * this.reinforceMultiplier);
  }
}

export abstract class DefensiveItem extends Item {
  _armor: number;
  _maxArmor: number;

  get armor(): number {
    return Math.ceil(this._armor * this.reinforceMultiplier);
  }

  get armorPercent(): number {
    const rolled = this.armor;
    const max = Math.ceil(this._maxArmor * this.reinforceMultiplier);
    return Math.round((rolled / max) * 100);
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor`]];
  }

  get altTooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.armor} Armor (${this.armorPercent}%)`]];
  }

  override get averagePercent(): number {
    const percents = [this.armorPercent];
    const relevantStats = ['Strength', 'Stamina', 'Agility', 'Intellect', 'Spirit'];
    for (const stat of relevantStats) {
      const percent = this.getStatPercent(stat);
      if (typeof percent === 'number' && !isNaN(percent)) {
        percents.push(percent);
      }
    }
    const total = percents.reduce((sum, p) => sum + p, 0);

    return Math.round(total / percents.length);
  }

  protected constructor(
    name: string,
    slot: string,
    imagePath: string,
    armor: number,
    maxArmor: number,
    level: number,
    stats: { stat: string; amount: number }[],
    maxStats: { stat: string; amount: number }[],
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"
  ) {
    super(name, slot, imagePath, level, stats, maxStats, rarity);
    this._armor = armor;
    this._maxArmor = maxArmor;
  }
}

export class Armor extends DefensiveItem {
  armorType: "Cloth" | "Leather" | "Plate";

  override get type(): string {
    return this.armorType;
  }

  constructor(
    name: string,
    slot: string,
    imagePath: string,
    armor: number,
    maxArmor: number,
    armorType: "Cloth" | "Leather" | "Plate",
    level: number,
    stats: { stat: string; amount: number }[],
    maxStats: { stat: string; amount: number }[],
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"
  ) {
    super(name, slot, imagePath, armor, maxArmor, level, stats, maxStats, rarity);
    this.armorType = armorType;
  }
}


export class Shield extends DefensiveItem {
  override get type(): string {
    return "Shield";
  }

  constructor(
    name: string,
    slot: string,
    imagePath: string,
    armor: number,
    maxArmor: number,
    level: number,
    stats: { stat: string; amount: number }[],
    maxStats: { stat: string; amount: number }[],
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common"
  ) {
    super(name, slot, imagePath, armor, maxArmor, level, stats, maxStats, rarity);
  }
}

export class Weapon extends Item {
  _minDamage: number;
  _maxDamage: number;
  _attackSpeed: number;
  _maxMinDamage: number;
  _maxMaxDamage: number;
  _maxAttackSpeed: number;
  weaponType: string;

  get minDamage() {
    return Math.ceil(this._minDamage * this.reinforceMultiplier);
  }
  get minDamagePercent(): number {
    const rolled = this.minDamage;
    const max = Math.ceil(this._maxMinDamage * this.reinforceMultiplier);
    return Math.round((rolled / max) * 100);
  }

  get maxDamage() {
    return Math.ceil(this._maxDamage * this.reinforceMultiplier);
  }
  get maxDamagePercent(): number {
    const rolled = this.maxDamage;
    const max = Math.ceil(this._maxMaxDamage * this.reinforceMultiplier);
    return Math.round((rolled / max) * 100);
  }

  get attackSpeed() {
    return parseFloat((this._attackSpeed / this.reinforceMultiplier).toFixed(2));
  }
  get attackSpeedPercent(): number {
    const rolled = this.attackSpeed;
    const max = parseFloat((this._maxAttackSpeed / this.reinforceMultiplier).toFixed(2));
    return Math.round((max / rolled) * 100);
  }

  get type(): string {
    return this.weaponType;
  }

  get DPS(): string {
    return ((this.minDamage + this.maxDamage) / this.attackSpeed).toFixed(2);
  }
  get maxDPSPercent(): string {
    const rolled = parseFloat(this.DPS); // your existing DPS getter returns a string
    const max = (this._maxMinDamage + this._maxMaxDamage) / this._maxAttackSpeed;

    return Math.round((rolled / max) * 100).toFixed(0);
  }

  get tooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.minDamage} - ${this.maxDamage} Damage`, `Speed ${this.attackSpeed.toFixed(2)}`], [`(${this.DPS} damage per second)`]];
  }
  get altTooltipLines(): string[][] {
    return [[this.slot, this.type], [`${this.minDamage} (${this.minDamagePercent}%) - ${this.maxDamage} (${this.maxDamagePercent}%) Damage`, `Speed ${this.attackSpeed.toFixed(2)} (${this.attackSpeedPercent}%)`], [`(${this.DPS} (${this.maxDPSPercent}%) damage per second)`]];
  }

  override get averagePercent(): number {
    return parseFloat(this.maxDPSPercent);
  }

  constructor(name: string, slot: string, imagePath: string, minDamage: number, maxDamage: number, attackSpeed: number, maxMinDamage: number, maxMaxDamage: number, maxAttackSpeed: number, weaponType: string, level: number, stats: {stat: string, amount: number}[], maxStats: {stat: string, amount: number}[], rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Common") {
    super(name, slot, imagePath, level, stats, maxStats, rarity);
    this._minDamage = minDamage;
    this._maxDamage = maxDamage;
    this._attackSpeed = attackSpeed;
    this._maxMinDamage = maxMinDamage;
    this._maxMaxDamage = maxMaxDamage;
    this._maxAttackSpeed = maxAttackSpeed;
    this.weaponType = weaponType;
  }
}
