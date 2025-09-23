import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/http/api.service';
import { User, Users } from '../../../../core/models/user.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';
import { Role } from '../../../../core/models/role.model';
import { City } from '../../../../core/models/city.model';
import { Department } from '../../../../core/models/department.model';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.less'
})

/**
 * Dialog component for creating or editing a User.
 * Provides a form to manage user name, email, phone number, role, city and department.
 */
export class UserFormDialogComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode: boolean = false;

  roles: Role[] = [];
  cities: City[] = [];
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data?: Users
  ) { }

  /**
   * Angular lifecycle hook called after component initialization.
   * Initializes the form and loads dropdown data (roles, cities, departments).
   */
  ngOnInit(): void {

    this.isEditMode = !!this.data;

    this.userForm = this.fb.group({
      userName: [this.data?.userName || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.data?.phoneNumber || '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      roleId: [this.data?.roleId || null, Validators.required],
      cityId: [this.data?.cityId || null, Validators.required],
      deptId: [this.data?.deptId || null, Validators.required]
    });

    this.loadRoles();
    this.loadCities();
    this.loadDepartments();
  }

  /**
   * Loads the list of available roles from the API and assigns them to the component.
   */
  loadRoles() {
    this.apiService.get<Role[]>('role/getAllRoles').subscribe({
      next: (res: ApiResponse<Role[]>) => {
        this.roles = res.data;
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  /**
   * Loads the list of available departments from the API and assigns them to the component.
   */
  loadDepartments() {
    this.apiService.get<Department[]>('department/getAll').subscribe({
      next: (res: ApiResponse<Department[]>) => {
        this.departments = res.data;
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  /**
   * Loads the list of available cities from the API and assigns them to the component.
   */
  loadCities() {
    this.apiService.get<City[]>('city/getAll').subscribe({
      next: (res: ApiResponse<City[]>) => {
        this.cities = res.data;
      },
      error: (err) => console.error('Failed to load cities', err)
    });
  }

  /**
   * Submits the form data to the API to either create or update a user.
   * Shows success or error messages based on the API response.
   */
  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      const url = this.isEditMode
        ? `user/updateUserById/${this.data?.userId}`
        : `user/createUser`;

      const request = this.isEditMode
        ? this.apiService.put<ApiResponse<User>>(url, formValue)
        : this.apiService.post<ApiResponse<User>>(url, formValue);

      request.subscribe({
        next: (res) => {
          this.dialogRef.close(res);
          this.snackbarService.open('success', this.isEditMode ? SNACKBAR_MESSAGES.USER_UPDATED : SNACKBAR_MESSAGES.USER_CREATED);
        },
        error: (err) => {
          this.snackbarService.open('error', err.error);
        }
      });
    } else {
      this.snackbarService.open('error', SNACKBAR_MESSAGES.USER_CREATION_NO_DATA_ERROR);
    }
  }
}