import { TestBed } from '@angular/core/testing';

import { TemplateApiService } from './template-api.service';

describe('TemplateApiService', () => {
  let service: TemplateApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
