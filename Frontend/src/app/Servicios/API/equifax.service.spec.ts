import { TestBed } from '@angular/core/testing';

import { EquifaxService } from './equifax.service';

describe('EquifaxService', () => {
  let service: EquifaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquifaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
