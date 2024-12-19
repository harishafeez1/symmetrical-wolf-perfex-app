import { TestBed } from '@angular/core/testing';

import { CreditNoteApiService } from './credit-note-api.service';

describe('CreditNoteApiService', () => {
  let service: CreditNoteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditNoteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
