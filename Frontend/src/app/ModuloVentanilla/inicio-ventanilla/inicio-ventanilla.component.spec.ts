import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioVentanillaComponent } from './inicio-ventanilla.component';

describe('InicioVentanillaComponent', () => {
  let component: InicioVentanillaComponent;
  let fixture: ComponentFixture<InicioVentanillaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InicioVentanillaComponent]
    });
    fixture = TestBed.createComponent(InicioVentanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
