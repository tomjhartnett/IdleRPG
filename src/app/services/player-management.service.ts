import { Injectable } from '@angular/core';
import {Item} from "../models/item.model";
import {Player} from "../models/entity.model";
import {InventorySet} from "../models/inventory-set.model";
import {ItemGeneratorService} from "./item-generator.service";

@Injectable({
  providedIn: 'root'
})
export class PlayerManagementService {
  player: Player;

  get playerSet() {
    return this.player.inventorySet;
  }

  get currentItems(): Map<string, Item> {
    return this.playerSet.slots;
  }

  get attacks(): { minDmg: number, maxDmg: number, attSpd: number }[] {
    return this.playerSet.attacks.map(att => {
      return {
        minDmg: att.minDmg + this.player.flatDmgUp, maxDmg: att.maxDmg + this.player.flatDmgUp, attSpd: att.attSpd
      }
    });
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService
  ) {
    let items: Item[] = [];
    items.push(itemGeneratorService.generateItem(1, "Legendary", "Main Hand"));
    this.player = new Player(new InventorySet(items));
  }
}


// TODO make a new service for handling stats that asks this service for stat totals, have a new component to display stats next to inventory
// TODO have automatic item generation based on level and optional slot/rarity/type with RNG stat generation
// TODO have battle system with random monster generator, where reward is randomly generated too, based on monster level/difficulty
// TODO have take/leave system for rewards and auto battling in between
