import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDataUploadComponent } from './invoice-data-upload.component';

describe('InvoiceDataUploadComponent', () => {
  let component: InvoiceDataUploadComponent;
  let fixture: ComponentFixture<InvoiceDataUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDataUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDataUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
