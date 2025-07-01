import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilGerenteComponent } from './perfil-gerente.component';

describe('PerfilGerenteComponent', () => {
  let component: PerfilGerenteComponent;
  let fixture: ComponentFixture<PerfilGerenteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerfilGerenteComponent]
    });
    fixture = TestBed.createComponent(PerfilGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
