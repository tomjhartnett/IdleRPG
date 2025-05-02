import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmithingComponent } from './smithing.component';

describe('SmithingComponent', () => {
  let component: SmithingComponent;
  let fixture: ComponentFixture<SmithingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmithingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmithingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
