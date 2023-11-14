import { TestBed } from '@angular/core/testing';

import { ItemFilterService } from './item-filter.service';

describe('ItemFilterService', () => {
  let service: ItemFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
