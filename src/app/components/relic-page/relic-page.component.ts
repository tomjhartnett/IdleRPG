import {Component, OnDestroy, OnInit} from '@angular/core';
import {Relic, RelicManagerService} from "../../services/relic-manager.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-relic-page',
  templateUrl: './relic-page.component.html',
  styleUrls: ['./relic-page.component.css']
})
export class RelicPageComponent implements OnInit, OnDestroy {
  relics: Relic[] = [];
  equippedId: string | null = null;
  private subs = new Subscription();

  constructor(private relicService: RelicManagerService) {}

  ngOnInit() {
    this.subs.add(
      this.relicService.getRelics().subscribe(r => (this.relics = r))
    );
    this.subs.add(
      this.relicService.getEquipped().subscribe(id => (this.equippedId = id))
    );
    // Example: flash header on ascension
    this.subs.add(
      this.relicService.ascended$.subscribe(r => {
        console.log('Relic ascended!', r.name);
        // trigger your header-flash logic here
      })
    );
  }

  onEquip(r: Relic) {
    if (!r.ascended) {
      this.relicService.equipRelic(r.id);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
