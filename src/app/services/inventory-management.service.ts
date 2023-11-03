import { Injectable } from '@angular/core';
import {Item} from "../models/item.model";

@Injectable({
  providedIn: 'root'
})
export class InventoryManagementService {

  _helmet: Item | undefined;
  get helmet(): Item | undefined {
    return this._helmet;
  }
  set helmet(helmet: Item | undefined) {
    this._helmet = helmet;
  }

  constructor() { }
}
