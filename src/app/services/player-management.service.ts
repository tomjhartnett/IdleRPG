import { Injectable } from '@angular/core';
import {Item, Weapon} from "../models/item.model";
import {MONSTER_AFFIX_BONUSES, MonsterBonus, Player} from "../models/entity.model";
import {InventorySet} from "../models/inventory-set.model";
import {ItemGeneratorService} from "./item-generator.service";
import {Skill} from "../models/skill.model";

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

  player: Player;

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
    private itemGeneratorService: ItemGeneratorService
  ) {
    let items: Item[] = [];
    items.push(itemGeneratorService.generateItem(3, "Epic", "Main Hand"));
    this.player = new Player(new InventorySet(items));
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
      this.player = new Player(new InventorySet([this.itemGeneratorService.upgradeWeapon(oldWeapon as Weapon, newRarity)]));
    }
  }

  registerMonsterKill(monsterName: string, monsterLevel: number): void {
    this.gold++;

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

  undoEquip() {
    if(this.playerSet.lastEquipedItem) {
      this.playerSet.addItem(this.playerSet.lastEquipedItem);
    }
  }
}
