import { Injectable } from '@angular/core';
import {Item, Weapon} from "../models/item.model";
import {MONSTER_AFFIX_BONUSES, MonsterBonus, Player} from "../models/entity.model";
import {InventorySet} from "../models/inventory-set.model";
import {ItemGeneratorService} from "./item-generator.service";
import {Skill} from "../models/skill.model";
import {Subject, take} from "rxjs";
import {Relic, RelicManagerService} from "./relic-manager.service";

@Injectable({
  providedIn: 'root'
})
export class PlayerManagementService {
  showTooltip = false;
  _hoverItem!: Item;
  showSkillTooltip = false;
  _hoverSkill!: Skill;
  bestiary: Record<string, number> = {};  // key = suffix, value = count
  gold = 0;
  smithingUnlocked = false;
  relicsUnlocked   = false;
  prestigeUnlocked   = false;

  player: Player;

  private unlockSubject = new Subject<'smithing'|'relics'|'prestige'>();
  public  unlock$      = this.unlockSubject.asObservable();

  get lastReplacedItem(): Item | undefined {
    return this.playerSet.lastEquipedItem;
  }

  get playerSet() {
    return this.player.inventorySet;
  }

  get currentItems(): Map<string, Item> {
    return this.playerSet.slots;
  }

  get attacks(): { minDmg: number, maxDmg: number, attSpd: number }[] {
    return this.playerSet.attacks.map(att => {
      return {
        minDmg: Math.floor(att.minDmg * (1 + (this.player.percentDmgUp/100))), maxDmg: Math.ceil(att.maxDmg * (1 + (this.player.percentDmgUp/100))), attSpd: att.attSpd
      }
    });
  }

  get canUpgradeWeapon(): boolean {
    const weapon = this.player.inventorySet.slots.get('Main Hand');
    return !!weapon && weapon.rarity != 'Mythic' && weapon.level <= this.player.level * 2;
  }

  get bestiaryKillCount(): number {
    return Object.values(this.bestiary).reduce((sum, count) => sum + count, 0);
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService,
    private relicService: RelicManagerService
  ) {
    let items: Item[] = [];
    items.push(itemGeneratorService.generateItem(3, "Epic", "Main Hand"));
    this.player = new Player(new InventorySet(items));

    // Whenever you change equip or a relic ascends, recompute relicBonuses
    this.relicService.getEquipped()
      .subscribe(() => this.updatePlayerRelicBonuses());

    this.relicService.ascended$
      .subscribe(() => this.updatePlayerRelicBonuses());
  }

  /** Call this anytime player.level might have increased */
  public checkUnlocks(): void {
    const lvl = this.player.level;

    if (!this.smithingUnlocked && lvl >= 5) {
      this.smithingUnlocked = true;
      this.unlockSubject.next('smithing');
    }
    if (!this.relicsUnlocked && lvl >= 10) {
      this.relicsUnlocked = true;
      this.unlockSubject.next('relics');
    }
    if (!this.prestigeUnlocked && lvl >= 50) {
      this.prestigeUnlocked = true;
      this.unlockSubject.next('prestige');
    }
  }

  addSkillPoint() {
    this.player.skillPoints++;
  }

  removeSkillPoint() {
    this.player.skillPoints--;
  }

  upgradeWeapon() {
    const oldWeapon = this.playerSet.slots.get('Main Hand');
    if(oldWeapon) {
      const oldRarity = oldWeapon.rarity;
      let newRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" = "Uncommon";
      if(oldRarity == "Legendary") {
        newRarity = "Mythic";
      } else if(oldRarity == "Epic") {
        newRarity = "Legendary";
      } else if(oldRarity == "Rare") {
        newRarity = "Epic";
      } else if(oldRarity == "Uncommon") {
        newRarity = "Rare";
      }

      // compute how many bonus levels to start at:
      const phoenixLevels = this.relicService.totalRebirthBonus;
      const bonusRebirthLevels = Math.floor(phoenixLevels / 5);
      const startLevel = 1 + bonusRebirthLevels;

      this.player = new Player(new InventorySet([this.itemGeneratorService.upgradeWeapon(oldWeapon as Weapon, newRarity)]), startLevel);
    }
  }

  registerMonsterKill(monsterName: string, monsterLevel: number): void {
    this.addGold(1);

    if (monsterLevel <= this.bestiaryKillCount) return;

    const suffixMatch = Object.keys(MONSTER_AFFIX_BONUSES).find(suffix =>
      monsterName.includes(suffix)
    );

    if (!suffixMatch) return;

    if (!this.bestiary[suffixMatch]) {
      this.bestiary[suffixMatch] = 0;
    }

    this.bestiary[suffixMatch]++;
    this.player.applyBonuses(this.getAllBestiaryBonuses());
  }

  addGold(amount?: number) {
    const bonusPct = this.relicService.totalGoldBonus; // e.g. 0.0005 * level
    const finalAmt = Math.round((amount ?? 1) * (1 + bonusPct));
    this.gold += finalAmt;
  }

  getBonusForStat(stat: MonsterBonus["stat"]): { flat: number; percent: number } {
    let flat = 0;
    let percent = 0;

    for (const suffix in this.bestiary) {
      const count = this.bestiary[suffix];
      const bonus = MONSTER_AFFIX_BONUSES[suffix];
      if (bonus?.stat === stat) {
        flat += bonus.flat * count;
        percent += bonus.percent * count;
      }
    }

    return { flat, percent };
  }

  getAllBestiaryBonuses(): Partial<Record<MonsterBonus["stat"], { flat: number; percent: number }>> {
    const bonuses: Partial<Record<MonsterBonus["stat"], { flat: number; percent: number }>> = {};

    for (const stat of ["Strength", "Stamina", "Agility", "Intellect", "Spirit", "Armor", "Crit", "Dodge"] as const) {
      bonuses[stat] = this.getBonusForStat(stat);
    }

    return bonuses;
  }

  private updatePlayerRelicBonuses() {
    const player = this.player;
    // reset
    player.relicBonuses = {};

    // for each ascended relic, accumulate its effect
    this.relicService.getRelics().pipe(take(1)).subscribe(all => {
      const equipId = this.relicService.getEquippedSync();
      const actives = all.filter(r => r.ascended || r.id === equipId);

      actives.forEach(r => this.applyRelicBonus(player, r));
    });
  }

  /** Map each relic → stat or other bonus */
  private applyRelicBonus(player: Player, r: Relic) {
    const lvl = r.level;

    switch (r.id) {
      case 'r1': // Totem of Precision: +0.10% Crit Chance per level
        this.accumulate(player.relicBonuses, 'Crit',  0, 0.001 * lvl);
        break;

      case 'r2': // Idol of Fortitude: +0.10% Armor per level
        this.accumulate(player.relicBonuses, 'Armor', 0, 0.001 * lvl);
        break;

      case 'r3': // Sunstone Relic: +0.5 Strength per level
        this.accumulate(player.relicBonuses, 'Strength', 0.5 * lvl, 0);
        break;

      case 'r4': // Moonlace Charm: +0.10% Dodge per level
        this.accumulate(player.relicBonuses, 'Dodge', 0, 0.001 * lvl);
        break;

      case 'r12': // Vial of Vitality: +0.50% Max HP per level → translates to Stamina bonus
        this.accumulate(player.relicBonuses, 'Stamina', 0, 0.005 * lvl);
        break;

      case 'r13': // Shard of Shielding: +0.10% DR per level → treat as Armor bonus
        this.accumulate(player.relicBonuses, 'Armor', 0, 0.001 * lvl);
        break;

      case 'r14': // Seal of Essence: +0.5 Spirit per level
        this.accumulate(player.relicBonuses, 'Spirit', 0.5 * lvl, 0);
        break;

      case 'r15': // Banner of Titans: +0.10% Stamina per level
        this.accumulate(player.relicBonuses, 'Stamina', 0, 0.001 * lvl);
        break;

      case 'r20': // Keystone of Mastery: +0.10% DPS per level → treat as Strength percent
        this.accumulate(player.relicBonuses, 'Strength', 0, 0.001 * lvl);
        break;

      // Non‐stat relics (r5, r8, r9, r10, r11, r16) you can handle elsewhere,
      // e.g. store goldBonus, expBonus, startLevelBonus, critDmgBonus, atkSpeedBonus, dropRateBonus...
    }
  }

    /** Helper to accumulate into a bonuses map */
  private accumulate(
    map: Partial<Record<string, {flat:number,percent:number}>>,
    key: string,
    flat: number,
    percent: number
  ) {
    const prev = map[key] || {flat:0,percent:0};
    map[key] = {
      flat:    prev.flat    + flat,
      percent: prev.percent + percent
    };
  }

  undoEquip() {
    if(this.playerSet.lastEquipedItem) {
      this.playerSet.addItem(this.playerSet.lastEquipedItem);
    }
  }
}
