import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {InventoryManagementService} from "../../services/inventory-management.service";
import {InventorySet} from "../../models/inventory-set.model";
import {BehaviorSubject} from "rxjs";
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  inventoryObservable: BehaviorSubject<boolean>;
  showTooltip = false;
  _hoverItem!: Item;

  get hoverItem(): Item {
    return this._hoverItem;
  }

  get slots() {
    return this.inventoryManagementService.playerSet.slots;
  }

  get helmet(): Item | undefined {
    return this.slots.get('Head');
  }
  get chest(): Item | undefined {
    return this.slots.get('Chest');
  }

  get mainhand(): Item | undefined {
    return this.slots.get('Main Hand');
  }

  constructor(
    private inventoryManagementService: InventoryManagementService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.inventoryObservable = this.inventoryManagementService.playerSet.updateObservable;
    this.inventoryObservable.subscribe(() => this._changeDetectorRef.markForCheck());
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.inventoryObservable.unsubscribe();
  }

  setHoverItem(item: Item | undefined) {
    if (item) {
      this._hoverItem = item;
      this.showTooltip = true;
    }
  }
}
