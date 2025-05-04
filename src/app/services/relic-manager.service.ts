import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";

export interface Relic {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  /** key of the stat or effect this relic modifies */
  effectKey: 'Crit' | 'Armor' | 'Strength' | 'Dodge' | 'Gold' | 'EXP' |
    'Rebirth' | 'CritDmg' | 'AtkSpeed' | 'MaxHP' | 'DR' |
    'Spirit' | 'Stamina' | 'RareDrop' | 'DPS';
  /** per‑level increment (flat or percent) */
  perLevel: number;
  /** display label for that effect */
  effectLabel: string;
  ascended: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RelicManagerService {
  private relics: Relic[] = [
    {
      id: 'r1', name: 'Totem of Precision', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Crit', perLevel: 0.10, effectLabel: '% Crit Chance', ascended: false
    },
    {
      id: 'r2', name: 'Idol of Fortitude', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Armor', perLevel: 0.10, effectLabel: '% Armor', ascended: false
    },
    {
      id: 'r3', name: 'Sunstone Relic', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Strength', perLevel: 0.5, effectLabel: 'Strength', ascended: false
    },
    {
      id: 'r4', name: 'Moonlace Charm', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Dodge', perLevel: 0.10, effectLabel: '% Dodge Chance', ascended: false
    },
    {
      id: 'r5', name: 'Greed Coin', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Gold', perLevel: 0.5, effectLabel: '% Gold/Kill', ascended: false
    },
    {
      id: 'r8', name: 'Scroll of Learning', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'EXP', perLevel: 0.10, effectLabel: '% EXP Gain', ascended: false
    },
    {
      id: 'r9', name: 'Phoenix Feather', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Rebirth', perLevel: 0.2, effectLabel: 'Level on Rebirth', ascended: false
    },
    {
      id: 'r10', name: 'Ember Crest', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'CritDmg', perLevel: 0.20, effectLabel: '% Crit Damage', ascended: false
    },
    {
      id: 'r11', name: 'Keystone of Swiftness', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'AtkSpeed', perLevel: 0.001, effectLabel: 's Attack Speed', ascended: false
    },
    {
      id: 'r12', name: 'Vial of Vitality', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'MaxHP', perLevel: 0.10, effectLabel: '% Max HP', ascended: false
    },
    {
      id: 'r13', name: 'Shard of Shielding', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'DR', perLevel: 0.10, effectLabel: '% Damage Reduction', ascended: false
    },
    {
      id: 'r14', name: 'Seal of Essence', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Spirit', perLevel: 0.5, effectLabel: 'Spirit', ascended: false
    },
    {
      id: 'r15', name: 'Banner of Titans', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'Stamina', perLevel: 0.10, effectLabel: '% Stamina', ascended: false
    },
    {
      id: 'r16', name: 'Codex of Fortune', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'RareDrop', perLevel: 0.05, effectLabel: '% Rare Drop', ascended: false
    },
    {
      id: 'r20', name: 'Keystone of Mastery', level: 1, xp: 0, xpToNext: this.getXpToNext(1),
      effectKey: 'DPS', perLevel: 0.10, effectLabel: '% DPS', ascended: false
    },
  ];


  private relics$ = new BehaviorSubject<Relic[]>([...this.relics]);
  private equippedId: string | null = null;
  private equipped$ = new BehaviorSubject<string | null>(this.equippedId);
  private ascendedSubject = new Subject<Relic>();
  public ascended$: Observable<Relic> = this.ascendedSubject.asObservable();

  /** XP required for next level */
  private getXpToNext(level: number): number {
    // 1) if we're still at or below 50, just use old formula
    if (level <= 50) {
      return Math.round(10 * Math.pow(level, 1.4));
    }

    // 2) for 50<lvl<=100, linearly map [50→100] to [50→300]:
    //    mapped = 50 + (lvl − 50) * (300 − 50)/(100 − 50)
    let mapped = 50 + (level - 50) * (300 - 50) / 50;

    // 3) cap at 300 so that beyond lvl 100 we stay at that late‑game curve
    mapped = Math.min(mapped, 300);

    // 4) feed the “virtual level” into your old exponent
    return Math.round(10 * Math.pow(mapped, 1.4));
  }

  /** returns the currently‐equipped relic’s ID (or null) */
  getEquippedSync(): string | null {
    return this.equippedId;
  }

  /** Get live list of all relics */
  getRelics(): Observable<Relic[]> {
    return this.relics$.asObservable();
  }

  /** Currently equipped relic ID (or null) */
  getEquipped(): Observable<string | null> {
    return this.equipped$.asObservable();
  }

  /** Equip a relic (only one at a time; if ascended, can't equip) */
  equipRelic(id: string) {
    const relic = this.relics.find(r => r.id === id);
    if (!relic || relic.ascended) return;
    this.equippedId = id;
    this.equipped$.next(this.equippedId);
  }

  /** Sum of all +EXP% from ascended or equipped relics */
  get totalExpBonusPercent(): number {
    return this.relics
      .filter(r => r.ascended || r.id === this.equippedId)
      .reduce((sum, r) => {
        if (r.id === 'r8') {
          // Scroll of Learning: +0.10% EXP per level → 0.001 * level
          return sum + 0.001 * r.level;
        }
        return sum;
      }, 0);
  }

  /** Sum of all –AttackSpeed from ascended or equipped relics */
  get totalSpeedReduction(): number {
    return this.relics
      .filter(r => r.ascended || r.id === this.equippedId)
      .reduce((sum, r) => {
        if (r.id === 'r11') {
          // Keystone of Swiftness: –0.001s per level
          return sum + 0.001 * r.level;
        }
        return sum;
      }, 0);
  }

  /**
   * Phoenix Feather: +1 rebirth level for each 5 relic levels
   */
  get totalRebirthBonus(): number {
    return this.relics
      .filter(r => (r.ascended || r.id === this.equippedId) && r.id === 'r9')
      .reduce((sum, r) => sum + r.level, 0);
  }

  /**
   * Greed Coin (r5): +0.05% gold per kill per level
   * returns as a fraction (e.g. 0.001 × level)
   */
  get totalGoldBonus(): number {
    return this.relics
      .filter(r => (r.ascended || r.id === this.equippedId) && r.id === 'r5')
      .reduce((sum, r) => sum + (0.005 * r.level), 0);
  }

  /**
   * Sum of all +Rare‑Drop% from Codex of Fortune (r16), as a fraction.
   * +0.05% per level → 0.0005 × level
   */
  get totalRareDropBonus(): number {
    return this.relics
      .filter(r => (r.ascended || r.id === this.equippedId) && r.id === 'r16')
      .reduce((sum, r) => sum + (0.0005 * r.level), 0);
  }

  get totalCritDmgBonus(): number {
    return this.relics
      .filter(r => (r.ascended || r.id === this.equippedId) && r.id === 'r10')
      .reduce((sum, r) => sum + 0.002 * r.level, 0);
  }

  addExp(amount: number) {
    // 1) Determine which relics get XP
    const targets = this.relics.filter(r => r.ascended || r.id === this.equippedId);
    let ascendedRelic: Relic | null = null;
    const hadSelection = !!this.equippedId;

    // 2) Award XP & handle level‑ups/ascension
    for (const relic of targets) {
      relic.xp += amount;

      while (relic.xp >= relic.xpToNext) {
        relic.xp -= relic.xpToNext;
        relic.level++;
        relic.xpToNext = this.getXpToNext(relic.level);

        if (relic.level === 50 && !relic.ascended) {
          relic.ascended = true;
          ascendedRelic = relic;
          // free the slot so we can auto‑select another
          this.equippedId = null;
        }
      }
    }

    // 3) Emit the updated relic list
    this.relics$.next([...this.relics]);

    // 4) Auto‑equip logic:
    //    If you had NO relic selected, or if your equipped one just ascended,
    //    pick the *first* relic in the list that is still un‑ascended.
    if (!hadSelection || !!ascendedRelic) {
      const nextFree = this.relics.find(r => !r.ascended);
      this.equippedId = nextFree?.id ?? null;
      this.equipped$.next(this.equippedId);
    }

    // 5) Notify ascension (flash) if any
    if (ascendedRelic) {
      this.ascendedSubject.next(ascendedRelic);
    }
  }
}
