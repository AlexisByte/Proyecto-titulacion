import { TestBed } from '@angular/core/testing';

import { ReglasNegocioService } from './reglas-negocio.service';

describe('ReglasNegocioService', () => {
  let service: ReglasNegocioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReglasNegocioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
