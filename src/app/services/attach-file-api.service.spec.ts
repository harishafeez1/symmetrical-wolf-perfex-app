import { TestBed } from '@angular/core/testing';

import { AttachFileApiService } from './attach-file-api.service';

describe('AttachFileApiService', () => {
  let service: AttachFileApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttachFileApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
