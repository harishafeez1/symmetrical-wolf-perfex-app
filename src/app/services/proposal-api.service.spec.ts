import { TestBed } from '@angular/core/testing';

import { ProposalApiService } from './proposal-api.service';

describe('ProposalApiService', () => {
  let service: ProposalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
