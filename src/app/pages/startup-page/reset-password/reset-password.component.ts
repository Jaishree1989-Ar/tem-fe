import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { resetPasswordConstants } from '../../../shared/constants/constants';
import { MaterialModule } from '../../../shared/material/material.module';
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ApiResponse } from '../../../core/models/api-response.model';

/**
 * Component responsible for handling the reset password functionality.
 * Provides a form for users to input their temporary password, new password, and confirm it.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.less'
})
export class ResetPasswordComponent implements OnInit {

  changePasswordForm!: FormGroup;
  hideNew = true;
  hideConfirm = true;
  hideTem = true;
  resetPasswordConstants = resetPasswordConstants;
  userEmail: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private snackbarService: SnackbarService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.userEmail = params['email'];
      } else {
        this.userEmail = sessionStorage.getItem('resetEmail') || '';
      }
    });
  }

  private initializeForm() {
    this.changePasswordForm = this.fb.group({
      temporaryPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  /**
   * Custom validator to check if new password and confirm password match
   * @param formGroup The form group to validate
   * @returns Validation error object or null
   */
  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  /**
   * Checks if the new password and confirm password fields do not match
   * @returns True if the passwords do not match, false otherwise
   */
  passwordsDoNotMatch(): boolean {
    const form = this.changePasswordForm;
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    return !!(newPassword?.value && confirmPassword?.value &&
      newPassword.value !== confirmPassword.value);
  }

  /**
   * Validates if the new password is different from temporary password
   * @returns True if passwords are the same, false otherwise
   */
  newPasswordSameAsTemporary(): boolean {
    const form = this.changePasswordForm;
    const tempPassword = form.get('temporaryPassword')?.value;
    const newPassword = form.get('newPassword')?.value;

    return !!(tempPassword && newPassword && tempPassword === newPassword);
  }

  /**
   * Submits the form to change the password if form is valid
   */
  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.passwordsDoNotMatch()) {
      this.snackbarService.open('error', 'Passwords do not match');
      return;
    }

    if (this.newPasswordSameAsTemporary()) {
      this.snackbarService.open('error', 'New password must be different from temporary password');
      return;
    }

    if (!this.userEmail) {
      this.snackbarService.open('error', 'Email not found. Please start the password reset process again.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.isLoading = true;

    const resetData = {
      email: this.userEmail,
      temporaryPassword: this.changePasswordForm.value.temporaryPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };

    this.apiService.resetPassword(resetData).subscribe({
      next: (res: ApiResponse<string>) => {
        this.snackbarService.open('success', 'Password reset successful! You can now login with your new password.');
        sessionStorage.removeItem('resetEmail');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error resetting password:', error);
        const errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        this.snackbarService.open('error', errorMessage);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Marks all form controls as touched to show validation errors
   */
  private markFormGroupTouched() {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      const control = this.changePasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Navigate back to login page
   */
  backToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate back to forgot password page
   */
  backToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}