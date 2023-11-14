import { Component, OnInit } from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";

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

  constructor(
    private playerManagementService: PlayerManagementService
  ) { }

  ngOnInit(): void {
  }

}
