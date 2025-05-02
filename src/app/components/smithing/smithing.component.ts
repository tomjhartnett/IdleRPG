import { Component, OnInit } from '@angular/core';
import {Armor, Item, Shield, Weapon} from "../../models/item.model";
import {PlayerManagementService} from "../../services/player-management.service";

@Component({
  selector: 'app-smithing',
  templateUrl: './smithing.component.html',
  styleUrls: ['./smithing.component.css']
})
export class SmithingComponent implements OnInit {
  selectedItem?: Item;
  slotOrder = ["Head", "Neck", "Shoulders", "Back", "Chest", "Wrists", "Hands", "Waist", "Legs", "Feet", "Finger", "Trinket", "Main Hand", "Off Hand"];

  get gold(): number {
    return this.playerService.gold;
  }

  get slotRows(): (Item | undefined)[][] {
    const allItems = this.slotOrder.map(slot => this.playerService.playerSet.slots.get(slot));
    while (allItems.length < 16) allItems.push(undefined);
    return [allItems.slice(0, 8), allItems.slice(8, 16)];
  }

  constructor(public playerService: PlayerManagementService) {}

  ngOnInit(): void {
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  getUpgradeCost(item: Item): number {
    const reinforce = item.reinforceLevel || 0;
    return item.level * (reinforce + 1);
  }

  getBoostedStats(item: Item): { name: string; amount: number }[] {
    const currentMult = item.reinforceMultiplier;
    const nextMult = 1 + 0.1 * ((item.reinforceLevel || 0) + 1);
    const boostFactor = 0.1; // 10% boost per upgrade
    const boosts: { name: string; amount: number }[] = [];

    // Stat bonuses (simulate using next multiplier - current)
    for (const stat of item.stats) {
      const base = stat.amount;
      const current = base * currentMult;
      const next = base * nextMult;
      boosts.push({
        name: stat.stat,
        amount: Math.ceil(next - current)
      });
    }

    // Armor bonus
    if (item instanceof Armor || item instanceof Shield) {
      boosts.push({
        name: 'Armor',
        amount: Math.ceil(item.armor / item.reinforceMultiplier * boostFactor)
      });
    }

    // Weapon bonuses
    if (item instanceof Weapon) {
      const minBoost = Math.ceil(item.minDamage / item.reinforceMultiplier * boostFactor);
      const maxBoost = Math.ceil(item.maxDamage / item.reinforceMultiplier * boostFactor);
      const speedBoost = parseFloat(((item.attackSpeed / item.reinforceMultiplier) * boostFactor).toFixed(2));

      boosts.push({ name: 'Min Dmg', amount: minBoost });
      boosts.push({ name: 'Max Dmg', amount: maxBoost });
      boosts.push({ name: 'Atk Spd', amount: speedBoost });
    }

    return boosts;
  }



  upgradeSelectedItem(): void {
    if (!this.selectedItem) return;
    const cost = this.getUpgradeCost(this.selectedItem);
    if (this.gold < cost) return;

    this.playerService.gold -= cost;
    this.selectedItem.reinforceLevel = (this.selectedItem.reinforceLevel || 0) + 1;
  }
}
