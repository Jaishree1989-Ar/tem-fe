import { ChangeDetectionStrategy, Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/material/material.module';
import { AddButtonComponent } from "../../../shared/common-btn/add-button/add-button.component";
import { ApiService } from '../../../core/services/http/api.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ConfirmDeleteDialogComponent } from '../../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { CONFIRM_DIALOG } from '../../../shared/constants/confirm-dialog.constants';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, MaterialModule, AddButtonComponent, FilterInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user.component.html',
  styleUrl: './user.component.less'
})

/**
 * Component responsible for managing users.
 * Allows viewing, filtering, creating, editing, and deleting users.
 */
export class UserComponent implements OnInit, AfterViewInit {

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private snackbarService: SnackbarService
  ) { }

  users: User[] = [];
  accessType: string = 'READ';
  displayedColumns: string[] = ['userName', 'email', 'phoneNumber', 'role', 'city', 'department', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterValue: string = '';
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.getAllUsers();
    this.accessType = this.storageService.getMenu()
      .find((me: { menuName: string }) => me.menuName === "Management")
      ?.menu.find((li: { text: string }) => li.text === "User")
      ?.accessType || 'READ';
  }

  /**
    * Fetches all users from the backend and updates the table.
    */
  getAllUsers() {
    const url = `user/getAllUsers`;
    this.apiService.get<User[]>(url).subscribe({
      next: (res: ApiResponse<User[]>) => {
        this.users = res.data;

        const transformedData = this.users.map(user => ({
          userId: user.userId,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isDeleted: user.isDeleted,
          cityId: user.city ? user.city.cityId : null,
          cityName: user.city ? user.city.cityName : null,
          deptId: user.department ? user.department.deptId : null,
          deptName: user.department ? user.department.deptName : null,
          roleId: user.role ? user.role.roleId : null,
          roleName: user.role ? user.role.roleName : null
        }));

        this.dataSource.data = transformedData;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
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

     // Add custom sorting for nested properties
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'role': return item.roleName;
        case 'city': return item.cityName;
        case 'department': return item.deptName;
        default: return item[property];
      }
    };
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
  * Applies keyword-based filtering on the table data.
  * @param event The filter text input by the user.
  */
  applyFilter(event: string) {
    const filterValue = event.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
 * Opens the user form dialog to create a new user.
 * On success, the new user is added to the table.
 */
  createUser() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '800px',
      panelClass: 'custom-dialog-position'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUsers();
      }
    });
  }

  /**
* Opens the user form dialog to edit an existing user.
* Updates the user in the table after saving.
* 
* @param user The user object to be edited.
*/
  editUser(user: User) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '800px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUsers();
      }
    });
  }

  /**
   * Opens a confirmation dialog to delete a user.
   * If confirmed, deletes the user via API and updates the table.
   * 
   * @param user The user object to be deleted.
   */
  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: {
        title: CONFIRM_DIALOG.DELETE_USER.TITLE,
        message: CONFIRM_DIALOG.DELETE_USER.MESSAGE
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const url = `user/deleteUserById/${user.userId}`;
        this.apiService.delete(url).subscribe({
          next: (res: ApiResponse<any>) => {
            this.snackbarService.open('success', SNACKBAR_MESSAGES.USER_DELETED);
          },
          error: (err) => {
            this.snackbarService.open('error', SNACKBAR_MESSAGES.USER_DELETED_FAILED);
            console.error('Error deleting user:', err);
          }
        });
        const index = this.dataSource.data.indexOf(user);
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }
}