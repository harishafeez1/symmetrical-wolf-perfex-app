import { TestBed } from '@angular/core/testing';

import { BaseUrlGuard } from './base-url.guard';

describe('BaseUrlGuard', () => {
  let guard: BaseUrlGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BaseUrlGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
