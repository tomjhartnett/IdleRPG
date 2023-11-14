import { Injectable } from '@angular/core';
import {PlayerManagementService} from "./player-management.service";
import {ItemGeneratorService} from "./item-generator.service";
import {Entity, Monster, Player} from "../models/entity.model";
import {Item, Weapon} from "../models/item.model";

@Injectable({
  providedIn: 'root'
})
export class CombatManagerService {

  _currentMonster: Monster = new Monster(1, "Common");
  _currentMonsterWeapon: Weapon = this.itemGeneratorService.generateItem(1, "Common", "Main Hand") as Weapon;
  recentAttacks: { damage: number, source: 'player' | 'monster' }[] = [];
  _rewardItem: Item | undefined;
  combatEnded = false;

  get combatActive(): boolean {
    return !this.combatEnded;
  }

  get playerAttacks(): {minDmg: number, maxDmg: number, attSpd: number}[] {
    return this.playerManagementService.attacks;
  }

  get monsterAttacks(): {minDmg: number, maxDmg: number, attSpd: number}[] {
    return [{minDmg: this._currentMonsterWeapon.minDamage + this._currentMonster.flatDmgUp, maxDmg: this._currentMonsterWeapon.maxDamage + this._currentMonster.flatDmgUp, attSpd: this._currentMonsterWeapon.attackSpeed}]
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService,
    private playerManagementService: PlayerManagementService
  ) {
    this.combatStart();
  }

  // does all attacks from both players at combat start
  combatStart() {
    this.combatEnded = false;
    console.log('starting combat with ', this._currentMonster.name);
    for(let attack of this.playerAttacks) {
      this.doAttack(attack, this._currentMonster);
    }
    for(let attack of this.monsterAttacks) {
      this.doAttack(attack, this.playerManagementService.player);
    }
  }

  // after an attack, set a timeout to attack again, and cancel if the enemy is dead
  doAttack(attack: {minDmg: number, maxDmg: number, attSpd: number}, entity: Entity) {
    if (this._currentMonster.currentHp > 0 && this.playerManagementService.player.currentHp > 0) {
      const dmg = this.calculateAttack(attack);
      entity.takeDamage(dmg);
      setTimeout(() => { this.doAttack(attack, entity) }, attack.attSpd * 1000);
      this.recentAttacks.push({damage: dmg, source: entity instanceof Player ? 'player' : 'monster'});
      console.log('dealing', dmg, 'damage to', entity.name);
    } else {
      if(!this.combatEnded) {
        this.playerManagementService.player.addExp(this._currentMonster.xpAwarded);
        this._rewardItem = this.itemGeneratorService.generateItem(this.playerManagementService.player.level);
        this.combatEnded = true;
      }
    }
  }

  calculateAttack(attack: {minDmg: number, maxDmg: number, attSpd: number}): number {
    return Math.floor(Math.random() * (attack.maxDmg - attack.minDmg)) + attack.minDmg + 1;
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
