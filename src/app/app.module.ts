import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from "@angular/forms";

import { AppComponent } from './app.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { InventorySlotComponent } from './components/inventory-slot/inventory-slot.component';
import {PlayerStatsComponent} from "./components/player-stats/player-stats.component";
import {CombatPageComponent} from "./components/combat-page/combat-page.component";
import { ItemFilterComponent } from './components/item-filter/item-filter.component';

@NgModule({
    declarations: [
        AppComponent,
        InventoryComponent,
        TooltipComponent,
        InventorySlotComponent,
        PlayerStatsComponent,
        CombatPageComponent,
        ItemFilterComponent,
    ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
