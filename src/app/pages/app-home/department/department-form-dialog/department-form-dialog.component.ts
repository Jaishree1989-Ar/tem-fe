import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Assuming you have a shared material module
import { MaterialModule } from '../../../../shared/material/material.module';
import { ApiService } from '../../../../core/services/http/api.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';
import { DepartmentData } from '../../../../core/models/department.model';
import { User } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/services/storage/storage.service';

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './department-form-dialog.component.html',
  styleUrl: './department-form-dialog.component.less'
})

export class DepartmentFormDialogComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode: boolean = false;
  distinctCars: string[] = [];
  private uploadedByUsername: string = 'System';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<DepartmentFormDialogComponent>,
    private snackbarService: SnackbarService,
    private storageService: StorageService,
    @Inject(MAT_DIALOG_DATA) public data?: DepartmentData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data;

    this.departmentForm = this.fb.group({
      foundationAccountNumber: [
        this.data?.foundationAccountNumber || '',
        [Validators.required, Validators.pattern(/^[0-9]*$/)]
      ],
      departmentAccountNumber: [
        this.data?.departmentAccountNumber || '',
        [Validators.required, Validators.pattern(/^[0-9]*$/)]
      ],
      department: [this.data?.department || '', Validators.required],
      carrier: [this.data?.carrier || null, Validators.required]
    });

    this.getDistinctCarriers();
    this.setCurrentUser();
  }

  /**
   * Loads the list of distinct carriers from the API for the dropdown.
   */
  getDistinctCarriers(): void {
    const url = `telecomReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.data && res.data.carriers) {
          this.distinctCars = res.data.carriers;
        }
      },
      error: (err) => {
        console.error('Error fetching carriers:', err);
        this.snackbarService.open('error', 'Failed to load carriers.');
      }
    });
  }

  /**
   * Sets the current user information for the form.
   */
  setCurrentUser(): void {
    const currentUser: User | null = this.storageService.getUser();
    if (currentUser?.userName) {
      this.uploadedByUsername = currentUser.userName;
    }
  }

  /**
   * Submits the form data to create or update a department.
   */
  onSubmit(): void {
    if (this.departmentForm.valid) {
      const formValue = this.departmentForm.value;
      const payload: any = {
        ...formValue,
        uploadedByUsername: this.uploadedByUsername
      };

      if (!this.isEditMode) {
        payload.createdBy = this.uploadedByUsername;
      }

      const url = this.isEditMode
        ? `mappings/${this.data?.id}`
        : `mappings`;

      const request = this.isEditMode
        ? this.apiService.put<ApiResponse<any>>(url, payload)
        : this.apiService.post<ApiResponse<any>>(url, payload);

      request.subscribe({
        next: (res) => {
          this.snackbarService.open('success', this.isEditMode ? SNACKBAR_MESSAGES.DEPARTMENT_UPDATED : SNACKBAR_MESSAGES.DEPARTMENT_CREATED);
          this.dialogRef.close({ ...res, carrier: formValue.carrier });
        },
        error: (err) => {
          this.snackbarService.open('error', err.error?.message || 'An unknown error occurred.');
        }
      });
    } else {
      this.snackbarService.open('error', SNACKBAR_MESSAGES.INVALID_FORM);
    }
  }
}