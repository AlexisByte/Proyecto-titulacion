import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelosIAComponent } from './modelos-ia.component';

describe('ModelosIAComponent', () => {
  let component: ModelosIAComponent;
  let fixture: ComponentFixture<ModelosIAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelosIAComponent]
    });
    fixture = TestBed.createComponent(ModelosIAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
