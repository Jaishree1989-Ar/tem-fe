import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forgotPasswordConstants } from '../../../shared/constants/constants';
import { MaterialModule } from '../../../shared/material/material.module';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ApiService } from '../../../core/services/http/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.less'
})

/**
 * ForgotPasswordComponent
 *
 * Displays a form for users to enter their email to receive a password reset link.
 * Uses reactive forms with validation.
 * Navigates back to the login page if needed.
 */
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  forgotPasswordConstants = forgotPasswordConstants;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private snackbarService: SnackbarService,) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
 * Called when user submits the form.
 * If form is valid, logs the email (simulate API call).
 */
  submitForgot() {
    if (this.forgotForm.invalid) {
      return;
    }

    const email = this.forgotForm.value.email;

    this.apiService.requestPasswordReset(email).subscribe({
      next: (res: ApiResponse<string>) => {
        this.snackbarService.open('success', 'Password reset email sent successfully. Please check your email.');
        sessionStorage.setItem('resetEmail', email);
        this.router.navigate(['/reset-password'], { queryParams: { email: email } });
      },
      error: (error) => {
        console.error('Error sending password reset link:', error);
        const errorMessage = error.error?.message || 'Failed to send reset link. Please try again.';
        this.snackbarService.open('error', errorMessage);
      },
    });
  }
  
  /**
 * Navigates user back to the login page.
 */
  routeToLogin() {
    this.router.navigate(['/login']); // Adjust route as needed
  }
}
