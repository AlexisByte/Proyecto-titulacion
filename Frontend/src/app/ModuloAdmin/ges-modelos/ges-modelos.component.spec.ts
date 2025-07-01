import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GesModelosComponent } from './ges-modelos.component';

describe('GesModelosComponent', () => {
  let component: GesModelosComponent;
  let fixture: ComponentFixture<GesModelosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GesModelosComponent]
    });
    fixture = TestBed.createComponent(GesModelosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
