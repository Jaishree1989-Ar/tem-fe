import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/http/api.service';
import { Role } from '../../../../core/models/role.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './role-form-dialog.component.html',
  styleUrl: './role-form-dialog.component.less'
})

/**
 * Dialog component for creating or editing a Role.
 * Provides a form to manage role name, description, and associated module access configurations.
 */
export class RoleFormDialogComponent {
  roleForm!: FormGroup;
  isEditMode: boolean = false;

  moduleOptions = ['Dashboard', 'Invoices', 'Telecom Reports', 'Wireless Reports', 'User', 'Role', 'Manage Data', 'Inventory', 'Manage Dept', 'Wired Reports'];
  accessTypes = ['READ', 'WRITE'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<RoleFormDialogComponent>,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data?: Role
  ) { }

  /**
 * Angular lifecycle hook called after component initialization.
 * Initializes the form and populates module access if in edit mode.
 */
  ngOnInit(): void {
    this.isEditMode = !!this.data;

    this.roleForm = this.fb.group({
      roleName: [this.data?.roleName || '', [Validators.required]],
      description: [this.data?.description || ''],
      moduleAccessList: this.fb.array([])
    });

    if (this.isEditMode && this.data?.moduleAccessList?.length) {
      this.data.moduleAccessList.forEach(module => {
        this.moduleAccessList.push(this.fb.group({
          moduleName: [module.moduleName, Validators.required],
          accessType: [module.accessType || 'READ']
        }));
      });
    } else {
      this.moduleAccessList.push(this.createModuleAccessFormGroup());
    }
  }

  /**
 * Creates a new FormGroup for a module access entry.
 * @returns FormGroup with moduleName and accessType.
 */
  createModuleAccessFormGroup(): FormGroup {
    return this.fb.group({
      moduleName: ['', Validators.required],
      accessType: ['READ']
    });
  }

  /**
 * Getter for the moduleAccessList FormArray inside the roleForm.
 */
  get moduleAccessList(): FormArray {
    return this.roleForm.get('moduleAccessList') as FormArray;
  }

  /**
   * Adds a new blank module access row to the form.
   */
  addModuleAccess(): void {
    this.moduleAccessList.push(this.createModuleAccessFormGroup());
  }

  /**
 * Removes a module access row by index.
 * @param index Index of the module to remove.
 */
  removeModuleAccess(index: number): void {
    this.moduleAccessList.removeAt(index);
  }

  /**
 * Checks if a module is already selected in another row.
 * Prevents duplicate module selection.
 * 
 * @param moduleName Module name to check.
 * @param currentIndex Index of the current module form row.
 * @returns True if the module name is already selected in another row.
 */
  isModuleSelected(moduleName: string, currentIndex: number): boolean {
    return this.moduleAccessList.controls.some((group, index) => {
      return index !== currentIndex && group.get('moduleName')?.value === moduleName;
    });
  }

  /**
   * Determines if the Add Module button should be disabled.
   * Prevents adding more rows if all modules are already selected.
   * @returns True if all module options have been selected.
   */
  isAddDisabled(): boolean {
    const selectedModules = this.moduleAccessList.controls.map(ctrl => ctrl.get('moduleName')?.value);
    return this.moduleOptions.every(module => selectedModules.includes(module));
  }

  /**
 * Submits the form to either create or update a role.
 * On success, closes the dialog and returns the result to parent.
 * On failure, shows an error snackbar.
 */
  onSubmit(): void {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const url = this.isEditMode ? `role/updateRoleById/${this.data?.roleId}` : `role/createRole`;

      const request = this.isEditMode
        ? this.apiService.put<ApiResponse<Role>>(url, formValue)
        : this.apiService.post<ApiResponse<Role>>(url, formValue);

      request.subscribe({
        next: (res) => {
          this.dialogRef.close(res.data);
          this.snackbarService.open('success', this.isEditMode ? SNACKBAR_MESSAGES.ROLE_UPDATED : SNACKBAR_MESSAGES.ROLE_CREATED);
        },
        error: (err) => {
          this.snackbarService.open('error', err.error);
        }
      });
    } else {
      this.snackbarService.open('error', SNACKBAR_MESSAGES.ROLE_CREATION_NO_DATA_ERROR);
    }
  }
}
