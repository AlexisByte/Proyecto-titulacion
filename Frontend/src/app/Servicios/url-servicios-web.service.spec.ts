import { TestBed } from '@angular/core/testing';

import { UrlServiciosWebService } from './url-servicios-web.service';

describe('UrlServiciosWebService', () => {
  let service: UrlServiciosWebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlServiciosWebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
