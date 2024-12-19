import { TestBed } from '@angular/core/testing';

import { EstimateApiService } from './estimate-api.service';

describe('EstimateApiService', () => {
  let service: EstimateApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstimateApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
