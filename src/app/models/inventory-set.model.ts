import {BehaviorSubject} from "rxjs";
import {Armor, Item, Shield, Weapon} from "./item.model";

export class InventorySet {
  // used to let pages know the inventory has updated
  updateObservable: BehaviorSubject<boolean>;
  lastEquipedItem: Item | undefined;
  slots: Map<string, Item>;

  get strength() {
    let total = 0;
    for(let item of this.slots.values()) {
      total += item.strength;
    }
    return total;
  }
  get stamina() {
    let total = 0;
    for(let item of this.slots.values()) {
      total += item.stamina;
    }
    return total;
  }
  get agility() {
    let total = 0;
    for(let item of this.slots.values()) {
      total += item.agility;
    }
    return total;
  }
  get intellect() {
    let total = 0;
    for(let item of this.slots.values()) {
      total += item.intellect;
    }
    return total;
  }
  get spirit() {
    let total = 0;
    for(let item of this.slots.values()) {
      total += item.spirit;
    }
    return total;
  }

  get totalArmor(): number {
    let total = 0;
    for(let item of this.slots.values()) {
      if(item instanceof Armor || item instanceof Shield) {
        total += item.armor;
      }
    }
    return total;
  }

  get attacks(): { minDmg: number, maxDmg: number, attSpd: number }[] {
    let total = [];
    for(let item of this.slots.values()) {
      if(item instanceof Weapon) {
        total.push({minDmg: item.minDamage, maxDmg: item.maxDamage, attSpd: item.attackSpeed});
      }
    }
    return total;
  }

  constructor(startingItems?: Item[]) {
    this.slots = new Map<string, Item>();
    if(startingItems && startingItems.length) {
      startingItems.forEach(item => this.addItem(item))
    }
    this.updateObservable = new BehaviorSubject<boolean>(true);
  }

  addItem(item: Item) {
    this.lastEquipedItem = this.slots.get(item.slot);
    this.slots.set(item.slot, item);
  }
}
