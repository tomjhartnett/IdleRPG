import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestigePageComponent } from './prestige-page.component';

describe('PrestigePageComponent', () => {
  let component: PrestigePageComponent;
  let fixture: ComponentFixture<PrestigePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrestigePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestigePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
