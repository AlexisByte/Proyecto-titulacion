import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilVentanillaComponent } from './perfil-ventanilla.component';

describe('PerfilVentanillaComponent', () => {
  let component: PerfilVentanillaComponent;
  let fixture: ComponentFixture<PerfilVentanillaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerfilVentanillaComponent]
    });
    fixture = TestBed.createComponent(PerfilVentanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
