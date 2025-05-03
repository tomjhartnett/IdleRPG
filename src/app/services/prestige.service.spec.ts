import { TestBed } from '@angular/core/testing';

import { PrestigeService } from './prestige.service';

describe('PrestigeService', () => {
  let service: PrestigeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrestigeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
