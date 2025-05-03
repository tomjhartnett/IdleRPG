import { TestBed } from '@angular/core/testing';

import { RelicManagerService } from './relic-manager.service';

describe('RelicManagerService', () => {
  let service: RelicManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelicManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
