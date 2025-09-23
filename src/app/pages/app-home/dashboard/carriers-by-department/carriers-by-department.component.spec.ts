import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarriersByDepartmentComponent } from './carriers-by-department.component';

describe('CarriersByDepartmentComponent', () => {
  let component: CarriersByDepartmentComponent;
  let fixture: ComponentFixture<CarriersByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarriersByDepartmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarriersByDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
