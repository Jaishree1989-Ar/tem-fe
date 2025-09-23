import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TelecomReports } from '../../../core/models/telecom-reports';
import { CamelCaseToTitlePipePipe } from "../../../core/pipes/camel-case-to-title-pipe.pipe";
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { MaterialModule } from '../../../shared/material/material.module';
import { exportToExcel } from '../../../shared/utils/export-to-excel';
import { EditTelecomDialogComponent } from './edit-telecom-dialog/edit-telecom-dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-telecom-reports',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, MaterialModule, FilterInputComponent, CamelCaseToTitlePipePipe],
  templateUrl: './telecom-reports.component.html',
  styleUrl: './telecom-reports.component.less'
})

/**
 * Component responsible for managing Telecom Reports.
 * Includes data fetching, filtering, displaying, and exporting.
 */
export class TelecomReportsComponent {

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private storageService: StorageService,
    private fb: FormBuilder) {
  }

  telecomReports: TelecomReports[] = [];
  displayedColumns: string[] = [
    'department',
    'carrier',
    'phoneNumber',
    'masterAccount',
    'accountNumber'
  ];
  overallColumnArr1: string[] = [
    'department',
    'carrier',
    'phoneNumber',
    'masterAccount',
    'accountNumber',
    'nameOnInvoice',
    'accountDescription',
    'accountOwners',
    'mailingAddress',
    'deviceClass',
    'deviceModel',
    'imei',
    'sim',
    'ipAddress',
    'circuitIdentifier',
    'servicePlan',
  ];
  overallColumnArr2: string[] = [
    'status',
    'activatedOn',
    'deactivatedOn',
    'lastInvoiceOn',
    'viscode',
    'monthlyRecurringCost',
    'billingAddress',
    'billingBuildingLocation',
    'invoiceDescription',
    'invoiceNumber',
    'invoiceAmount',
    'invoiceDate',
    'apEditListNumber',
    'paymentAmount',
    'checkNumber'
  ];
  dataSource: MatTableDataSource<TelecomReports> = new MatTableDataSource<TelecomReports>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  expandedElement: TelecomReports | null = null;
  filterForm!: FormGroup;
  filterValue: string = '';
  expandedRow: any | null = null;
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  dialog = inject(MatDialog);
  accessType: string = 'READ';
  distinctDepts: string[] = [];
  distinctCars: string[] = [];
  distinctDeviceClass: string[] = [];
  // selectedDepts: string[] = [];
  // selectedCars: string[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      departments: [[]],
      carriers: [[]],
      deviceClass: [[]],
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      })
    });
    this.getAllTelecomReports();
    this.accessType = this.accessType = this.storageService.getMenu()
      .find((me: { menuName: string }) => me.menuName === "Reports")
      ?.menu.find((li: { text: string }) => li.text === "Telecom Reports")
      ?.accessType;
    this.getDistinctDepartmentsAndCarriers();
  }

  /**
 * Checks if any field in the filter form is selected.
 * @returns True if at least one field has a value.
 */
  isAnyFieldSelected(): boolean {
    const { departments, carriers, deviceClass, dateRange } = this.filterForm.value;
    return (
      (departments && departments.length > 0) ||
      (carriers && carriers.length > 0) ||
      (deviceClass && deviceClass.length > 0) ||
      (dateRange?.start != null) ||
      (dateRange?.end != null)
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
 * Fetches distinct values for departments, carriers, and device classes.
 */
  getDistinctDepartmentsAndCarriers() {
    let url = `telecomReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        this.distinctDepts = res.data.departments;
        this.distinctCars = res.data.carriers;
        this.distinctDeviceClass = res.data.deviceClasses;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Fetches all telecom report records from the backend.
 */
  getAllTelecomReports() {
    let url = `telecomReports/getAllTelecomReports`;
    this.apiService.get<TelecomReports[]>(url).subscribe({
      next: (res: ApiResponse<TelecomReports[]>) => {
        this.telecomReports = [];
        this.telecomReports = res.data;
        this.dataSource.data = this.telecomReports;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Applies backend filtering based on selected form fields.
 */
  filterTelecomReports() {
    let url = `telecomReports/filterTelecomReports`;

    let params = new HttpParams();

    if (this.filterForm.value.departments && this.filterForm.value.departments.length > 0) {
      this.filterForm.value.departments.forEach((dep: string) => {
        params = params.append('departments', dep);
      });
    }

    if (this.filterForm.value.carriers && this.filterForm.value.carriers.length > 0) {
      this.filterForm.value.carriers.forEach((carrier: string) => {
        params = params.append('carriers', carrier);
      });
    }

    this.apiService.getWithData<TelecomReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<TelecomReports[]>) => {
        this.telecomReports = res.data || [];
        this.dataSource.data = this.telecomReports;
      },
      error: (err) => {
        console.error('Error fetching filtered telecom reports:', err);
      }
    });
  }

  /**
 * Applies keyword-based filtering on the table.
 * @param event The filter text input by the user.
 */
  applyFilter(event: string) {
    this.dataSource.filter = event.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
 * Opens dialog to edit a specific telecom report record.
 * Updates the table data after successful edit.
 * @param ele The record to edit.
 */
  editDetails(ele: TelecomReports) {
    const dialogRef = this.dialog.open(EditTelecomDialogComponent,
      {
        width: '800px',
        panelClass: 'custom-dialog-position',
        autoFocus: false,
        data: { details: ele, from: 'telecom' }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result[0]) {
        this.dataSource.data = this.dataSource.data.map(row => {
          return result[1].id === row.id ? result[1] : row;
        });
        this.telecomReports = this.telecomReports.map(row => {
          return result[1].id === row.id ? result[1] : row;
        });
      }
    });
  }

  /**
 * Triggered when the filter button is clicked.
 * Calls the backend filter API.
 */
  filterClicked() {
    this.filterTelecomReports()
  }

  /**
 * Resets all filter form controls and reloads the full report list.
 */
  resetFilters() {
    this.filterForm.reset();
    this.getAllTelecomReports();
  }

  /** Full list of columns used when exporting the report to Excel. */
  telecomReportsDisplayedColumns: string[] = [
    'department',
    'carrier',
    'phoneNumber',
    'masterAccount',
    'accountNumber',
    'nameOnInvoice',
    'accountDescription',
    'accountOwners',
    'mailingAddress',
    'deviceClass',
    'deviceModel',
    'imei',
    'sim',
    'ipAddress',
    'circuitIdentifier',
    'servicePlan',
    'status',
    'activatedOn',
    'deactivatedOn',
    'lastInvoiceOn',
    'viscode',
    'monthlyRecurringCost',
    'billingAddress',
    'billingBuildingLocation',
    'invoiceDescription',
    'invoiceNumber',
    'invoiceAmount',
    'invoiceDate',
    'apEditListNumber',
    'paymentAmount',
    'checkNumber',
  ];

  /** Mapping of column keys to their display names for Excel headers. */
  telecomHeaderMap = {
    department: 'Department',
    carrier: 'Carrier',
    phoneNumber: 'Phone Number',
    masterAccount: 'Master Account',
    accountNumber: 'Account Number',
    nameOnInvoice: 'Name on Invoice',
    accountDescription: 'Account Description',
    accountOwners: 'Account Owners',
    mailingAddress: 'Mailing Address',
    deviceClass: 'Device Class',
    deviceModel: 'Device Model',
    imei: 'IMEI',
    sim: 'SIM',
    ipAddress: 'IP Address',
    circuitIdentifier: 'Circuit Identifier',
    servicePlan: 'Service Plan',
    status: 'Status',
    activatedOn: 'Activated On',
    deactivatedOn: 'Deactivated On',
    lastInvoiceOn: 'Last Invoice On',
    viscode: 'Vis Code',
    monthlyRecurringCost: 'Monthly Recurring Cost',
    billingAddress: 'Billing Address',
    billingBuildingLocation: 'Billing Building Location',
    invoiceDescription: 'Invoice Description',
    invoiceNumber: 'Invoice Number',
    invoiceAmount: 'Invoice Amount',
    invoiceDate: 'Invoice Date',
    apEditListNumber: 'AP Edit List Number',
    paymentAmount: 'Payment Amount',
    checkNumber: 'Check Number'
  };

  /**
  * Exports the current report data to an Excel file.
  * Shows a snackbar message after export.
  */
  exportReport() {
    exportToExcel(this.telecomReports, this.telecomReportsDisplayedColumns, this.telecomHeaderMap, 'telecom-report.xlsx');
    this.snackbarService.open('success', SNACKBAR_MESSAGES.TELECOM_EXPORTED);
  }

  // onRowClick(event: MouseEvent, element: any): void {
  //   const target = event.target as HTMLElement;
  //   if (target.closest('.edit-btn') || target.closest('.expand-btn')) {
  //     return;
  //   }
  //   this.expandedElement = this.expandedElement === element ? null : element;
  // }
  // isExpanded(element: TelecomReports) {
  //   return this.expandedElement === element;
  // }
  // toggle(element: TelecomReports) {
  //   this.expandedElement = this.isExpanded(element) ? null : element;
  // }
}
