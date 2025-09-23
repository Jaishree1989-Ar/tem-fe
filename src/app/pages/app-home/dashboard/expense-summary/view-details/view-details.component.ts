import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../../shared/material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-details',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.less'
})
export class ViewDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
