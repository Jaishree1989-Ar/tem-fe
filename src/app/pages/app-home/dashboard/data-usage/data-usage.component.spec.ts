import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUsageComponent } from './data-usage.component';

describe('DataUsageComponent', () => {
  let component: DataUsageComponent;
  let fixture: ComponentFixture<DataUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
