import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInventoryDialogComponent } from './view-inventory-dialog.component';

describe('ViewInventoryDialogComponent', () => {
  let component: ViewInventoryDialogComponent;
  let fixture: ComponentFixture<ViewInventoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInventoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInventoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
