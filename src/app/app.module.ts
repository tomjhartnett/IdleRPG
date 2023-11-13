import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { InventorySlotComponent } from './components/inventory-slot/inventory-slot.component';

@NgModule({
  declarations: [
    AppComponent,
    InventoryComponent,
    TooltipComponent,
    InventorySlotComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
