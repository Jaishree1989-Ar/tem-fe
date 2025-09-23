import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelecomReportsComponent } from './telecom-reports.component';

describe('TelecomReportsComponent', () => {
  let component: TelecomReportsComponent;
  let fixture: ComponentFixture<TelecomReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelecomReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelecomReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
