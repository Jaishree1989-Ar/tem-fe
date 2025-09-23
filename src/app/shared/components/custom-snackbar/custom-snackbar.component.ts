import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.less'
})

/**
 * CustomSnackbarComponent
 *
 * A reusable Angular Material snackbar component for displaying styled notifications.
 * Accepts data via `MAT_SNACK_BAR_DATA` and shows:
 *
 * Used by `SnackbarService` to show different types of alerts (success, error, info, etc.)
 *
 * Expected `data` object structure:
 * {
 *   type: 'success' | 'error' | 'info' | 'warning' | 'neutral',
 *   title: string,
 *   message: string,
 *   icon: string,
 *   snackBarRef: MatSnackBar // for manual dismissal
 * }
 */
export class CustomSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
