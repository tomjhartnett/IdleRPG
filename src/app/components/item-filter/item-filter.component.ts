import {Component, OnInit} from '@angular/core';
import {ItemFilterService, Stat} from "../../services/item-filter.service";

@Component({
  selector: 'app-item-filter',
  templateUrl: './item-filter.component.html',
  styleUrls: ['./item-filter.component.css']
})
export class ItemFilterComponent implements OnInit {
  title = 'Item Filter Settings';
  weights: { stat: Stat, weight: number}[] = [];

  get autoFilterItems(): boolean {
    return this.itemFilterService.isFiltering;
  }

  get autoEquipItems(): boolean {
    return this.itemFilterService.isAutoEquiping;
  }

  constructor(
    private itemFilterService: ItemFilterService
  ) { }

  ngOnInit(): void {
    this.weights = this.itemFilterService._weights;
  }

  autoEquip(): void {
    this.itemFilterService.setAutoEquip(!this.autoEquipItems);
  }

  changeWeights(toggle = false): void {
    if(toggle) {
      this.itemFilterService.setFiltering(!this.autoFilterItems);
    }
    this.itemFilterService.setWeights(this.weights);
  }
}
