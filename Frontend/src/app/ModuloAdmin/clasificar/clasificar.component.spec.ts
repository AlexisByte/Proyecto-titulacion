import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificarComponent } from './clasificar.component';

describe('ClasificarComponent', () => {
  let component: ClasificarComponent;
  let fixture: ComponentFixture<ClasificarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClasificarComponent]
    });
    fixture = TestBed.createComponent(ClasificarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
