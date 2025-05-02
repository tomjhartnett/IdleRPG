import { Component, OnInit } from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";
import {CombatManagerService} from "../../services/combat-manager.service";

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})
export class PlayerStatsComponent implements OnInit {

  get currentHp(): number {
    return this.playerManagementService.player.currentHp;
  }
  get maxHp(): number {
    return this.playerManagementService.player.maxHp;
  }
  get currentMana(): number {
    return this.playerManagementService.player.currentMana;
  }
  get maxMana(): number {
    return this.playerManagementService.player.maxMana;
  }
  get strength(): number {
    return this.playerManagementService.player.strength;
  }
  get stamina(): number {
    return this.playerManagementService.player.stamina;
  }
  get agility(): number {
    return this.playerManagementService.player.agility;
  }
  get intellect(): number {
    return this.playerManagementService.player.intellect;
  }
  get spirit(): number {
    return this.playerManagementService.player.spirit;
  }
  get armor(): number {
    return this.playerManagementService.player.totalArmor;
  }
  get critChance(): string {
    return this.playerManagementService.player.critChance.toFixed(2);
  }
  get dodgeChance(): string {
    return this.playerManagementService.player.dodgeChance.toFixed(2);
  }
  get avgDR(): string {
    return this.playerManagementService.player.avgDR;
  }
  get attacks(): { minDmg: number, maxDmg: number, attSpd: number }[] {
    return this.playerManagementService.attacks;
  }
  get level(): number {
    return this.playerManagementService.player.level;
  }
  get currentXP(): number {
    return this.playerManagementService.player.xp;
  }
  get xpToNextLevel(): number {
    return this.playerManagementService.player.xpToNextLevel;
  }
  get canUpgradeWeapon(): boolean {
    return this.playerManagementService.canUpgradeWeapon;
  }
  get canUndoEquip(): boolean {
    return !!this.playerManagementService.lastReplacedItem
  }
  get EHP(): string {
    return this.playerManagementService.player.EHP.toFixed(0);
  }
  get gold(): string {
    return this.playerManagementService.gold.toFixed(0);
  }

  constructor(
    private playerManagementService: PlayerManagementService,
    private combatManagerService: CombatManagerService
  ) { }

  ngOnInit(): void {
  }

  upgradeWeapon() {
    if (confirm("Upgrading your weapon tier will destroy the rest of your equipment and reset your character to level 1. This can be useful if your fights are taking a long time because you can't get a good weapon drop. Are you sure you want to continue?")) {
      this.playerManagementService.upgradeWeapon();
      this.combatManagerService.resetCombatState();
      this.combatManagerService.generateMonster();
    }
  }

  undoEquip() {
    if(confirm("Are you sure you want to revert your last equip? You can always click this again to get your original item back.")) {
      this.playerManagementService.undoEquip();
    }
  }
}
