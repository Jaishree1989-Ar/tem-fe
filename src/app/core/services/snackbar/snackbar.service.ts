import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../../shared/components/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})

/**
 * SnackbarService
 *
 * A centralized service to display custom snackbar notifications using Angular Material.
 * It uses a reusable `CustomSnackbarComponent` to show styled messages for different types: 
 * success, error, warning, info, and neutral.
 *
 * Features:
 * - Customizable icon and title based on message type.
 * - Positions snackbar at the top-center by default.
 * - Displays snackbars with a transparent panel class.
 *
 * Dependencies:
 * - Angular Material `MatSnackBar`
 * - `CustomSnackbarComponent` for custom UI
 */
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  /**
  * Displays a snackbar with specified type and message.
  *
  * @param type - Type of the message (`success`, `error`, `warning`, `info`, or `neutral`).
  * @param message - The message content to display.
  */
  open(type: 'neutral' | 'info' | 'success' | 'warning' | 'error', message: string) {
    const icon = type === 'success' ? 'check_circle' :
                 type === 'error' ? 'error' :
                 type === 'warning' ? 'warning' :
                 'info';

    const title = type === 'success' ? 'Success' :
                  type === 'error' ? 'Error' :
                  type === 'warning' ? 'Warning' :
                  'Info';

    const ref = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { type, title, message, icon, snackBarRef: this.snackBar },
      duration: 3000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['transparent-snackbar']
    });
  }
}
