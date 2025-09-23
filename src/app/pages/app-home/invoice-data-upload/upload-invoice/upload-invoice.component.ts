import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-invoice',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './upload-invoice.component.html',
  styleUrl: './upload-invoice.component.less'
})

/**
 * Component used as a dialog for selecting a carrier before uploading an invoice.
 * It presents a dropdown or input field to select the carrier and returns the selected value upon submission.
 */
export class UploadInvoiceComponent {

  carrier = new FormControl<string | null>(null, [Validators.required]);

  constructor(
    private dialogRef: MatDialogRef<UploadInvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  /**
 * Submits the selected carrier and closes the dialog.
 * The selected carrier value is returned to the parent component via `afterClosed`.
 */
  onSubmit() {
    this.dialogRef.close(this.carrier.value);
  }
}
