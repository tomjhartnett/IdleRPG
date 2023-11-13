import { Injectable } from '@angular/core';
import {Armor, Item, Weapon} from "../models/item.model";
import {InventorySet} from "../models/inventory-set.model";

@Injectable({
  providedIn: 'root'
})
export class InventoryManagementService {

  _playerSet: InventorySet;

  get playerSet() {
    return this._playerSet;
  }

  constructor() {
    let items: Item[] = [];
    items.push(new Armor('Broad Helmet', 'Head', 7, "Cloth", 2, [{stat: "Strength", amount: 1}, {stat: "Stamina", amount: 1}], "Uncommon"));
    items.push(new Weapon('Elite Sword', 'Main Hand', 1, 5, 2.9, "Sword", 1, [{stat: "Strength", amount: 2}, {stat: "Dexterity", amount: 1}], "Rare"));
    this._playerSet = new InventorySet(items);
  }
}
