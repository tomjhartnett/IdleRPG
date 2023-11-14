import {Component, OnInit} from '@angular/core';
import {ItemFilterService, Stat} from "../../services/item-filter.service";

@Component({
  selector: 'app-item-filter',
  templateUrl: './item-filter.component.html',
  styleUrls: ['./item-filter.component.css']
})
export class ItemFilterComponent implements OnInit {
  title = 'Item Filter Settings';
  autoFilterItems = false;
  autoEquipItems = false;
  // weird hack to only get the values so we can convert to the enum value
  weightKeys = Object.values(Stat);
  weights: { stat: Stat, weight: number}[] = [];

  constructor(
    private itemFilterService: ItemFilterService
  ) { }

  ngOnInit(): void {
    for(let weight of this.weightKeys) {
      this.weights.push({stat: Stat[weight as keyof typeof Stat], weight: 1});
    }
  }

  autoEquip(): void {
    this.itemFilterService.setAutoEquip(this.autoEquipItems);
  }

  changeWeights(): void {
    this.itemFilterService.setFiltering(this.autoFilterItems);
    this.itemFilterService.setWeights(this.weights);
  }
}
