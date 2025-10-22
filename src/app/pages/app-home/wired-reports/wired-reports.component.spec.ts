import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WiredReportsComponent } from './wired-reports.component';

describe('WiredReportsComponent', () => {
  let component: WiredReportsComponent;
  let fixture: ComponentFixture<WiredReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WiredReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WiredReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
