import { Injectable } from '@angular/core';
import {PlayerManagementService} from "./player-management.service";
import {ItemGeneratorService} from "./item-generator.service";
import {Entity, Monster, Player} from "../models/entity.model";
import {Item, Weapon} from "../models/item.model";
import {ItemFilterService} from "./item-filter.service";

@Injectable({
  providedIn: 'root'
})
export class CombatManagerService {

  _currentMonster: Monster = new Monster(1, "Common");
  _currentMonsterWeapon: Weapon = this.itemGeneratorService.generateItem(1, "Common", "Main Hand") as Weapon;
  recentAttacks: { damage: number, source: 'player' | 'monster' }[] = [];
  _rewardItem: Item | undefined;
  autoEquipReward: Item | undefined;
  currentTimeout: any;
  combatEnded = false;

  get combatActive(): boolean {
    return !this.combatEnded;
  }

  get playerAttacks(): {minDmg: number, maxDmg: number, attSpd: number}[] {
    return this.playerManagementService.attacks;
  }

  get monsterAttacks(): {minDmg: number, maxDmg: number, attSpd: number}[] {
    return [{minDmg: Math.floor(this._currentMonsterWeapon.minDamage * (1 + (this._currentMonster.percentDmgUp/100))), maxDmg: Math.ceil(this._currentMonsterWeapon.maxDamage * (1 + (this._currentMonster.percentDmgUp/100))), attSpd: this._currentMonsterWeapon.attackSpeed}]
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService,
    private playerManagementService: PlayerManagementService,
    private itemFilterService: ItemFilterService
  ) {
    this.combatStart();
  }

  // does all attacks from both players at combat start
  combatStart() {
    this.combatEnded = false;
    for(let attack of this.playerAttacks) {
      this.doAttack(attack, this.playerManagementService.player.critChance, this._currentMonster);
    }
    for(let attack of this.monsterAttacks) {
      this.doAttack(attack, this._currentMonster.critChance, this.playerManagementService.player);
    }
  }

  // after an attack, set a timeout to attack again, and cancel if the enemy is dead
  doAttack(attack: {minDmg: number, maxDmg: number, attSpd: number}, critChance: number, entity: Entity) {
    if (this._currentMonster.currentHp > 0 && this.playerManagementService.player.currentHp > 0) {
      let dmg = this.calculateAttack(attack, critChance);
      dmg = entity.takeDamage(dmg);
      if (this._currentMonster.currentHp > 0 && this.playerManagementService.player.currentHp > 0) {
        setTimeout(() => {
          this.doAttack(attack, critChance, entity)
        }, attack.attSpd * 1000);
      } else {
        this.endCombat();
      }
      this.recentAttacks.push({damage: dmg, source: entity instanceof Player ? 'player' : 'monster'});
    } else {
      if(!this.combatEnded) {
        this.endCombat();
      }
    }
  }

  endCombat() {
    if(this.playerManagementService.player.currentHp > 0) {
      this.playerManagementService.player.addExp(this._currentMonster.xpAwarded);
      this.playerManagementService.player.heal();
      let slot;
      if (this.playerManagementService.player.inventorySet.slots.get('Main Hand')!.level * 3 < this.playerManagementService.player.level) {
        slot = 'Main Hand';
      }
      const avoidWeapon = this.playerManagementService.player.inventorySet.slots.get('Main Hand')!.level >= this.playerManagementService.player.level;
      this._rewardItem = this.itemGeneratorService.generateItem(this.playerManagementService.player.level, "Random", slot, avoidWeapon);
      if(this.itemFilterService.isFiltering) {
        this.itemFilterService.scoreItem(this._rewardItem);
        const oldItem = this.playerManagementService.player.inventorySet.slots.get(this._rewardItem.slot);
        if(oldItem) {
          this.itemFilterService.scoreItem(oldItem);
          if (oldItem.lastUpdatedWeight > this._rewardItem.lastUpdatedWeight) {
            this.generateMonster();
          }
        }
        if (this.itemFilterService.isAutoEquiping && this._rewardItem.slot != "Main Hand" && (!oldItem || oldItem.lastUpdatedWeight <= this._rewardItem.lastUpdatedWeight)) {
          this.autoEquipReward = this._rewardItem;
          if(!this.currentTimeout) {
            this.currentTimeout = setTimeout(() => {
              if (this.combatEnded && this._rewardItem && this._rewardItem === this.autoEquipReward) {
                this.playerManagementService.player.inventorySet.addItem(this._rewardItem);
                this.currentTimeout = undefined;
                this.generateMonster();
              }
            }, 1000);
          }
        }
      }
    }
    this.combatEnded = true;
  }

  calculateAttack(attack: {minDmg: number, maxDmg: number, attSpd: number}, critChance: number): number {
    let critDmgBonus = 1;
    if(Math.floor(Math.random() * 100) + 1 > critChance) {
      critDmgBonus = 2;
    }
    return ((Math.floor(Math.random() * (attack.maxDmg - attack.minDmg)) + attack.minDmg + 1) * critDmgBonus);
  }

  generateMonster(level: number = this.playerManagementService.player.level, rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss") {
    this.playerManagementService.player.currentHp = this.playerManagementService.player.maxHp;
    if(!rarity) {
      rarity = this.getRarity();
    }
    this.recentAttacks = [];
    this._currentMonster = new Monster(level * this.generateOffset(), rarity);
    this._currentMonsterWeapon = this.itemGeneratorService.generateItem(this._currentMonster.level, "Random", "Main Hand") as Weapon;
    // automatically start combat after an enemy is spawned
    this.combatStart();
  }

  //generates a random +- 20% for level
  generateOffset(): number {
    return (1 + ((Math.floor(Math.random() * 40) - 19)/100));
  }

  getRarity(): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss" {
    const rand = Math.floor(Math.random() * 100) + 1;
    if(rand > 99) {
      return "Boss";
    } else if(rand > 97) {
      return "Legendary";
    } else if(rand > 90) {
      return "Epic";
    } else if(rand > 75) {
      return "Rare";
    } else if(rand > 50) {
      return "Uncommon"
    } else {
      return "Common"
    }
  }
}
