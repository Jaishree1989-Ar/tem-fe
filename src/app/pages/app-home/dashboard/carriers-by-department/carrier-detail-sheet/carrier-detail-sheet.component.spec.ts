import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierDetailSheetComponent } from './carrier-detail-sheet.component';

describe('CarrierDetailSheetComponent', () => {
  let component: CarrierDetailSheetComponent;
  let fixture: ComponentFixture<CarrierDetailSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrierDetailSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrierDetailSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
