import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material/material.module';
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { StorageService } from '../../../core/services/storage/storage.service';
import { User } from '../../../core/models/user.model';


/**
 * 
 * @param control - The form control group containing the new password and confirm password fields.
 * @returns 
 */
export const passwordMismatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) {
    return null;
  }

  // If passwords match, ensure any existing 'passwordMismatch' error is removed
  if (newPassword.value === confirmPassword.value) {
    if (confirmPassword.hasError('passwordMismatch')) {
      const { passwordMismatch, ...errors } = confirmPassword.errors || {};
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  } else {
    // If they don't match, set the error on the confirmPassword control
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
  }

  return null;
};

/**
 * Validator to check if the new password is the same as the old password.
 * 
 * @param control - The form control group containing the old and new password fields.
 * @returns ValidationErrors or null
 */
export const oldPasswordSameAsNewValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const oldPassword = control.get('oldPassword');
  const newPassword = control.get('newPassword');

  if (!oldPassword || !newPassword || !newPassword.value) {
    return null;
  }

  // If new password is the same as old, set an error on the newPassword control
  if (oldPassword.value === newPassword.value) {
    newPassword.setErrors({ ...newPassword.errors, sameAsOld: true });
  } else {
    // Otherwise, ensure the error is removed
    if (newPassword.hasError('sameAsOld')) {
      const { sameAsOld, ...errors } = newPassword.errors || {};
      newPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  return null;
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  hideTem = true;
  hideNew = true;
  hideConfirm = true;
  private currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private storageService: StorageService
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$')
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: [passwordMismatchValidator, oldPasswordSameAsNewValidator]
    });
  }

  /**
   * Initializes the component and checks if the user is logged in.
   * If not, it shows an error message and closes the dialog.
   */
  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();
    if (!this.currentUser || !this.currentUser.email) {
      this.snackbarService.open('error', 'User information not found. Please log in again.');
      this.dialogRef.close();
    }
  }

  /**
   * Returns the error message for a given form control.
   * @param controlName - The name of the form control.
   * @returns The error message string.
   */
  getErrorMessage(controlName: string): string {
    const control = this.changePasswordForm.get(controlName);

    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return `Password must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    // ADD THIS BLOCK to handle the new pattern error
    if (control?.hasError('pattern')) {
      return 'Must contain one uppercase and special char';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    if (control?.hasError('sameAsOld')) {
      return 'New password must differ from old password.';
    }

    return '';
  }

  /**
   * Submits the change password form.
   * If the form is valid, it calls the changePassword method.
   * If not, it marks all controls as touched to show validation errors.
   */
  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.changePassword();
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  /**
   * Changes the user's password by sending a request to the API.
   * If successful, it shows a success message and closes the dialog.
   * If there's an error, it shows an error message.
   */
  changePassword(): void {
    if (!this.changePasswordForm.valid) return;

    const payload = {
      email: this.currentUser?.email,
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword
    };

    const url = 'auth/change-password';
    this.apiService.post(url, payload).subscribe({
      next: () => {
        this.snackbarService.open('success', SNACKBAR_MESSAGES.PASSWORD_CHANGE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: (err) => {
        const errorMessage = err.error?.message || SNACKBAR_MESSAGES.SOMETHING_WENT_WRONG;
        this.snackbarService.open('error', errorMessage);
        console.error('Error changing password:', err);
      }
    });
  }
}