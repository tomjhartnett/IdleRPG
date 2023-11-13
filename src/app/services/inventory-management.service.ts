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
    items.push(new Armor('Broad Helmet', 'Head','head_1.jpg', 7, "Cloth", 2, [{stat: "Strength", amount: 1}, {stat: "Stamina", amount: 1}], "Uncommon"));
    items.push(new Weapon('Elite Sword', 'Main Hand','sword_1.jpg', 1, 5, 2.9, "Sword", 1, [{stat: "Strength", amount: 2}, {stat: "Dexterity", amount: 1}], "Rare"));
    this._playerSet = new InventorySet(items);
  }


  // TODO make a new service for handling stats that asks this service for stat totals, have a new component to display stats next to inventory
  // TODO have automatic item generation based on level and optional slot/rarity/type with RNG stat generation
  // TODO have battle system with random monster generator, where reward is randomly generated too, based on monster level/difficulty
  // TODO have take/leave system for rewards and auto battling in between
}
