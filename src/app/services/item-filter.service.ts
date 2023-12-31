import { Injectable } from '@angular/core';
import {Armor, Item, Shield, Weapon} from "../models/item.model";

@Injectable({
  providedIn: 'root'
})
export class ItemFilterService {

  _isFiltering = false;
  get isFiltering() {
    return this._isFiltering;
  }
  _isAutoEquiping = false;
  get isAutoEquiping() {
    return this._isAutoEquiping;
  }

  _weights: {stat: Stat, weight: number}[] = [];

  constructor() {
    const cookies = localStorage.getItem('weights');
    if(cookies) {
      this._weights = JSON.parse(cookies).map((w: {stat:string, weight: number}) => ({stat: w.stat as Stat, weight: w.weight}));
    }
    for(let key of Object.keys(Stat)) {
      if(!this._weights.map(w => w.stat).includes(Stat[key as keyof typeof Stat])) {
        this._weights.push({stat: Stat[key as keyof typeof Stat], weight: 1});
      }
    }
  }

  setFiltering(isFiltering: boolean) {
    this._isFiltering = isFiltering;
  }

  setWeights(weights: {stat: Stat, weight: number}[]) {
    this._weights = weights;
    localStorage.setItem('weights', JSON.stringify(weights));
  }

  setAutoEquip(isAutoEquiping: boolean) {
    this._isAutoEquiping = isAutoEquiping;
  }

  scoreItem(item: Item): number {
    let totalScore = 0;
    for(let weight of this._weights) {
      switch (weight.stat) {
        case Stat.Strength: totalScore += item.strength * weight.weight; break;
        case Stat.Stamina: totalScore += item.stamina * weight.weight; break;
        case Stat.Agility: totalScore += item.agility * weight.weight; break;
        case Stat.Intellect: totalScore += item.intellect * weight.weight; break;
        case Stat.Spirit: totalScore += item.spirit * weight.weight; break;
        case Stat.Armor: if(item instanceof Armor || item instanceof Shield) totalScore += item.armor * weight.weight; break;
        case Stat.MinDmg: if(item instanceof Weapon) totalScore += item.minDamage * weight.weight; break;
        case Stat.MaxDmg: if(item instanceof Weapon) totalScore += item.maxDamage * weight.weight; break;
        case Stat.AttSpd: if(item instanceof Weapon) totalScore += item.attackSpeed * weight.weight; break;
      }
    }
    item.lastUpdatedWeight = totalScore;
    return totalScore;
  }
}

export enum Stat {
  Strength = "Strength",
  Stamina = "Stamina",
  Agility = "Agility",
  Intellect = "Intellect",
  Spirit = "Spirit",
  Armor = "Armor",
  MinDmg = "MinDmg",
  MaxDmg = "MaxDmg",
  AttSpd = "AttSpd"
}
