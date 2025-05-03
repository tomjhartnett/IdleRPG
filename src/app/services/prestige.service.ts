import { Injectable } from '@angular/core';

export interface PrestigeOption {
  id: string;
  name: string;
  description: string;
}

export type PrestigeTier = PrestigeOption[];

export interface PrestigePath {
  id: string;
  name: string;
  description: string;
  xp: number;
  xpToNext: number;
  tierIndex: number;              // 0–3 (0 = not yet tier1)
  selectedOptions: string[];      // length == tierIndex, storing chosen option IDs
  tiers: [PrestigeTier, PrestigeTier, PrestigeTier];
}

@Injectable({
  providedIn: 'root'
})
export class PrestigeService {
  private paths: PrestigePath[] = [
    {
      id: 'blademaster',
      name: 'Blademaster',
      description: 'Burst‑damage specialist',
      xp: 0,
      xpToNext: 100,
      tierIndex: 0,
      selectedOptions: [],
      tiers: [
        [ // Tier 1
          { id: 'bm11', name: '+10% Crit Damage',          description: 'Increase your critical damage by 10%.' },
          { id: 'bm12', name: '+5% DPS Scaling',           description: 'Your DPS scales +5% faster.' },
          { id: 'bm13', name: '-10% Smith Cost',           description: 'Smithing upgrades cost 10% less.' },
        ],
        [ // Tier 2
          { id: 'bm21', name: '+2% Crit Chance per Kill',  description: 'Each kill permanently adds +2% crit chance.' },
          { id: 'bm22', name: '+5% Burst Damage',          description: 'Your next attack after a crit deals 5% extra damage.' },
          { id: 'bm23', name: '+1s Crit Window',           description: 'Crit timer window extends by 1 second.' },
        ],
        [ // Tier 3
          { id: 'bm31', name: '+20% Crit Damage',          description: 'Increase critical damage by 20%.' },
          { id: 'bm32', name: 'Chain Crits',               description: 'Crits have a 10% chance to proc again.' },
          { id: 'bm33', name: 'Adrenaline Surge',          description: 'Gain +10% attack speed for 5s after a crit.' },
        ]
      ]
    },
    {
      id: 'juggernaut',
      name: 'Juggernaut',
      description: 'Endurance & defense',
      xp: 0,
      xpToNext: 100,
      tierIndex: 0,
      selectedOptions: [],
      tiers: [
        [
          { id: 'jg11', name: '+10% Max HP',            description: 'Increase maximum health by 10%.' },
          { id: 'jg12', name: '+5% Damage Reduction',    description: 'Reduce incoming damage by 5%.' },
          { id: 'jg13', name: '+3 EHP per Kill',         description: 'Gain +3 effective HP per kill.' },
        ],
        [
          { id: 'jg21', name: 'Reinforce Gold Refund',  description: '10% chance to refund gold on smithing.' },
          { id: 'jg22', name: '+10% Gold vs Bosses',    description: 'Earn 10% more gold from bosses.' },
          { id: 'jg23', name: 'Stagger DR Buff',         description: 'Gain +5% DR for 5s after taking fatal blow (once).' },
        ],
        [
          { id: 'jg31', name: 'Auto‑Absorb Weak Hits',  description: 'Automatically absorb hits that would deal <5% HP.' },
          { id: 'jg32', name: 'Shield After Kill',      description: 'Gain a 10% max‑HP shield for 3s after kill.' },
          { id: 'jg33', name: 'Heal on Bestiary Gain',  description: 'Heal 5% HP whenever you unlock a bestiary bonus.' },
        ]
      ]
    },
    {
      id: 'arcanist',
      name: 'Arcanist',
      description: 'Spell‑casting specialist',
      xp: 0,
      xpToNext: 100,
      tierIndex: 0,
      selectedOptions: [],
      tiers: [
        [
          { id: 'ar11', name: '+5% Mana Regen',        description: 'Increase your mana regeneration by 5%.' },
          { id: 'ar12', name: '+3 Mana per Kill',      description: 'Gain 3 mana each time you kill a monster.' },
          { id: 'ar13', name: '+5% Spell Crit',        description: 'Increase spell critical chance by 5%.' },
        ],
        [
          { id: 'ar21', name: '+10% Relic XP',         description: 'Equipped relics gain 10% more XP.' },
          { id: 'ar22', name: 'AoE Spark',             description: '5% chance to arc lightning to nearby foes.' },
          { id: 'ar23', name: 'Mana Cost -10%',        description: 'Reduce all mana costs by 10%.' },
        ],
        [
          { id: 'ar31', name: 'Arcane Orb',            description: 'Occasionally fire an orb that deals AoE damage.' },
          { id: 'ar32', name: 'Mana Surge Buff',       description: 'On kill, gain +20% mana regen for 5s.' },
          { id: 'ar33', name: 'Spell Echo',            description: '10% chance spells cast again at 50% power.' },
        ]
      ]
    },
    {
      id: 'stalker',
      name: 'Stalker',
      description: 'Stealth and evasion',
      xp: 0,
      xpToNext: 100,
      tierIndex: 0,
      selectedOptions: [],
      tiers: [
        [
          { id: 'st11', name: '+5% Dodge Chance',     description: 'Increase dodge chance by 5%.' },
          { id: 'st12', name: '+5% Move Speed',      description: 'Increase movement speed by 5%.' },
          { id: 'st13', name: '+10% First Strike',   description: 'Your first hit in each combat deals 10% more damage.' },
        ],
        [
          { id: 'st21', name: '+2% Dodge per Kill',  description: 'Gain +2% dodge chance per kill.' },
          { id: 'st22', name: '+15% Ambush Damage',  description: 'Ambush attacks deal 15% extra damage.' },
          { id: 'st23', name: 'Shadow Step',         description: '10% chance to evade and counterattack.' },
        ],
        [
          { id: 'st31', name: 'Guaranteed First Hit',description: 'Your first attack always crits.' },
          { id: 'st32', name: 'Stealth Regen',       description: 'Out of combat, gain +5% HP regen.' },
          { id: 'st33', name: 'Trap Mastery',        description: 'Traps disable foes for 2s.' },
        ]
      ]
    },
    {
      id: 'collector',
      name: 'Collector',
      description: 'Loot and resource focus',
      xp: 0,
      xpToNext: 100,
      tierIndex: 0,
      selectedOptions: [],
      tiers: [
        [
          { id: 'co11', name: '+2% Rare Drop',       description: 'Increase rare drop chance by 2%.' },
          { id: 'co12', name: '+5% Gold Find',       description: 'Gain 5% more gold from all sources.' },
          { id: 'co13', name: '+1% Reinforce Success',description: 'Increase smithing success chance by 1%.' },
        ],
        [
          { id: 'co21', name: '+5% Salvage Yield',  description: 'Salvaging yields 5% more materials.' },
          { id: 'co22', name: '+10% XP Find',       description: 'Gain 10% more XP from monsters.' },
          { id: 'co23', name: '+2% Relic XP',       description: 'Equipped relics gain 2% more XP.' },
        ],
        [
          { id: 'co31', name: 'Duplicate Loot',     description: '10% chance to drop duplicates.' },
          { id: 'co32', name: 'Cheap Smithing',     description: 'Smithing costs 5% less gold.' },
          { id: 'co33', name: 'Auto‑Sell Junk',     description: 'Automatically sell gray items on pickup.' },
        ]
      ]
    }
  ];

  private currentPath?: PrestigePath;

  /** Return all paths */
  getPaths(): PrestigePath[] {
    return this.paths;
  }

  /** Return the currently selected path (or undefined) */
  getCurrentPath(): PrestigePath | undefined {
    return this.currentPath;
  }

  /** Choose which path to work on */
  selectPath(id: string): void {
    const p = this.paths.find(x => x.id === id);
    if (!p) return;
    // clone so editing doesn’t mutate the template list until confirmed
    this.currentPath = { ...p, selectedOptions: [...p.selectedOptions] };
  }

  /** Award XP toward the selected path */
  addXp(amount: number): void {
    if (!this.currentPath) return;
    const p = this.paths.find(x => x.id === this.currentPath!.id)!;
    p.xp += amount;
    while (p.tierIndex < 3 && p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.tierIndex++;
      p.xpToNext *= 2;
    }
    // keep currentPath in sync
    this.currentPath = { ...p, selectedOptions: [...p.selectedOptions] };
  }

  /**
   * Pick one option in the given tier (only if unlocked)
   * tierIdx in [0,1,2]
   */
  chooseOption(pathId: string, tierIdx: number, optionId: string): void {
    const p = this.paths.find(x => x.id === pathId);
    if (!p || p.tierIndex <= tierIdx) return;
    p.selectedOptions[tierIdx] = optionId;
    if (this.currentPath && this.currentPath.id === pathId) {
      this.currentPath.selectedOptions[tierIdx] = optionId;
    }
  }

  /** Clears your current path selection (go back to list) */
  deselectPath(): void {
    this.currentPath = undefined;
  }

  /** Wipes XP, tiers, and choices for the selected path */
  resetProgress(): void {
    if (!this.currentPath) return;
    const p = this.paths.find(x => x.id === this.currentPath!.id)!;
    p.xp             = 0;
    p.xpToNext       = 100;
    p.tierIndex      = 0;
    p.selectedOptions = [];
    // keep you on this path, but with fresh progress
    this.currentPath = { ...p, selectedOptions: [] };
  }
}
