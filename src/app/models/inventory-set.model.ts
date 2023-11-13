import {BehaviorSubject} from "rxjs";
import {Item} from "./item.model";

export class InventorySet {
  // used to let pages know the inventory has updated
  updateObservable: BehaviorSubject<boolean>;

  slots: Map<string, Item>;

  constructor(startingItems?: Item[]) {
    this.slots = new Map<string, Item>();
    if(startingItems && startingItems.length) {
      startingItems.forEach(item => this.addItem(item))
    }
    this.updateObservable = new BehaviorSubject<boolean>(true);
  }

  addItem(item: Item) {
    this.slots.set(item.slot, item);
  }
}
