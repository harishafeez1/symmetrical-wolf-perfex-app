import { TestBed } from '@angular/core/testing';

import { ReminderApiService } from './reminder-api.service';

describe('ReminderApiService', () => {
  let service: ReminderApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
