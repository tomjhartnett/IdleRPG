import { Component } from '@angular/core';
import {Item} from "./models/item.model";
import {PlayerManagementService} from "./services/player-management.service";
import {Skill} from "./models/skill.model";
import {CombatManagerService} from "./services/combat-manager.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'IdleRPG';
  currentPage: string = 'home';

  get hoverItem(): Item {
    return this.playerManagerService._hoverItem;
  }

  get hoverSkill(): Skill {
    return this.playerManagerService._hoverSkill;
  }

  get showTooltip(): boolean {
    return this.playerManagerService.showTooltip;
  }

  get showSkillTooltip(): boolean {
    return this.playerManagerService.showSkillTooltip;
  }

  changePage(page: string) {
    this.currentPage = page;
    this.combatManagerService.isPaused = this.currentPage !== 'home';
  }

  constructor(
    private playerManagerService: PlayerManagementService,
    private combatManagerService: CombatManagerService
  ) {
  }
}
