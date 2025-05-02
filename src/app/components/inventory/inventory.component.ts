import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PlayerManagementService} from "../../services/player-management.service";
import {BehaviorSubject} from "rxjs";
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  inventoryObservable: BehaviorSubject<boolean>;

  get slots() {
    return this.playerManagementService.playerSet.slots;
  }

  get helmet(): Item | undefined {
    return this.slots.get('Head');
  }
  get necklace(): Item | undefined {
    return this.slots.get('Neck');
  }
  get shoulders(): Item | undefined {
    return this.slots.get('Shoulders');
  }
  get cape(): Item | undefined {
    return this.slots.get('Back');
  }
  get chest(): Item | undefined {
    return this.slots.get('Chest');
  }
  get wrists(): Item | undefined {
    return this.slots.get('Wrists');
  }
  get mainhand(): Item | undefined {
    return this.slots.get('Main Hand');
  }


  get hands(): Item | undefined {
    return this.slots.get('Hands');
  }
  get belt(): Item | undefined {
    return this.slots.get('Waist');
  }
  get legs(): Item | undefined {
    return this.slots.get('Legs');
  }
  get feet(): Item | undefined {
    return this.slots.get('Feet');
  }
  get ring(): Item | undefined {
    return this.slots.get('Finger');
  }
  get trinket(): Item | undefined {
    return this.slots.get('Trinket');
  }
  get offhand(): Item | undefined {
    return this.slots.get('Off Hand');
  }

  constructor(
    private playerManagementService: PlayerManagementService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.inventoryObservable = this.playerManagementService.playerSet.updateObservable;
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
      this.playerManagementService._hoverItem = item;
      this.playerManagementService.showTooltip = true;
    }
  }

  removeHoverItem() {
    this.playerManagementService.showTooltip = false;
  }
}
