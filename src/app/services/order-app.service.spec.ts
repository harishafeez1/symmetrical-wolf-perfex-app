import { TestBed } from '@angular/core/testing';

import { OrderAppService } from './order-app.service';

describe('OrderAppService', () => {
  let service: OrderAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
