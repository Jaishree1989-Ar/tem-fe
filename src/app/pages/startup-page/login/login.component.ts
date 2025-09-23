import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loginConstants } from '../../../shared/constants/constants';
import { MaterialModule } from '../../../shared/material/material.module';
import { ApiService } from '../../../core/services/http/api.service';
import { User } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StorageService } from '../../../core/services/storage/storage.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})

/**
 * LoginComponent handles user authentication.
 * 
 * Features:
 * - Login form with email and password validation
 * - API integration for login
 * - Shows appropriate snackbar notifications
 * - Stores user details and login status in local storage
 * - Redirects to dashboard on successful login
 */
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  hide = true;
  loginConstants = loginConstants;
  user!: User;
  constructor(private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private storageService: StorageService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Submits login credentials to the API.
   * On success:
   * - Shows success snackbar
   * - Stores user email and login status in local storage
   * - Updates user object in storage service
   * - Navigates to dashboard
   * 
   * On error:
   * - Shows appropriate snackbar message based on error
   */
  login() {
    if (this.loginForm.valid) {
      let url = `auth/login`;

      this.apiService.post<any>(url, this.loginForm.value).subscribe(
        {
          next: (res: ApiResponse<User>) => {
            if (res != null) {
              this.snackbarService.open('success', SNACKBAR_MESSAGES.LOGIN_SUCCESS);
              this.user = res.data;
              this.storageService.setDataInLocal(true, 'email', this.user.email);
              this.storageService.setDataInLocal(true, 'isLoggedIn', JSON.stringify(true));
              // this.storageService.saveUser(this.user);
              this.storageService.setUser(this.user);
              this.router.navigate(['/app/dashboard']);
            }
          },
          error: (err) => {
            switch (err.error) {
              case 'Invalid password':
                this.snackbarService.open('error', SNACKBAR_MESSAGES.LOGIN_INTERNAL_PASSWORD);
                break;
              case 'User not found':
                this.snackbarService.open('error', SNACKBAR_MESSAGES.LOGIN_INTERNAL_EMAIL);
                break;
              default:
                this.snackbarService.open('error', SNACKBAR_MESSAGES.SOMETHING_WENT_WRONG);
            }
          }
        }
      )
    }
  }

  /**
  * Prevents default click and toggles `hide` flag.
  * Used for password visibility toggle.
  */
  clickEvent(event: Event): void {
    event.preventDefault();
    this.hide = !this.hide;
  }

  /**
  * Navigates the user to Forgot Password screen.
  */
  routeToForgot(): void {
    this.router.navigate(['/forgot-password']);
  }
}
