import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/http/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { TelecomReports } from '../../../../core/models/telecom-reports';
import { MaterialModule } from '../../../../shared/material/material.module';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-edit-telecom-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './edit-telecom-dialog.component.html',
  styleUrl: './edit-telecom-dialog.component.less'
})

/**
 * Component for editing a telecom or wireless report record.
 * This dialog provides a form to update limited fields like department, viscode, and name on invoice.
 */
export class EditTelecomDialogComponent {
  teleReportForm!: FormGroup;
  details: any;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<EditTelecomDialogComponent>,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  ngOnInit(): void {
    this.details = this.data.details;
    this.teleReportForm = this.fb.group({
      department: [this.details?.department || ''],
      viscode: [this.details?.viscode || ''],
      nameOnInvoice: [this.details?.nameOnInvoice || ''],
    });
  }

  /**
 * Called when the form is submitted.
 * Sends a PUT request to update the report record based on whether it is a telecom or wireless report.
 * On success, closes the dialog and returns updated data.
 */
  onSubmit(): void {
    if (this.teleReportForm.valid) {
      const url = this.data.from == 'telecom' ? `telecomReports/updateById/${this.details?.id}` : `wirelessReports/updateById/${this.details?.id}`;
      this.apiService.put<ApiResponse<any>>(url, this.teleReportForm.value).subscribe({
        next: (res) => {
          this.dialogRef.close([true, res]);
          this.snackbarService.open('success', SNACKBAR_MESSAGES.TELECOM_UPDATED);
        },
        error: (err) => {
          this.snackbarService.open('error', err.error);
        }
      });
    }
  }
}
