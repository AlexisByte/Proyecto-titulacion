import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GesDatasetsComponent } from './ges-datasets.component';

describe('GesDatasetsComponent', () => {
  let component: GesDatasetsComponent;
  let fixture: ComponentFixture<GesDatasetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GesDatasetsComponent]
    });
    fixture = TestBed.createComponent(GesDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
