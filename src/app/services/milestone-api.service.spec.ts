import { TestBed } from '@angular/core/testing';

import { MilestoneApiService } from './milestone-api.service';

describe('MilestoneApiService', () => {
  let service: MilestoneApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MilestoneApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
