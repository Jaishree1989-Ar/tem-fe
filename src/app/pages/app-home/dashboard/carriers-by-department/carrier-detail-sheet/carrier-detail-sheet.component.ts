import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../shared/material/material.module';

@Component({
  selector: 'app-carrier-detail-sheet',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './carrier-detail-sheet.component.html',
  styleUrl: './carrier-detail-sheet.component.less'
})
export class CarrierDetailSheetComponent {
  constructor(
    public dialogRef: MatDialogRef<CarrierDetailSheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

}
