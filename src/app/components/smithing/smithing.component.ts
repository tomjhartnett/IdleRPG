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
    while (allItems.length < 14) allItems.push(undefined);
    return [allItems.slice(0, 7), allItems.slice(7, 14)];
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

  getDpsIncrease(item: Item): number {
    if (!(item instanceof Weapon)) return 0;

    const reinforce = item.reinforceLevel || 0;
    const currMult = 1 + (0.1 * reinforce);
    const nextMult = 1 + (0.1 * (reinforce + 1));
    const player = this.playerService.player;

    // Strength bonus from the item's own stat at +1
    const baseStrength = item.stats.find(s => s.stat === 'Strength')?.amount || 0;
    const currentStrengthBonus = baseStrength * currMult;
    const nextStrengthBonus = baseStrength * nextMult;
    const extraStrength = Math.ceil(nextStrengthBonus - currentStrengthBonus);

    const currentStrength = player.strength;
    const nextStrength = currentStrength + extraStrength;
    const currDmgMult = 1 + (player.percentDmgUp / 100);
    const dmgMult = 1 + ((nextStrength / 10) / 100);

    const baseMin = Math.floor(item.minDamage * currDmgMult);
    const baseMax = Math.ceil(item.maxDamage * currDmgMult);
    const baseSpd = item.attackSpeed;
    const currDps = (baseMin + baseMax) / baseSpd;

    const nextMin = Math.floor(Math.ceil(item._minDamage * nextMult) * dmgMult);
    const nextMax = Math.ceil(Math.ceil(item._maxDamage * nextMult) * dmgMult);
    const nextSpd = parseFloat((item._attackSpeed / nextMult).toFixed(2));
    const nextDps = (nextMin + nextMax) / nextSpd;

    // console.log(dmgMult, currDps, nextDps)

    return parseFloat((nextDps - currDps).toFixed(2));
  }

  getEhpIncrease(item: Item): number {

    const player = this.playerService.player;
    let newTotalArmor = player.totalArmor;
    if (item instanceof Armor || item instanceof Shield) {
      const oldArmor = item._armor * item.reinforceMultiplier;
      const newArmor = item._armor * (1 + 0.1 * ((item.reinforceLevel || 0) + 1));

      const baseArmor = player.totalArmor - oldArmor;
      newTotalArmor = baseArmor + newArmor;
    }

    const hp = player.maxHp;
    const dodge = player.dodgeChance / 100;
    const oldDr = player.DR;
    const newDr = Math.min(0.9, newTotalArmor / (newTotalArmor + 400 + (100 * player.level)));

    const oldEhp = Math.round(hp / (1 - oldDr) / (1 - dodge));
    const newEhp = Math.round(hp / (1 - newDr) / (1 - dodge));

    return newEhp - oldEhp;
  }


  upgradeSelectedItem(): void {
    if (!this.selectedItem) return;
    const cost = this.getUpgradeCost(this.selectedItem);
    if (this.gold < cost) return;

    this.playerService.gold -= cost;
    this.selectedItem.reinforceLevel = (this.selectedItem.reinforceLevel || 0) + 1;
  }
}
