import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GesRolesComponent } from './ges-roles.component';

describe('GesRolesComponent', () => {
  let component: GesRolesComponent;
  let fixture: ComponentFixture<GesRolesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GesRolesComponent]
    });
    fixture = TestBed.createComponent(GesRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
