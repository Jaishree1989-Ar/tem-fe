import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { ApiService } from '../../../../core/services/http/api.service';
import { FilterInputComponent } from '../../../../shared/components/filter-input/filter-input.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';
import { StorageService } from '../../../../core/services/storage/storage.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-view-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatTableModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule, MatPaginatorModule,
    MatSortModule, MatListModule, MatCardModule, FilterInputComponent
  ],
  templateUrl: './view-invoice-dialog.component.html',
  styleUrl: './view-invoice-dialog.component.less'
})
export class ViewInvoiceDialogComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>([]);
  invoiceDetails: any;
  filterValue: string = '';
  selectedRecord: any | null = null;
  private uploadedByUsername: string = 'System';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewInvoiceDialogComponent>,
    private apiService: ApiService, private dialog: MatDialog, private snackbarService: SnackbarService
    , private storageService: StorageService
  ) { }

  ngOnInit(): void {
    if (this.data.status == 'APPROVED') {
      this.getApprovedInvoiceById();
    } else {
      this.getInvoiceById();
    }
    this.setCurrentUser();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getInvoiceById() {
    const url = `invoice-history/review/${this.data.batchId}`;
    this.apiService.get<ApiResponse<any>>(url).subscribe({
      next: (res) => {
        this.invoiceDetails = res.data;
        this.dataSource.data = this.invoiceDetails.invoiceRecords;
        if (this.invoiceDetails.invoiceRecords?.length > 0) {
          this.selectRecord(this.invoiceDetails.invoiceRecords[0]);
        }
      },
      error: (err) => console.error('Error fetching invoice details:', err)
    });
  }

  getApprovedInvoiceById() {
    const url = `invoice-history/batch/${this.data.batchId}/approved`;
    this.apiService.get<ApiResponse<any>>(url).subscribe({
      next: (res) => {
        this.invoiceDetails = res.data;
        this.dataSource.data = this.invoiceDetails.invoiceRecords;
        if (this.invoiceDetails.invoiceRecords?.length > 0) {
          this.selectRecord(this.invoiceDetails.invoiceRecords[0]);
        }
      },
      error: (err) => console.error('Error fetching invoice details:', err)
    });
  }


  selectRecord(record: any): void {
    this.selectedRecord = record;
  }

  onApprove(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Approval',
        message: 'Are you sure you want to approve this invoice details?',
        confirmText: 'Approve',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendReviewAction('APPROVE');
      }
    });
  }

  onReject(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Rejection',
        message: 'Are you sure you want to reject this invoice details?',
        confirmText: 'Reject',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendReviewAction('REJECT', result.rejectionReason);
      }
    });
  }

  private sendReviewAction(action: 'APPROVE' | 'REJECT', reason?: string): void {
    let payload: any = {
      batchId: this.data.batchId,
      action,
      reviewedBy: this.uploadedByUsername
    };
    if (action === 'REJECT') {
      payload.rejectionReason = reason || 'No reason provided';
    }
    const url = `invoice-history/review/action`;
    this.apiService.post<any>(url, payload).subscribe({
      next: (res) => {
        if (action === 'APPROVE') {
          this.snackbarService.open('success', SNACKBAR_MESSAGES.INVOICE_REVIEW_APPROVED);
        } else if (action === 'REJECT') {
          this.snackbarService.open('success', SNACKBAR_MESSAGES.INVOICE_REVIEW_REJECTED);
        }
        this.dialogRef.close({ updated: true, action });
      },
      error: (err) => {
        this.snackbarService.open('error', SNACKBAR_MESSAGES.INVOICE_REVIEW_INTERNAL_ERROR);
        this.dialogRef.close();
      }
    });
  }


  /**
   * Applies a filter to the table data.
   * @param event Filter input event
   */
  applyFilter(event: string) {
    const filterValue = event.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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
}