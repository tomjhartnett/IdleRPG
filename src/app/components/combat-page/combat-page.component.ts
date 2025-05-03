import { Component, OnInit } from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";
import {CombatManagerService} from "../../services/combat-manager.service";
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-combat-page',
  templateUrl: './combat-page.component.html',
  styleUrls: ['./combat-page.component.css']
})
export class CombatPageComponent implements OnInit {
  showTooltip = false;

  get combatActive(): boolean {
    return this.combatManagerService.combatActive;
  }
  get showPercents(): boolean {
    return this.combatManagerService.showPercents;
  }
  get playerName(): string {
    return this.playerManagementService.player.name;
  }
  get playerCurrentHP(): number {
    return this.playerManagementService.player.currentHp;
  }
  get playerMaxHP(): number {
    return this.playerManagementService.player.maxHp;
  }
  get playerCurrentMana(): number {
    return this.playerManagementService.player.currentMana;
  }
  get playerMaxMana(): number {
    return this.playerManagementService.player.maxMana;
  }
  get monsterLevel(): string {
    return this.combatManagerService._currentMonster.level.toFixed(0);
  }
  get monsterName(): string {
    return this.combatManagerService._currentMonster.name;
  }
  get monsterImage(): string {
    return this.combatManagerService._currentMonster.image;
  }
  get monsterCurrentHP(): number {
    return this.combatManagerService._currentMonster.currentHp;
  }
  get monsterMaxHP(): number {
    return this.combatManagerService._currentMonster.maxHp;
  }
  get recentAttacks(): { damage: number, source: 'player' | 'monster', timestamp: number, wasCrit: boolean }[] {
    return this.combatManagerService.recentAttacks;
  }

  get playerHealthPercentage(): number {
    return (this.playerCurrentHP / this.playerMaxHP) * 100;
  }

  get playerManaPercentage(): number {
    return (this.playerCurrentMana / this.playerMaxMana) * 100;
  }

  get monsterHealthPercentage(): number {
    return (this.monsterCurrentHP / this.monsterMaxHP) * 100;
  }

  get rewardItem(): Item | undefined {
    return this.combatManagerService._rewardItem;
  }

  get rewardEquivalent(): Item | undefined {
    if (this.rewardItem) {
      return this.playerManagementService.player.inventorySet.slots.get(this.rewardItem.slot);
    }
    return undefined;
  }

  get recentAttacksDisplay(): { damage: number, source: 'player' | 'monster', timestamp: number, wasCrit: boolean }[] {
    return this.recentAttacks
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-5);
  }

  get monsterBorderColor(): string {
    return this.combatManagerService._currentMonster.color;
  }

  constructor(
    private playerManagementService: PlayerManagementService,
    private combatManagerService: CombatManagerService
  ) { }

  ngOnInit(): void {
  }

  equip() {
    if(this.combatManagerService._rewardItem) {
      this.playerManagementService.player.equipItem(this.combatManagerService._rewardItem);
    }
    this.combatManagerService.generateMonster();
  }

  discardForSkill() {
    this.playerManagementService.addSkillPoint();
    this.retry();
  }

  retry() {
    this.playerManagementService.player.heal();
    this.playerManagementService.player.healMana();
    this.combatManagerService.generateMonster();
  }
}
