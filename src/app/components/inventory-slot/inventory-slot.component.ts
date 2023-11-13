import {Component, Input, OnInit} from '@angular/core';
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-inventory-slot',
  templateUrl: './inventory-slot.component.html',
  styleUrls: ['./inventory-slot.component.css']
})
export class InventorySlotComponent implements OnInit {

  @Input() item: Item | undefined;

  get slot() {
    return this.item ? this.item.slot : 'Empty';
  }

  get name() {
    return this.item ? this.item.name : '';
  }

  constructor() { }

  ngOnInit(): void {
  }
}
