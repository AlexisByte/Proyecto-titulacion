import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquifaxComponent } from './equifax.component';

describe('EquifaxComponent', () => {
  let component: EquifaxComponent;
  let fixture: ComponentFixture<EquifaxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EquifaxComponent]
    });
    fixture = TestBed.createComponent(EquifaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
