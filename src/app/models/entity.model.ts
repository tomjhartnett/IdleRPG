import {InventorySet} from "./inventory-set.model";
import {Item} from "./item.model";
import {Skill} from "./skill.model";

export abstract class Entity {
  abstract name: string;
  level: number;
  abstract strength: number;
  abstract stamina: number;
  abstract agility: number;
  abstract intellect: number;
  abstract spirit: number;
  currentHp: number;

  abstract get totalArmor(): number;

  get maxHp(): number {
    return Math.round((this.level * 10) + this.stamina + this.spirit);
  }

  get percentDmgUp(): number {
    return this.strength / 10;
  }

  get baseArmor(): number {
    return 2 * this.agility;
  }

  get critChance(): number {
    const baseCritScore = (this.agility + this.intellect)/2;
    const scaling = 1000 + (this.level * 40);

    return 100 * (baseCritScore / (baseCritScore + scaling));
  }

  get dodgeChance(): number {
    const baseDodgeScore = this.agility;
    const scaling = 1000 + (this.level * 40);

    return 100 * (baseDodgeScore / (baseDodgeScore + scaling));
  }

  get DR(): number {
    return Math.min(0.9, this.totalArmor / (this.totalArmor + 5000 + (100 * this.level)));
  }

  get avgDR(): string {
    return (100 * this.DR).toFixed(2);
  }

  get EHP(): number {
    const dodge = Math.min(this.dodgeChance / 100, 0.99); // Cap at 99% dodge
    const dr = Math.min(this.DR, 0.9); // Already capped in DR formula

    const effectiveHitRate = (1 - dodge) * (1 - dr);
    return Math.round(this.maxHp / Math.max(effectiveHitRate, 0.01)); // avoid divide-by-0
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
  currentMana: number;
  skillPoints: number = 0;
  skills: Skill[] = [
    new Skill("Healing Touch", "healing_touch", 1, "Channel your inner energy to mend wounds, restoring health upon casting.", false),
    new Skill("Smite", "smite", 1, "Call upon divine power to unleash a righteous strike, dealing damage to your foes.", false),
    new Skill("Masterful Strikes", "masterful_strikes", 1, "Hone your combat skills to deliver precise and devastating blows, increasing damage with all weapons.", false),
    new Skill("Iron Defense", "iron_defense", 1, "Forge an unyielding barrier around yourself, bolstering armor and reducing incoming damage.", false),
    new Skill("Keen Eye", "keen_eye", 1, "Sharpen your senses to spot weaknesses, increasing your chance to land critical hits.", false),
    new Skill("Mana Surge", "mana_surge", 1, "Tap into the reservoir of arcane energy within, replenishing mana reserves upon casting.", false),
    new Skill("Evasive Maneuvers", "evasive_maneuvers", 1, "Dance gracefully on the battlefield, evading enemy attacks with nimble footwork and quick reflexes.", false)
  ];
  bestiaryBonuses: Partial<Record<MonsterBonus["stat"], { flat: number; percent: number }>> = {};
  relicBonuses:    Partial<Record<MonsterBonus["stat"], { flat: number; percent: number }>> = {};

  get xpToNextLevel() {
    return Math.round(10 * Math.pow(this.level, 1.4));
  }

  get maxMana(): number {
    return Math.round((this.level * 10) + (this.spirit * 5));
  }

  get totalArmor(): number {
    const base = this.baseArmor + this.inventorySet?.totalArmor;
    const { flat, percent } = this.getBonus("Armor");
    return Math.round(base * (1 + percent) + flat);
  }

  get strength(): number {
    const base = this.level * 5 + this.inventorySet?.strength;
    const { flat, percent } = this.getBonus("Strength");
    return Math.round(base * (1 + percent) + flat);
  }

  get stamina(): number {
    const base = this.level * 5 + this.inventorySet?.stamina;
    const { flat, percent } = this.getBonus("Stamina");
    return Math.round(base * (1 + percent) + flat);
  }

  get agility(): number {
    const base = this.level * 5 + this.inventorySet?.agility;
    const { flat, percent } = this.getBonus("Agility");
    return Math.round(base * (1 + percent) + flat);
  }

  get intellect(): number {
    const base = this.level * 5 + this.inventorySet?.intellect;
    const { flat, percent } = this.getBonus("Intellect");
    return Math.round(base * (1 + percent) + flat);
  }

  get spirit(): number {
    const base = this.level * 5 + this.inventorySet?.spirit;
    const { flat, percent } = this.getBonus("Spirit");
    return Math.round(base * (1 + percent) + flat);
  }

  override get critChance(): number {
    const baseCritScore = (this.agility + this.intellect)/2;
    const { flat, percent } = this.getBonus("Crit");

    const boostedScore = baseCritScore * (1 + percent) + flat;
    const scaling = 1000 + (this.level * 40);

    return 100 * (boostedScore / (boostedScore + scaling));
  }

  override get dodgeChance(): number {
    const baseDodgeScore = this.agility;
    const { flat, percent } = this.getBonus("Dodge");

    const boostedScore = baseDodgeScore * (1 + percent) + flat;
    const scaling = 1000 + (this.level * 40);

    return 100 * (boostedScore / (boostedScore + scaling));
  }

  constructor(inventorySet: InventorySet, level: number = 1) {
    super(level);
    this.inventorySet = inventorySet;
    this.currentHp = this.maxHp;
    this.currentMana = this.maxMana;
  }

  applyBonuses(bonuses: typeof this.bestiaryBonuses) {
    this.bestiaryBonuses = bonuses;
  }

  getBonus(stat: MonsterBonus["stat"]) {
    // 1) bestiary
    const b = this.bestiaryBonuses?.[stat] ?? { flat: 0, percent: 0 };
    // 2) relics
    const r = this.relicBonuses?.[stat]    ?? { flat: 0, percent: 0 };
    return {
      flat:    b.flat    + r.flat,
      percent: b.percent + r.percent
    };
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
      this.skillPoints++;
      this.heal();
      this.healMana();
    }
  }

  healMana() {
    this.currentMana = this.maxMana;
  }
}

export class Monster extends Entity {
  name = "Monster";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss";
  MAX_MONSTER_IMAGES = 6;
  image: string = `monster_` + (this.getRandomInt(this.MAX_MONSTER_IMAGES) + 1);
  agility: number;
  intellect: number;
  spirit: number;
  stamina: number;
  strength: number;

  private static prefixes = [
    "Rotting", "Savage", "Elder", "Twisted", "Feral", "Burning", "Cursed",
    "Frostbitten", "Venomous", "Ancient", "Dark", "Vile", "Mad", "Stonebound", "Shadow"
  ];

  private static species = [
    "Demon Warg", "Demon Spider", "Demon Lich", "Demon Bandit", "Demon Wolf", "Demon Golem", "Demon Beast", "Demon Wraith", "Demon Bat", "Demon Cultist", "Demon Serpent", "Demon Ghoul"
  ];

  get totalArmor(): number {
    return this.baseArmor;
  }

  get color(): string {
    switch (this.rarity) {
      case "Uncommon": return "#4fc75d";
      case "Rare": return "#515fed";
      case "Epic": return "#8821b4";
      case "Legendary": return "#b98523";
      case "Boss": return "#cc2c2c";
      case "Common":
      default: return "#dedee8";
    }
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
    return this.level * rarityScale * 5;
  }

  getRarityScalar(rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss"): number {
    switch (rarity) {
      case "Common": return 1.0;
      case "Uncommon": return 1.2;
      case "Rare": return 1.5;
      case "Epic": return 2.0;
      case "Legendary": return 3.0;
      case "Boss": return 4.0;
      default: return 1.0;
    }
  }

  constructor(level: number, rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss", totalKills = 0, lastFightHpRatio?: number) {
    super(level);
    this.rarity = rarity;

    const base = level * this.getRarityScalar(rarity);

    // Ratio: monster damage percent / player damage percent
    const fightMultiplier  = Math.min(3, lastFightHpRatio ?? 1);  // Max 3x scaling, default 1x
    const scalingMultiplier = 1 + Math.pow(totalKills / 300, 1.01); // exponential scale

    const difficultyMultiplier = fightMultiplier * scalingMultiplier;

    this.strength  = Math.round(base * difficultyMultiplier);
    this.agility   = Math.round(base * difficultyMultiplier);
    this.intellect = Math.round(base * difficultyMultiplier);
    this.spirit    = Math.round(base * difficultyMultiplier);
    this.stamina   = Math.round(base * 10 * difficultyMultiplier); // affects HP

    this.name = this.generateName();
    this.image = `monster_` + (this.getRandomInt(this.MAX_MONSTER_IMAGES) + 1);
    this.currentHp = this.maxHp;
  }

  // generates a number from 0 to max
  getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  private generateName(): string {
    const prefix = Monster.prefixes[this.getRandomInt(Monster.prefixes.length)];
    const species = Monster.species[this.getRandomInt(Monster.species.length)];

    // Guaranteed affix from the trackable list
    const suffixes = Object.keys(MONSTER_AFFIX_BONUSES);
    const suffix = suffixes[this.getRandomInt(suffixes.length)];

    return `${prefix} ${species} ${suffix}`;
  }
}

export interface MonsterBonus {
  stat: "Strength" | "Agility" | "Intellect" | "Spirit" | "Stamina" | "Crit" | "Dodge" | "Armor";
  flat: number;
  percent: number;
}

export const MONSTER_AFFIX_BONUSES: Record<string, MonsterBonus> = {
  "the Brutal":      { stat: "Strength", flat: 1, percent: 0.01 },
  "the Titan":       { stat: "Strength", flat: 2, percent: 0.02 },

  "of the Nimble":      { stat: "Agility", flat: 1, percent: 0.01 },
  "of the Swiftblade":   { stat: "Agility", flat: 2, percent: 0.02 },

  "of Endurance":    { stat: "Stamina", flat: 1, percent: 0.01 },
  "the Unyielding":  { stat: "Stamina", flat: 2, percent: 0.02 },

  "of the Mind":     { stat: "Intellect", flat: 1, percent: 0.01 },
  "of Insight":      { stat: "Intellect", flat: 2, percent: 0.02 },

  "of Light":        { stat: "Spirit", flat: 1, percent: 0.01 },
  "of the Seer":     { stat: "Spirit", flat: 2, percent: 0.02 },

  "the Cruel":       { stat: "Crit", flat: 1, percent: 0.01 },
  "of the Fang":     { stat: "Crit", flat: 2, percent: 0.02 },

  "of Shadows":      { stat: "Dodge", flat: 1, percent: 0.01 },
  "of Evasion":      { stat: "Dodge", flat: 2, percent: 0.02 },

  "of Stone":        { stat: "Armor", flat: 3, percent: 0.01 },
  "of Fortitude":    { stat: "Armor", flat: 6, percent: 0.02 }
};
