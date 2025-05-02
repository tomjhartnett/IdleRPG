export class Skill {
  name: string;
  image: string;
  level: number;
  description: string;
  isEnabled: boolean;

  constructor(name: string, image: string, level: number, description: string, isEnabled: boolean) {
    this.name = name;
    this.image = image;
    this.level = level;
    this.description = description;
    this.isEnabled = isEnabled;
  }

  get tooltipLines(): string[] {
    return [this.description];
  }
}
