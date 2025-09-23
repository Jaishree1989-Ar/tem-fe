import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTelecomDialogComponent } from './edit-telecom-dialog.component';

describe('EditTelecomDialogComponent', () => {
  let component: EditTelecomDialogComponent;
  let fixture: ComponentFixture<EditTelecomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTelecomDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTelecomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
