import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFilterComponent } from './item-filter.component';

describe('ItemFilterComponent', () => {
  let component: ItemFilterComponent;
  let fixture: ComponentFixture<ItemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
