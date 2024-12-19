import { TestBed } from '@angular/core/testing';

import { MpcAlertService } from './mpc-alert.service';

describe('MpcAlertService', () => {
  let service: MpcAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MpcAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
