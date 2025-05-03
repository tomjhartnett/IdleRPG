import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {CombatManagerService} from "../../services/combat-manager.service";
import {ItemFilterService} from "../../services/item-filter.service";
import {RelicManagerService} from "../../services/relic-manager.service";
import {Subscription} from "rxjs";
import {PlayerManagementService} from "../../services/player-management.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() pageChange: EventEmitter<string> = new EventEmitter<string>();
  smithingAlert = false;
  relicAlert    = false;
  prestigeAlert = false;
  currentPage: string = 'inventory';
  private subs = new Subscription();

  get smithingUnlocked(): boolean {
    return this.playerService.smithingUnlocked;
  }
  get relicsUnlocked(): boolean {
    return this.playerService.relicsUnlocked;
  }
  get prestigeUnlocked(): boolean {
    return this.playerService.prestigeUnlocked;
  }

  get isShowingPercents(): boolean {
    return this.combatService.showPercents;
  }

  get isTestingMode(): boolean {
    return this.combatService.is_testing_mode;
  }

  get isFastMode(): boolean {
    return !this.combatService.is_slow_test_mode;
  }

  ngOnInit(): void {
    // flash when player first unlocks smithing or relics
    this.subs.add(
      this.playerService.unlock$.subscribe(page => {
        if (page === 'smithing') this.smithingAlert = true;
        if (page === 'relics')   this.relicAlert    = true;
        if (page === 'prestige') this.prestigeAlert = true;
      })
    );

    // also flash relics on ascension as before
    this.subs.add(
      this.relicService.ascended$.subscribe(() => this.relicAlert = true)
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  constructor(
    private relicService: RelicManagerService,
    private combatService: CombatManagerService,
    private itemFilterService: ItemFilterService,
    private playerService: PlayerManagementService
  ) {
  }

  setPage(page: string) {
    this.currentPage = page;
    this.pageChange.emit(page);
    if (page === 'smithing') this.smithingAlert = false;
    if (page === 'relics')   this.relicAlert    = false;
    if (page === 'prestige') this.prestigeAlert = false;
  }

  toggleTestingMode() {
    this.combatService.is_testing_mode = !this.combatService.is_testing_mode;
    this.itemFilterService.setFiltering(true);
    this.itemFilterService.setAutoEquip(true);
  }

  toggleFastMode() {
    this.combatService.is_slow_test_mode = !this.combatService.is_slow_test_mode;
  }

  toggleTooltipPercents() {
    this.combatService.showPercents = !this.combatService.showPercents;
  }
}
