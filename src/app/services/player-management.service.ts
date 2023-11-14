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
        minDmg: Math.floor(att.minDmg * (1 + (this.player.percentDmgUp/100))), maxDmg: Math.ceil(att.maxDmg * (1 + (this.player.percentDmgUp/100))), attSpd: att.attSpd
      }
    });
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService
  ) {
    let items: Item[] = [];
    items.push(itemGeneratorService.generateItem(3, "Rare", "Main Hand"));
    this.player = new Player(new InventorySet(items));
  }
}
