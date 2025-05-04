// Updated the monster names to be more demonic

export class Monster extends Entity {
  ... // existing code 

  private static species = [
    // Updated names to be more demonic
    "Demon Warg", "Hell Spider", "Undead Lich", "Infernal Bandit", "Cursed Wolf", "Fiend Golem", "Beast of Shadows", "Wraith Reaper", "Dread Bat", "Cultist of the Abyss", "Serpent", "Ghoul Devourer"
  ];
  
  ... // existing code 

  private generateName(): string {
    const prefix = Monster.prefixes[this.getRandomInt(Monster.prefixes.length)];
    const species = Monster.species[this.getRandomInt(Monster.species.length)];

    // Guaranteed affix from the trackable list
    const suffixes = Object.keys(MONSTER_AFFIX_BONUSES);
    const suffix = suffixes[this.getRandomInt(suffixes.length)];

    return `${prefix} ${species} ${suffix}`;
  }
}