import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.less'
})
export class ConfirmationDialogComponent {
  rejectionReason: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string; confirmText?: string; cancelText?: string }
  ) { }

  onConfirm(): void {
     if (this.data.title === 'Confirm Rejection' && !this.rejectionReason.trim()) {
      return;
    }
    this.dialogRef.close({
      confirmed: true,
      rejectionReason: this.rejectionReason.trim()
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
