import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioportadaComponent } from './inicioportada.component';

describe('InicioportadaComponent', () => {
  let component: InicioportadaComponent;
  let fixture: ComponentFixture<InicioportadaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InicioportadaComponent]
    });
    fixture = TestBed.createComponent(InicioportadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
