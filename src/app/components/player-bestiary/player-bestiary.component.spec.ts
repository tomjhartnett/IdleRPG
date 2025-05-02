import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerBestiaryComponent } from './player-bestiary.component';

describe('PlayerBestiaryComponent', () => {
  let component: PlayerBestiaryComponent;
  let fixture: ComponentFixture<PlayerBestiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerBestiaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerBestiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
