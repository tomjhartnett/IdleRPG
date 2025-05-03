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
import {SkillsComponent} from "./components/skills/skills.component";
import {SkillTooltipComponent} from "./components/skill-tooltip/skill-tooltip.component";
import {PlayerBestiaryComponent} from "./components/player-bestiary/player-bestiary.component";
import {HeaderComponent} from "./components/header/header.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from "@angular/material/icon";
import {SmithingComponent} from "./components/smithing/smithing.component";
import {RelicPageComponent} from "./components/relic-page/relic-page.component";
import {PrestigePageComponent} from "./components/prestige-page/prestige-page.component";

@NgModule({
  declarations: [
    AppComponent,
    InventoryComponent,
    TooltipComponent,
    InventorySlotComponent,
    PlayerStatsComponent,
    CombatPageComponent,
    ItemFilterComponent,
    SkillsComponent,
    SkillsComponent,
    SkillTooltipComponent,
    PlayerBestiaryComponent,
    HeaderComponent,
    SmithingComponent,
    RelicPageComponent,
    PrestigePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule
  ],
  providers: [],
  exports: [
    InventorySlotComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
