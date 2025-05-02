import {Injectable} from '@angular/core';
import {PlayerManagementService} from "./player-management.service";
import {ItemGeneratorService} from "./item-generator.service";
import {Entity, Monster, Player} from "../models/entity.model";
import {Item, Weapon} from "../models/item.model";
import {ItemFilterService} from "./item-filter.service";

@Injectable({
  providedIn: 'root'
})
export class CombatManagerService {
  is_testing_mode = true;

  isPaused = false;
  _currentMonster: Monster = new Monster(1, "Common");
  _currentMonsterWeapon: Weapon = this.itemGeneratorService.generateItem(1, "Common", "Main Hand") as Weapon;
  recentAttacks: { damage: number, source: 'player' | 'monster', timestamp: number, wasCrit: boolean }[] = [];
  _rewardItem: Item | undefined;
  autoEquipRewardName: string | undefined;
  currentTimeout: any;
  combatEnded = false;
  currentCombat: number | undefined = undefined;
  private timeouts: any[] = [];
  private monsterGenerated = false;
  lastMonsterHpRatio: number = 1;
  totalKills = 0;
  defaultTick = !this.is_testing_mode ? 1000 : 1;

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
    if(this.is_testing_mode) {
      this.itemFilterService.setFiltering(true);
      this.itemFilterService.setAutoEquip(true);
    }
    this.combatStart();
  }

  clearAllTimeouts() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = undefined;
    }
  }

  setCombatTimeout(callback: () => void, delay: number): void {
    const timeout = setTimeout(callback, delay);
    this.timeouts.push(timeout);
  }

  combatStart() {
    this.monsterGenerated = false;
    this.clearAllTimeouts();
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];

    const player = this.playerManagementService.player;
    player.heal();

    const combatId = Date.now();
    this.combatEnded = false;
    this.currentCombat = combatId;

    for (let attack of this.monsterAttacks) {
      this.setCombatTimeout(() => {
        this.doAttack(attack, this._currentMonster.critChance, player, combatId);
      }, attack.attSpd * this.defaultTick);
    }

    for (let attack of this.playerAttacks) {
      this.setCombatTimeout(() => {
        this.doAttack(attack, player.critChance, this._currentMonster, combatId);
      }, attack.attSpd * this.defaultTick);
    }
  }


  doAttack(
    attack: {minDmg: number, maxDmg: number, attSpd: number},
    critChance: number,
    target: Entity,
    combatId: number
  ) {
    if (this.combatEnded || this.currentCombat !== combatId) return;

    const player = this.playerManagementService.player;

    if (this._currentMonster.currentHp <= 0 || player.currentHp <= 0) {
      this.endCombat();
      return;
    }

    const { damage, wasCrit } = this.calculateAttack(attack, critChance);
    const finalDmg = target.takeDamage(damage);

    this.recentAttacks.push({
      damage: finalDmg,
      source: target instanceof Player ? 'player' : 'monster',
      wasCrit,
      timestamp: Date.now()
    });

    if (target.currentHp > 0 && player.currentHp > 0) {
      this.setCombatTimeout(() => {
        this.doAttack(attack, critChance, target, combatId);
      }, attack.attSpd * this.defaultTick);
    } else {
      this.endCombat();
    }
  }


  endCombat() {
    if (this.combatEnded) {
      console.log("combat already ended, skipping");
      return;
    }

    const monsterHpLost = this._currentMonster.maxHp - this._currentMonster.currentHp;
    const playerHpLost = this.playerManagementService.player.maxHp - this.playerManagementService.player.currentHp;

    const monsterDmgPercent = monsterHpLost / this._currentMonster.maxHp;
    const playerDmgPercent = playerHpLost / this.playerManagementService.player.maxHp;

    this.lastMonsterHpRatio = (this.lastMonsterHpRatio + (monsterDmgPercent / Math.max(playerDmgPercent, 0.01))) / 2; // prevent divide-by-0
    console.log('scaling', this.lastMonsterHpRatio)

    this.combatEnded = true;
    this.currentCombat = undefined;
    this.clearAllTimeouts();
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];

    const player = this.playerManagementService.player;

    if (player.currentHp <= 0) {
      if (!this.is_testing_mode)
        return;
      else {
        this.playerManagementService.player.heal();
        this.playerManagementService.player.healMana();
        if(this.playerManagementService.canUpgradeWeapon) {
          this.playerManagementService.upgradeWeapon();
          this.generateMonster();
        } else {
          this.generateMonster();
        }
      }
    }

    this.totalKills++;
    this.playerManagementService.registerMonsterKill(
      this._currentMonster.name,
      this._currentMonster.level
    );

    player.addExp(Math.round(this._currentMonster.xpAwarded * (2 - Math.min(1, this.lastMonsterHpRatio))));

    const mainHand = player.inventorySet.slots.get('Main Hand')!;
    const slot = mainHand.level * 3 < player.level ? 'Main Hand' : undefined;
    const avoidWeapon = mainHand.level >= player.level;
    const minDropRarity = this.itemGeneratorService.getMinDropRarity(this._currentMonster.rarity);

    this._rewardItem = this.itemGeneratorService.generateItem(Math.max(this._currentMonster.level, player.level), "Random", slot, avoidWeapon, minDropRarity); // use as min rarity);

    if (!this.isPaused && this.itemFilterService.isFiltering) {
      this.itemFilterService.scoreItem(this._rewardItem);
      const oldItem = player.inventorySet.slots.get(this._rewardItem.slot);
      if (oldItem) {
        this.itemFilterService.scoreItem(oldItem);
      }

      const isMainHand = this._rewardItem.slot === "Main Hand";
      const autoEquipEnabled = this.itemFilterService.isAutoEquiping;
      const isUpgrade = !oldItem || oldItem.lastUpdatedWeight <= this._rewardItem.lastUpdatedWeight;

      if ((isMainHand && isUpgrade) || !autoEquipEnabled) {
        // Pause — manual review required
        console.log("Combat paused: manual review required for", this._rewardItem.name);
      } else if (isUpgrade) {
        // Auto-equip & continue
        this.autoEquipRewardName = this._rewardItem.name;
        this.currentTimeout = setTimeout(() => {
          if (this._rewardItem?.name === this.autoEquipRewardName) {
            player.inventorySet.addItem(this._rewardItem!);
          }
          if(this.playerManagementService.canUpgradeWeapon && this.is_testing_mode) {
            this.playerManagementService.upgradeWeapon();
            this.generateMonster();
          } else {
            this.generateMonster();
          }
        }, this.defaultTick);
      } else {
        // Item is worse — skip and continue automatically
        this.currentTimeout = setTimeout(() => {
          if(this.playerManagementService.canUpgradeWeapon && this.is_testing_mode) {
            this.playerManagementService.upgradeWeapon();
            this.generateMonster();
          } else {
            this.generateMonster();
          }
        }, this.defaultTick);
      }
    }
  }

  resetCombatState() {
    this.recentAttacks = [];
    this._rewardItem = undefined;
    this.autoEquipRewardName = undefined;
    this.combatEnded = true;
    this.currentCombat = undefined;
    this.monsterGenerated = false;

    // Ensure current monster is "dead" so generateMonster triggers
    this._currentMonster.currentHp = 0;

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = undefined;
    }

    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  calculateAttack(attack: {minDmg: number, maxDmg: number, attSpd: number}, critChance: number): { damage: number; wasCrit: boolean } {
    let critDmgBonus = 1;
    let wasCrit = false;

    if (Math.floor(Math.random() * 100) + 1 <= critChance) {
      critDmgBonus = 2;
      wasCrit = true;
    }

    const base = Math.floor(Math.random() * (attack.maxDmg - attack.minDmg)) + attack.minDmg + 1;
    return {
      damage: base * critDmgBonus,
      wasCrit
    };
  }

  generateMonster(level: number = this.playerManagementService.player.level, rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Boss") {
    const player = this.playerManagementService.player;
    if ((!player || player.currentHp <= 0) && !this.combatEnded) {
      console.log("can't generate monster: player dead or invalid");
      return;
    }

    this.monsterGenerated = true;

    this.currentTimeout = undefined;

    if (!rarity) {
      rarity = this.getRarity();
    }

    this._currentMonster = new Monster(level * this.generateOffset(), rarity, this.totalKills, this.lastMonsterHpRatio);
    this._currentMonsterWeapon = this.itemGeneratorService.generateItem(this._currentMonster.level, "Random", "Main Hand") as Weapon;

    this.recentAttacks = [];
    this.playerManagementService.player.currentHp = this.playerManagementService.player.maxHp;

    // Start combat
    setTimeout(() => {
      this.monsterGenerated = false; // reset after short delay
      this.combatStart();
    }, 50); // slight delay helps decouple potential racing logic
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
