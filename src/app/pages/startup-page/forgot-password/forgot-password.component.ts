import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forgotPasswordConstants } from '../../../shared/constants/constants';
import { MaterialModule } from '../../../shared/material/material.module';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ApiService } from '../../../core/services/http/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.less']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  forgotPasswordConstants = forgotPasswordConstants;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private snackbarService: SnackbarService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitForgot() {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotForm.value.email;

    this.apiService.requestPasswordReset(email ).subscribe({
      next: (res: ApiResponse<any>) => {
        this.snackbarService.open('success', res.message);
        sessionStorage.setItem('resetEmail', email);
        this.router.navigate(['/reset-password']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to send reset link. Please try again.';
        this.snackbarService.open('error', errorMessage);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  routeToLogin() {
    this.router.navigate(['/login']);
  }
}