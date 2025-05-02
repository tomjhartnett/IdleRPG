import { Component, OnInit } from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";
import {Item} from "../../models/item.model";
import {Skill} from "../../models/skill.model";

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {

  get availableSkillPoints() {
    return this.playerManagementService.player.skillPoints;
  }

  get skills() {
    return this.playerManagementService.player.skills;
  }

  constructor(
    private playerManagementService: PlayerManagementService
  ) { }

  ngOnInit(): void {
  }

  addPoint(skill: Skill) {
    if(this.availableSkillPoints > 0) {
      skill.level++;
      this.playerManagementService.removeSkillPoint();
    }
  }

  removePoint(skill: Skill) {
    if(skill.level > 0) {
      skill.level--;
      this.playerManagementService.addSkillPoint();
    }
  }

  toggleEnabled(skill: Skill) {
    skill.isEnabled = !skill.isEnabled;
  }

  setHoverSkill(skill: Skill | undefined) {
    if (skill) {
      this.playerManagementService._hoverSkill = skill;
      this.playerManagementService.showSkillTooltip = true;
    }
  }

  removeHoverSkill() {
    this.playerManagementService.showSkillTooltip = false;
  }
}
