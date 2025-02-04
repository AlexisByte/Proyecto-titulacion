import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GesUsuariosComponent } from './ges-usuarios.component';

describe('GesUsuariosComponent', () => {
  let component: GesUsuariosComponent;
  let fixture: ComponentFixture<GesUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GesUsuariosComponent]
    });
    fixture = TestBed.createComponent(GesUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
