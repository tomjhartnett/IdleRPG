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

  get lastReplacedItem(): Item | undefined {
    return this.playerSet.lastEquipedItem;
  }

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

  get canUpgradeWeapon(): boolean {
    const weapon = this.player.inventorySet.slots.get('Main Hand');
    return !!weapon && weapon.rarity != 'Legendary' && weapon.level <= this.player.level;
  }

  constructor(
    private itemGeneratorService: ItemGeneratorService
  ) {
    let items: Item[] = [];
    items.push(itemGeneratorService.generateItem(3, "Legendary", "Main Hand"));
    this.player = new Player(new InventorySet(items));
  }

  upgradeWeapon() {
    const oldWeapon = this.playerSet.slots.get('Main Hand');
    if(oldWeapon) {
      const oldRarity = oldWeapon.rarity;
      let newRarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" = "Uncommon";
      if(oldRarity == "Epic") {
        newRarity = "Legendary";
      } else if(oldRarity == "Rare") {
        newRarity = "Epic";
      } else if(oldRarity == "Uncommon") {
        newRarity = "Rare";
      }
      this.player = new Player(new InventorySet([this.itemGeneratorService.generateItem(oldWeapon.level, newRarity, "Main Hand")]));
    }
  }

  undoEquip() {
    if(this.playerSet.lastEquipedItem) {
      this.playerSet.addItem(this.playerSet.lastEquipedItem);
    }
  }
}
