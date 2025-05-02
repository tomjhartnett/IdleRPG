import {Component, Input, OnInit} from '@angular/core';
import {Skill} from "../../models/skill.model";

@Component({
  selector: 'app-skill-tooltip',
  templateUrl: './skill-tooltip.component.html',
  styleUrls: ['./skill-tooltip.component.css']
})
export class SkillTooltipComponent implements OnInit {

  @Input() skill!: Skill;

  constructor() { }

  ngOnInit(): void {
  }

}
