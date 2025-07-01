import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GesReglasNegocioComponent } from './ges-reglas-negocio.component';

describe('GesReglasNegocioComponent', () => {
  let component: GesReglasNegocioComponent;
  let fixture: ComponentFixture<GesReglasNegocioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GesReglasNegocioComponent]
    });
    fixture = TestBed.createComponent(GesReglasNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
