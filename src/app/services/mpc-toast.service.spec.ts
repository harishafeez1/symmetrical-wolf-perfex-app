import { TestBed } from '@angular/core/testing';

import { MpcToastService } from './mpc-toast.service';

describe('MpcToastService', () => {
  let service: MpcToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MpcToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
