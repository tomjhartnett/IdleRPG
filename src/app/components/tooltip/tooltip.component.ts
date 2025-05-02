import {Component, Input, OnInit} from '@angular/core';
import {Item} from "../../models/item.model";

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent implements OnInit {

  @Input() item!: Item;

  get itemLevel(): number {
    return this.item ? Math.round(this.item.level): 0;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
