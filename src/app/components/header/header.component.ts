import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CombatManagerService} from "../../services/combat-manager.service";
import {ItemFilterService} from "../../services/item-filter.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() pageChange: EventEmitter<string> = new EventEmitter<string>();
  currentPage: string = 'inventory';
  isShowingPercents(): boolean {
    return this.combatService.showPercents;
  }

  isTestingMode(): boolean {
    return this.combatService.is_testing_mode;
  }

  ngOnInit(): void {
  }

  constructor(
    private combatService: CombatManagerService,
    private itemFilterService: ItemFilterService
  ) {
  }

  setPage(page: string) {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  toggleTestingMode() {
    this.combatService.is_testing_mode = !this.combatService.is_testing_mode;
    this.itemFilterService.setFiltering(true);
    this.itemFilterService.setAutoEquip(true);
  }

  toggleTooltipPercents() {
    this.combatService.showPercents = !this.combatService.showPercents;
  }
}
