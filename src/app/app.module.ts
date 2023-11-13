import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { InventorySlotComponent } from './components/inventory-slot/inventory-slot.component';
import {PlayerStatsComponent} from "./components/player-stats/player-stats.component";

@NgModule({
  declarations: [
    AppComponent,
    InventoryComponent,
    TooltipComponent,
    InventorySlotComponent,
    PlayerStatsComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
