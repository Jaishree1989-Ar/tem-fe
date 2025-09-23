import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AddButtonComponent } from "../../../shared/common-btn/add-button/add-button.component";
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../shared/material/material.module';
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { MatDialog } from '@angular/material/dialog';
import { UploadInvoiceComponent } from './upload-invoice/upload-invoice.component';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { InvoiceHistory } from '../../../core/models/invoice-history';
import { ConfirmDeleteDialogComponent } from '../../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { CONFIRM_DIALOG } from '../../../shared/constants/confirm-dialog.constants';
import { ViewInvoiceDialogComponent } from './view-invoice-dialog/view-invoice-dialog.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { StorageService } from '../../../core/services/storage/storage.service';
import { User } from '../../../core/models/user.model';
import { InventoryHistory } from '../../../core/models/inventory-history';
import { ViewInventoryDialogComponent } from './view-inventory-dialog/view-inventory-dialog.component';

@Component({
  selector: 'app-invoice-data-upload',
  standalone: true,
  providers: [DatePipe],
  imports: [CommonModule, MaterialModule, FilterInputComponent],
  templateUrl: './invoice-data-upload.component.html',
  styleUrl: './invoice-data-upload.component.less'
})

/**
 * Component for handling invoice data file uploads.
 * Supports drag-and-drop or file picker upload, file type validation, size display,
 * and initiates the upload process via a modal dialog.
 */
export class InvoiceDataUploadComponent {

  // Paginator references
  @ViewChild('paginator1') set paginator1(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }
  @ViewChild('paginator2') set paginator2(paginator: MatPaginator) {
    if (paginator) {
      this.approvalsDataSource.paginator = paginator;
    }
  }
  @ViewChild('paginator3') set paginator3(paginator: MatPaginator) {
    if (paginator) {
      this.inventoryDataSource.paginator = paginator;
    }
  }
  @ViewChild('paginator4') set paginator4(paginator: MatPaginator) {
    if (paginator) {
      this.approvalsInventoryDataSource.paginator = paginator;
    }
  }
  @ViewChild('fileUpload') fileUpload!: ElementRef<HTMLInputElement>;

  // File upload properties
  selectedFile!: File | undefined | null;
  fileName!: string;
  fileSize!: string;
  isFileHovered = false;
  distinctCars: string[] = [];
  dialog = inject(MatDialog);
  private uploadedByUsername: string = 'System';
  selectedMainTabIndex = 0;
  accessType: string = 'READ';

  // Invoice Properties
  displayedColumns: string[] = ['name', 'carrier', 'uploadedOn', 'uploadedBy'];
  dataSource: MatTableDataSource<InvoiceHistory> = new MatTableDataSource<InvoiceHistory>([]);
  approvalsDisplayedColumns: string[] = ['name', 'carrier', 'uploadedOn', 'uploadedBy', 'reviewedBy', 'status', 'actions'];
  approvalsDataSource: MatTableDataSource<InvoiceHistory> = new MatTableDataSource<InvoiceHistory>([]);
  invoiceHistoryDetails: InvoiceHistory[] = [];
  filterValue: string = '';
  approvalsFilterValue: string = '';
  selectedTabIndex: number = 0;
  pendingApprovalsCount: number = 0;

  // Inventory Properties
  inventoryDisplayedColumns: string[] = ['name', 'carrier', 'uploadedOn', 'uploadedBy'];
  inventoryDataSource: MatTableDataSource<InventoryHistory> = new MatTableDataSource<InventoryHistory>([]);
  approvalsInventoryDisplayedColumns: string[] = ['name', 'carrier', 'uploadedOn', 'uploadedBy', 'reviewedBy', 'status', 'actions'];
  approvalsInventoryDataSource: MatTableDataSource<InventoryHistory> = new MatTableDataSource<InventoryHistory>([]);
  inventoryHistoryDetails: InventoryHistory[] = [];
  filterInventoryValue: string = '';
  approvalsInventoryFilterValue: string = '';
  selectedInventoryTabIndex: number = 0;
  pendingInventoryApprovalsCount: number = 0;

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private storageService: StorageService) {
  }

  ngOnInit(): void {
    this.getDistinctDepartmentsAndCarriers();
    this.getAllInvoiceHistoryDetails();
    this.getAllInventoryHistoryDetails();
    this.setCurrentUser();
    this.accessType = this.storageService.getMenu()
      .find((me: { menuName: string }) => me.menuName === "Management")
      ?.menu.find((li: { text: string }) => li.text === "Manage Data")
      ?.accessType;
  }

  /**
 * Fetches distinct departments and carriers (used for form data).
 */
  getDistinctDepartmentsAndCarriers() {
    let url = `telecomReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        // this.distinctDepts = res.data.departments;
        this.distinctCars = res.data.carriers;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Handles drag-over event on drop area.
 * @param event Drag event
 */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = true;
  }

  /**
 * Handles drag-leave event on drop area.
 * @param event Drag event
 */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = false;
  }

  /**
 * Handles file drop event and validates the file.
 * @param event Drag event
 */
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      if (this.isValidFileType(this.selectedFile)) {
        this.fileName = this.selectedFile.name;
        this.fileSize = this.formatFileSize(this.selectedFile.size);
        // this.processFile(this.selectedFile);
      } else {
        this.removeSelectedFile();
        this.snackbarService.open('warning', SNACKBAR_MESSAGES.INVALID_FILE);
      }
    }
  }

  /**
 * Handles file selection from file input element.
 * @param event Input event containing the file
 */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0];
    if (this.selectedFile && this.isValidFileType(this.selectedFile)) {
      this.fileName = this.selectedFile.name;
      this.fileSize = this.formatFileSize(this.selectedFile.size);
      // this.processFile(this.selectedFile);
    } else {
      this.removeSelectedFile();
      this.snackbarService.open('warning', SNACKBAR_MESSAGES.INVALID_FILE);
    }
  }

  /**
     * Handles main tab change event (Invoice vs. Inventory).
     */
  onMainTabChange(event: MatTabChangeEvent) {
    this.selectedMainTabIndex = event.index;
    this.removeSelectedFile();

    this.selectedTabIndex = 0;
    this.selectedInventoryTabIndex = 0;

    this.filterValue = '';
    this.approvalsFilterValue = '';
    this.filterInventoryValue = '';
    this.approvalsInventoryFilterValue = '';
  }

  /**
   * Handles tab change event.
   * @param event Tab change event
   */
  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.filterValue = '';
      this.dataSource.filter = '';
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } else if (event.index === 1) {
      this.approvalsFilterValue = '';
      this.approvalsDataSource.filter = '';
      if (this.approvalsDataSource.paginator) {
        this.approvalsDataSource.paginator.firstPage();
      }
    }
  }

  /**
* Handles nested tab change for inventories.
*/
  onInventoryTabChange(event: MatTabChangeEvent) {
    this.selectedInventoryTabIndex = event.index;
    if (event.index === 0) {
      this.filterInventoryValue = '';
      this.inventoryDataSource.filter = '';
      if (this.inventoryDataSource.paginator) {
        this.inventoryDataSource.paginator.firstPage();
      }
    } else if (event.index === 1) {
      this.approvalsInventoryFilterValue = '';
      this.approvalsInventoryDataSource.filter = '';
      if (this.approvalsInventoryDataSource.paginator) {
        this.approvalsInventoryDataSource.paginator.firstPage();
      }
    }
  }

  /**
   * Validates the selected file type.
   * Accepts CSV, and XLSX files.
   * @param file File to validate
   * @returns Whether the file is of an allowed type
   */
  isValidFileType(file: File): boolean {
    const allowedTypes = ['text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Determines the file type string based on MIME type.
   * @returns 'csv', 'xlsx', or empty string
   */
  checkFileType() {
    if (this.selectedFile?.type.includes('csv')) {
      return 'csv';
    } else if (this.selectedFile?.type.includes('spreadsheetml.sheet')) {
      return 'xlsx';
    }
    return '';
  }

  /**
   * Converts byte value to readable KB or MB.
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  // processFile(file: File) {
  //   console.log('File received:', file);
  // }

  /**
 * Opens a dialog to handle the actual file upload.
 * Shows success snackbar and clears file info afterward.
 */
  uploadFile() {
    const dialogRef = this.dialog.open(UploadInvoiceComponent, {
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      width: '400px',
      data: this.distinctCars
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.selectedMainTabIndex === 0) {
          this.uploadInvoice(result);
        } else {
          this.uploadInventory(result);
        }
      }
    });
  }

  /**
 * Clears the current file selection and resets display fields.
 */
  removeSelectedFile() {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';

    if (this.fileUpload) {
      this.fileUpload.nativeElement.value = '';
    }
  }

  /**
 * Applies filter to the data table based on input value.
 * @param event The input string used to filter rows
 */
  applyFilter(event: string) {
    this.dataSource.filter = event.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
* Applies filter to the approvals data table based on input value.
* @param event The input string used to filter rows
*/
  applyApprovalsFilter(event: string) {
    this.approvalsDataSource.filter = event.trim().toLowerCase();

    if (this.approvalsDataSource.paginator) {
      this.approvalsDataSource.paginator.firstPage();
    }
  }

  /**
   * Uploads the selected invoice file along with metadata.
   * @param provider The carrier/provider associated with the invoice
   */
  uploadInvoice(provider: string) {
    if (!this.selectedFile || !provider) {
      console.warn('File and provider are required.');
      return;
    }

    // Create FormData for file + metadata
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('carrier', provider);
    formData.append('uploadedBy', this.uploadedByUsername);

    const url = `invoice/upload-details`;
    this.apiService.post<ApiResponse<string>>(url, formData).subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.removeSelectedFile();
          this.getAllInvoiceHistoryDetails();
          this.snackbarService.open('success', SNACKBAR_MESSAGES.INVOICE_UPLOADED);
          this.selectedTabIndex = 1;
        } else {
          console.error('Error uploading invoice:', res);
          this.removeSelectedFile();
          this.getAllInvoiceHistoryDetails();
          this.snackbarService.open('error', SNACKBAR_MESSAGES.INVOICE_UPLOAD_FAILED);
          this.selectedTabIndex = 1;
        }
      },
      error: (err) => {
        console.error('Error uploading invoice:', err);
        this.removeSelectedFile();
        this.getAllInvoiceHistoryDetails();
        this.snackbarService.open('error', SNACKBAR_MESSAGES.INVOICE_UPLOAD_FAILED);
        this.selectedTabIndex = 1;
      }
    });
  }

  /**
  * Fetches all history from the backend and updates the table.
  */
  getAllInvoiceHistoryDetails() {
    let url = `invoice-history/get-all`;
    this.apiService.get<InvoiceHistory[]>(url).subscribe({
      next: (res: ApiResponse<InvoiceHistory[]>) => {
        this.invoiceHistoryDetails = res.data;
        this.dataSource.data = this.invoiceHistoryDetails;
        this.approvalsDataSource.data = this.invoiceHistoryDetails;
        this.pendingApprovalsCount = this.invoiceHistoryDetails.filter((item: any) => item.status === 'PENDING_APPROVAL').length;
      },
      error: (err) => {
        console.error('Error fetching details:', err);
      }
    });
  }

  /**
   * Deletes an invoice from the history.
   * @param his The invoice history item to delete
   */
  deleteInvoice(his: InvoiceHistory) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      data: {
        title: CONFIRM_DIALOG.DELETE_INVOICEHISTORY.TITLE,
        message: CONFIRM_DIALOG.DELETE_INVOICEHISTORY.MESSAGE
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const url = `invoice-history/deleteById/${his.invoiceId}`;
        this.apiService.delete(url).subscribe({
          next: (res: ApiResponse<any>) => {
            this.getAllInvoiceHistoryDetails();
            this.snackbarService.open('success', SNACKBAR_MESSAGES.INVOICE_DELETE);
          },

          error: (err) => {
            this.snackbarService.open('error', SNACKBAR_MESSAGES.INVOICE_FAILED);
            console.error('Error deleting role:', err);
          }
        });
      }
    });
  }

  /**
  * View invoice details
  * @param invoice Invoice to view
  */
  viewInvoice(invoice: InvoiceHistory) {
    const dialogWidth = (invoice.status === 'REJECTED' || invoice.status === 'FAILED')
      ? '40vw'
      : '90vw';

    const dialogRef = this.dialog.open(ViewInvoiceDialogComponent, {
      width: dialogWidth,
      autoFocus: false,
      data: invoice
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllInvoiceHistoryDetails();
    });
  }

  /**
  * View inventory details
  * @param inventory Inventory to view
  */
  viewInventory(inventory: InventoryHistory) {
    const dialogWidth = (inventory.status === 'REJECTED' || inventory.status === 'FAILED')
      ? '40vw'
      : '90vw';

    const dialogRef = this.dialog.open(ViewInventoryDialogComponent, {
      width: dialogWidth,
      autoFocus: false,
      data: inventory
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllInventoryHistoryDetails();
    });
  }


  /**
   * Gets the CSS class for the invoice status.
   * @param status The status of the invoice
   * @returns The CSS class name
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'FAILED':
        return 'status-failed';
      default:
        return 'status-default';
    }
  }

  /**
   * Sets the current user information.
   */
  setCurrentUser(): void {
    const currentUser: User | null = this.storageService.getUser();
    if (currentUser && currentUser.userName) {
      this.uploadedByUsername = currentUser.userName;
    } else {
      console.warn('Could not retrieve user name from storage.');
    }
  }

  /**
  * Fetches all inventory history from the backend and updates the table.
  */
  getAllInventoryHistoryDetails() {
    const url = 'inventory-history/get-all';
    this.apiService.get<InventoryHistory[]>(url).subscribe({
      next: (res: ApiResponse<InventoryHistory[]>) => {
        this.inventoryHistoryDetails = res.data;
        this.inventoryDataSource.data = this.inventoryHistoryDetails;
        this.approvalsInventoryDataSource.data = this.inventoryHistoryDetails;
        this.pendingInventoryApprovalsCount = this.inventoryHistoryDetails.filter((item: any) => item.status === 'PENDING_APPROVAL').length;
      },
      error: (err) => {
        console.error('Error fetching inventory details:', err);
      }
    });
  }

  /**
   * Uploads the selected inventory file.
   */
  uploadInventory(provider: string) {
    if (!this.selectedFile || !provider) {
      console.warn('File and provider are required.');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('carrier', provider);
    formData.append('uploadedBy', this.uploadedByUsername);
    const url = 'inventory/upload';
    this.apiService.post<ApiResponse<string>>(url, formData).subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.removeSelectedFile();
          this.getAllInventoryHistoryDetails();
          this.snackbarService.open('success', SNACKBAR_MESSAGES.INVENTORY_UPLOADED);
          this.selectedInventoryTabIndex = 1;
        } else {
          console.error('Error uploading invoice:', res);
          this.removeSelectedFile();
          this.getAllInventoryHistoryDetails();
          this.snackbarService.open('error', SNACKBAR_MESSAGES.INVENTORY_UPLOAD_FAILED);
          this.selectedInventoryTabIndex = 1;
        }
      },
      error: (err) => {
        console.error('Error uploading inventory:', err);
        this.removeSelectedFile();
        this.getAllInventoryHistoryDetails();
        this.snackbarService.open('error', SNACKBAR_MESSAGES.INVENTORY_UPLOAD_FAILED);
        this.selectedInventoryTabIndex = 1;
      }
    });
  }

  /**
   * Applies a filter to the inventory data table.
   * @param event The input string to filter by
   */
  applyInventoryFilter(event: string) {
    this.inventoryDataSource.filter = event.trim().toLowerCase();
    if (this.inventoryDataSource.paginator) {
      this.inventoryDataSource.paginator.firstPage();
    }
  }

  /**
* Applies filter to the approvals data table based on input value.
* @param event The input string used to filter rows
*/
  applyInventoryApprovalsFilter(event: string) {
    this.approvalsInventoryDataSource.filter = event.trim().toLowerCase();

    if (this.approvalsInventoryDataSource.paginator) {
      this.approvalsInventoryDataSource.paginator.firstPage();
    }
  }


}
