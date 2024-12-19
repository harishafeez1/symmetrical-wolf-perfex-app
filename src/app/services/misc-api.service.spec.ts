import { TestBed } from '@angular/core/testing';

import { MiscApiService } from './misc-api.service';

describe('MiscApiService', () => {
  let service: MiscApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MiscApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
