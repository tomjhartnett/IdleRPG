import {Component, Input, OnInit} from '@angular/core';
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-inventory-slot',
  templateUrl: './inventory-slot.component.html',
  styleUrls: ['./inventory-slot.component.css']
})
export class InventorySlotComponent implements OnInit {

  @Input() item: Item | undefined;

  get imageSource() {
    return this.item ? this.item.imagePath : 'empty.jpg';
  }

  get borderColor() {
    return this.item ? this.item.color : '#fff';
  }

  constructor() { }

  ngOnInit(): void {
  }
}
