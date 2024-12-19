import { TestBed } from '@angular/core/testing';

import { AppSubscriptionService } from './app-subscription.service';

describe('AppSubscriptionService', () => {
  let service: AppSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
