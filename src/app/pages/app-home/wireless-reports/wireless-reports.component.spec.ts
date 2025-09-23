import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WirelessReportsComponent } from './wireless-reports.component';

describe('WirelessReportsComponent', () => {
  let component: WirelessReportsComponent;
  let fixture: ComponentFixture<WirelessReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WirelessReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WirelessReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
