import { TestBed } from '@angular/core/testing';

import { DownloadApiService } from './download-api.service';

describe('DownloadApiService', () => {
  let service: DownloadApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
