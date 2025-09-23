import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/material/material.module';
import { AddButtonComponent } from "../../../shared/common-btn/add-button/add-button.component";
import { ApiService } from '../../../core/services/http/api.service';
import { DepartmentAccount } from '../../../core/models/department.model';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ConfirmDeleteDialogComponent } from '../../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { CONFIRM_DIALOG } from '../../../shared/constants/confirm-dialog.constants';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { of } from 'rxjs';
import { DepartmentFormDialogComponent } from './department-form-dialog/department-form-dialog.component';
import { FileUploadDialogComponent } from './file-upload-dialog/file-upload-dialog.component';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, MaterialModule, AddButtonComponent, FilterInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './department.component.html',
  styleUrl: './department.component.less'
})
export class DepartmentComponent implements AfterViewInit {

  departments: DepartmentAccount[] = [];
  accessType: string = 'WRITE';
  displayedColumns: string[] = ['foundationAccountNumber', 'departmentAccountNumber', 'department', 'createdBy', 'actions'];
  firstNetDataSource = new MatTableDataSource<DepartmentAccount>();
  attDataSource = new MatTableDataSource<DepartmentAccount>();
  verizonDataSource = new MatTableDataSource<DepartmentAccount>();

  @ViewChild('firstNetPaginator') firstNetPaginator!: MatPaginator;
  @ViewChild('attPaginator') attPaginator!: MatPaginator;
  @ViewChild('verizonPaginator') verizonPaginator!: MatPaginator;

  @ViewChild('firstNetSort') firstNetSort!: MatSort;
  @ViewChild('attSort') attSort!: MatSort;
  @ViewChild('verizonSort') verizonSort!: MatSort;

  filterValue: string = '';
  selectedTabIndex = 0;

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getDepartments('FirstNet');
  }

  ngAfterViewInit() {
    this.firstNetDataSource.paginator = this.firstNetPaginator;
    this.firstNetDataSource.sort = this.firstNetSort;

    this.attDataSource.paginator = this.attPaginator;
    this.attDataSource.sort = this.attSort;

    this.verizonDataSource.paginator = this.verizonPaginator;
    this.verizonDataSource.sort = this.verizonSort;
  }

  /**
   * Handles tab changes to load data for the selected carrier.
   * @param event The tab change event.
   */
  onTabChanged(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    this.filterValue = '';

    // Reset filter on datasource
    const dataSource = this.getCurrentDataSource();
    dataSource.filter = '';

    const carrier = this.getCurrentProvider();
    if (dataSource.data.length === 0) {
      this.getDepartments(carrier);
    }
  }

  /**
   * Fetches department accounts for a specific carrier.
   * @param carrier The name of the carrier (e.g., 'FirstNet', 'ATT', 'Verizon').
   */
  getDepartments(carrier: string) {
    const url = `mappings/carrier/${carrier}`;
    this.apiService.get<DepartmentAccount[]>(url).subscribe({
      next: (res: ApiResponse<DepartmentAccount[]>) => {
        const dataSource = this.getCurrentDataSource();
        dataSource.data = res.data;
      },
      error: (err) => {
        console.error(`Error fetching department details for ${carrier}:`, err);
      }
    });
  }

  /**
  * Opens the file upload dialog and uploads the file for the current carrier.
  */
  openUploadDialog(): void {
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      width: '500px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const url = `mappings/upload`;
        this.apiService.post(url, result).subscribe({
          next: (res) => {
            if (res.statusCode === 201) {
              this.snackbarService.open('success', SNACKBAR_MESSAGES.DEPARTMENT_ACCOUNT_CREATED);
            } else if (res.statusCode === 200) {
              this.snackbarService.open('info', SNACKBAR_MESSAGES.DEPARTMENT_ACCOUNT_NOT_CREATED);
            } else {
              this.snackbarService.open('error', SNACKBAR_MESSAGES.DEPARTMENT_ACCOUNT_CREATION_FAILED);
            }
            const carrier = (result as FormData).get('carrier') as string;
            this.selectedTabIndex = this.getTabIndexByCarrier(carrier);
            this.getDepartments(carrier);
          },
          error: (err) => {
            console.error('Upload failed:', err);
            const errorMessage = err.error?.message || 'An unknown error occurred during file upload.';
            this.snackbarService.open('error', errorMessage);
          }
        });
      }
    });
  }

  /**
   * Applies a filter to the data source of the currently active tab.
   * @param event The filter string.
   */
  applyFilter(event: string) {
    const filterValue = event.trim().toLowerCase();
    const dataSource = this.getCurrentDataSource();
    dataSource.filter = filterValue;

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  /** Opens the dialog to create a new department account.
   * After the dialog is closed, it refreshes the department list if a new account was created.
   */
  createDepartment() {
    const carrier = this.getCurrentProvider();
    const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
      width: '800px',
      panelClass: 'custom-dialog-position',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedTabIndex = this.getTabIndexByCarrier(result.carrier);
        this.getDepartments(result.carrier);
      }
    });
  }

  /** Opens the dialog to edit an existing department account.
   * After the dialog is closed, it refreshes the department list if the account was updated.
   * @param department The department account to edit.
   */
  editDepartment(department: DepartmentAccount) {
    const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
      width: '800px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: department
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDepartments(this.getCurrentProvider());
      }
    });
  }

  /** Opens a confirmation dialog to delete a department account.
   * If confirmed, it deletes the account and refreshes the list.
   * @param department The department account to delete.
   */
  deleteDepartment(department: DepartmentAccount) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: {
        title: CONFIRM_DIALOG.DELETE_DEPARTMENT_ACCOUNT.TITLE,
        message: CONFIRM_DIALOG.DELETE_DEPARTMENT_ACCOUNT.MESSAGE
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const url = `mappings/${department.id}`;
        this.apiService.delete(url).subscribe({
          next: () => {
            this.snackbarService.open('success', SNACKBAR_MESSAGES.DEPARTMENT_ACCOUNT_DELETED);
            this.getDepartments(this.getCurrentProvider());
          },
          error: (err) => {
            this.snackbarService.open('error', SNACKBAR_MESSAGES.DEPARTMENT_ACCOUNT_DELETED_FAILED);
            console.error('Error deleting department:', err);
          }
        });
      }
    });
  }

  /**
   * Returns the carrier name based on the selected tab index.
   */
  private getCurrentProvider(): string {
    switch (this.selectedTabIndex) {
      case 0: return 'FirstNet';
      case 1: return 'AT&T Mobility';
      case 2: return 'Verizon Wireless';
      default: return 'FirstNet';
    }
  }

  /**
   * Returns the data source for the currently selected tab.
   */
  private getCurrentDataSource(): MatTableDataSource<DepartmentAccount> {
    switch (this.selectedTabIndex) {
      case 0: return this.firstNetDataSource;
      case 1: return this.attDataSource;
      case 2: return this.verizonDataSource;
      default: return this.firstNetDataSource;
    }
  }

  /** Returns the tab index based on the carrier name.
   * @param carrier The name of the carrier.
   */
  private getTabIndexByCarrier(carrier: string): number {
    switch (carrier) {
      case 'FirstNet': return 0;
      case 'AT&T Mobility': return 1;
      case 'Verizon Wireless': return 2;
      default: return 0;
    }
  }

}