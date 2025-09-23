import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.less'
})

/**
 * ConfirmDeleteDialogComponent
 *
 * A reusable Angular Material dialog to confirm deletion actions.
 * Accepts title and message via `MAT_DIALOG_DATA` and returns true/false upon user action.
 */
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    /** Data passed to dialog containing optional title and message */
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string }
  ) { }

  /**
 * Called when the user cancels the dialog.
 * Closes the dialog and returns `false`.
 */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
  * Called when the user confirms deletion.
  * Closes the dialog and returns `true`.
  */
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
