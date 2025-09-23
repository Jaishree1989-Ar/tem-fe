import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/material/material.module';
import { AddButtonComponent } from "../../../shared/common-btn/add-button/add-button.component";
import { ApiService } from '../../../core/services/http/api.service';
import { Role } from '../../../core/models/role.model';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { RoleFormDialogComponent } from './role-form-dialog/role-form-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ConfirmDeleteDialogComponent } from '../../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { CONFIRM_DIALOG } from '../../../shared/constants/confirm-dialog.constants';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";


@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, MaterialModule, AddButtonComponent, MatChipsModule, FilterInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role.component.html',
  styleUrl: './role.component.less'
})

/**
 * Component responsible for managing user roles.
 * Allows viewing, filtering, creating, editing, and deleting roles.
 */
export class RoleComponent {

  constructor(private apiService: ApiService, private storageService: StorageService, private snackbarService: SnackbarService) {
    this.storageService.setDataInLocal(true, 'isLoggedIn', JSON.stringify(true));
  }

  roles: Role[] = [];
  accessType: string = 'READ';
  displayedColumns: string[] = ['roleName', 'moduleAccessList', 'description', 'actions'];
  dataSource: MatTableDataSource<Role> = new MatTableDataSource<Role>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterValue: string = '';
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.getAllRoles();
    this.accessType = this.accessType = this.storageService.getMenu()
      .find((me: { menuName: string }) => me.menuName === "Management")
      ?.menu.find((li: { text: string }) => li.text === "Role")
      ?.accessType;
  }


  /**
   * Clears the filter input field and resets the table filter.
   * @param input The HTML input element.
   */
  clearFilter(input: HTMLInputElement) {
    input.value = '';
    this.filterValue = '';
    this.applyFilter({ target: input } as any);
  }

  /**
  * Fetches all roles from the backend and updates the table.
  */
  getAllRoles() {
    let url = `role/getAllRoles`;
    this.apiService.get<Role[]>(url).subscribe({
      next: (res: ApiResponse<Role[]>) => {
        this.roles = res.data;
        this.dataSource.data = this.roles;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Angular lifecycle hook called after the view is initialized.
 * Assigns paginator and sorting to the table.
 */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
 * Applies keyword-based filtering on the table data.
 * @param event The filter text input by the user.
 */
  applyFilter(event: string) {
    this.dataSource.filter = event.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
 * Opens the role form dialog to create a new role.
 * On success, the new role is added to the table.
 */
  createRole() {
    const dialogRef = this.dialog.open(RoleFormDialogComponent,
      {
        width: '800px',
        panelClass: 'custom-dialog-position'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data.unshift(result);
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  /**
 * Opens the role form dialog to edit an existing role.
 * Updates the role in the table after saving.
 * 
 * @param role The role object to be edited.
 */
  editRole(role: Role) {
    const dialogRef = this.dialog.open(RoleFormDialogComponent,
      {
        width: '800px',
        panelClass: 'custom-dialog-position',
        autoFocus: false,
        data: role
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const data = this.dataSource.data;
        const index = data.findIndex(r => r.roleId === result.roleId);
        if (index !== -1) {
          data.splice(index, 1);
          this.dataSource.data = [result, ...data];
        }
      }
    });
  }

  /**
   * Opens a confirmation dialog to delete a role.
   * If confirmed, deletes the role via API and updates the table.
   * 
   * @param role The role object to be deleted.
   */
  deleteRole(role: Role) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: {
        title: CONFIRM_DIALOG.DELETE_ROLE.TITLE,
        message: CONFIRM_DIALOG.DELETE_ROLE.MESSAGE
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const url = `role/deleteRoleById/${role.roleId}`;
        this.apiService.delete(url).subscribe({
          next: (res: ApiResponse<any>) => {
            this.snackbarService.open('success', SNACKBAR_MESSAGES.ROLE_DELETED);
          },

          error: (err) => {
            this.snackbarService.open('error', SNACKBAR_MESSAGES.ROLE_DELETED_FAILED);
            console.error('Error deleting role:', err);
          }
        });
        const index = this.dataSource.data.indexOf(role);
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

}