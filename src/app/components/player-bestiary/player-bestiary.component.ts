import { Component, OnInit } from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";
import {MONSTER_AFFIX_BONUSES} from "../../models/entity.model";

@Component({
  selector: 'app-player-bestiary',
  templateUrl: './player-bestiary.component.html',
  styleUrls: ['./player-bestiary.component.css']
})
export class PlayerBestiaryComponent implements OnInit {

  get bestiaryLevel(): number {
    return this.playerManagementService.bestiaryKillCount;
  }

  constructor(public playerManagementService: PlayerManagementService) { }

  ngOnInit(): void {
  }

  get bestiaryData() {
    return Object.entries(this.playerManagementService.bestiary)
      .map(([suffix, count]) => ({
        suffix,
        count,
        bonus: MONSTER_AFFIX_BONUSES[suffix]
      }))
      .sort((a, b) => a.bonus.stat.localeCompare(b.bonus.stat));
  }
}
