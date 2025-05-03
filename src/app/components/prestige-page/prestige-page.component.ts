import {Component, OnInit} from '@angular/core';
import {PrestigeOption, PrestigePath, PrestigeService} from "../../services/prestige.service";

@Component({
  selector: 'app-prestige-page',
  templateUrl: './prestige-page.component.html',
  styleUrls: ['./prestige-page.component.css']
})
export class PrestigePageComponent implements OnInit {
  readonly BASE_PRESTIGE_XP = 100;
  get paths(): PrestigePath[] {
    return this.svc.getPaths();
  }

  get current(): PrestigePath | undefined {
    return this.svc.getCurrentPath();
  }

  constructor(private svc: PrestigeService) {}

  ngOnInit() {
  }

  /**
   * How much total Prestige XP is required to unlock a given tier?
   * Tier indices are 0,1,2 → returns 100, 200, 400 respectively.
   */
  xpRequiredForTier(tierIdx: number): number {
    return this.BASE_PRESTIGE_XP * Math.pow(2, tierIdx);
  }

  selectPath(id: string) {
    this.svc.selectPath(id);
  }

  choose(path: string, tier: number, opt: PrestigeOption) {
    this.svc.chooseOption(path, tier, opt.id);
  }

  deselectPath() {
    this.svc.deselectPath();
  }

  resetProgress() {
    this.svc.resetProgress();
  }
}
