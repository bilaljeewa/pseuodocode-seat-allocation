import { TestBed } from '@angular/core/testing';

import { SeatallocationService } from './seatallocation.service';

describe('SeatallocationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SeatallocationService = TestBed.get(SeatallocationService);
    expect(service).toBeTruthy();
  });
});
