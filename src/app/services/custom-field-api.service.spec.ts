import { TestBed } from '@angular/core/testing';

import { CustomFieldApiService } from './custom-field-api.service';

describe('CustomFieldApiService', () => {
  let service: CustomFieldApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomFieldApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
