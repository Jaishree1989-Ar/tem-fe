import { Component, inject, ViewChild } from '@angular/core';
import { UnderConstructionComponent } from "../../../shared/under-construction/under-construction.component";
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { WirelessReports } from '../../../core/models/wireless-reports';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CamelCaseToTitlePipePipe } from "../../../core/pipes/camel-case-to-title-pipe.pipe";
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpParams } from '@angular/common/http';
import { exportToExcel } from '../../../shared/utils/export-to-excel';
import { EditTelecomDialogComponent } from '../telecom-reports/edit-telecom-dialog/edit-telecom-dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-wireless-reports',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, MaterialModule, FilterInputComponent, CamelCaseToTitlePipePipe],
  templateUrl: './wireless-reports.component.html',
  styleUrl: './wireless-reports.component.less'
})

/**
 * Wireless reports component
 */
export class WirelessReportsComponent {

  constructor(
    private apiService: ApiService, 
    private snackbarService: SnackbarService, 
    private storageService: StorageService, 
    private fb: FormBuilder) {
  }

  wirelessReports: WirelessReports[] = [];
  displayedColumns: string[] = [
    'department',
    'carrier',
    'phoneNumber',
    'account',
    'monthlyAverage',
    'total'
  ];
  overallColumnArr1: string[] = [
    'carrier',
    'account',
    'phoneNumber',
    'nameOnInvoice',
    'department',
    'visCode',
    'deviceClass',
    'deviceModel',
    'imei',
    'sim',
    'status',
    'eligibilityDate',
    'servicePlan',
    'jan25PlanUsage',
    'feb25PlanUsage',
    'mar25PlanUsage',
    'planUsageAverage',
    'planUsageTotal',
    'jan25DataUsage',
    'feb25DataUsage',
    'mar25DataUsage',
    'dataUsageAverage',
    'dataUsageTotal'
  ];
  overallColumnArr2: string[] = [
    'jan25MessagingUsage',
    'feb25MessagingUsage',
    'mar25MessagingUsage',
    'messagingUsageAverage',
    'messagingUsageTotal',
    'usageChargesAverage',
    'usageChargesTotal',
    'accessChargesAverage',
    'accessChargesTotal',
    'equipmentChargesAverage',
    'equipmentChargesTotal',
    'otherChargesAverage',
    'otherChargesTotal',
    'taxesAndFeesAverage',
    'taxesAndFeesTotal',
    'adjustmentsAverage',
    'adjustmentsTotal',
    'jan25TotalCharges',
    'feb25TotalCharges',
    'mar25TotalCharges',
    'monthlyAverage',
    'total'
  ];
  dataSource: MatTableDataSource<WirelessReports> = new MatTableDataSource<WirelessReports>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterForm!: FormGroup;
  filterValue: string = '';
  expandedRow: any | null = null;
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: WirelessReports | null = null;
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
    this.getAllWirelessReports();
    this.accessType = this.accessType = this.storageService.getMenu()
      .find((me: { menuName: string }) => me.menuName === "Reports")
      ?.menu.find((li: { text: string }) => li.text === "Telecom Reports")
      ?.accessType;
    this.getDistinctDepartmentsAndCarriers();
  }

  /** Checks if any field is selected in the filter form */
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

/** Initializes Material Table paginator and sorter */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** Fetches distinct departments, carriers, and device classes for filtering */
  getDistinctDepartmentsAndCarriers() {
    let url = `wirelessReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        this.distinctDepts = res.data.departments.filter((de: string) => de != "");
        this.distinctCars = res.data.carriers;
        this.distinctDeviceClass = res.data.deviceClasses.filter((de: string) => de != "");
        // this.distinctDepts = res.data.departments.filter((de: string) => de != "");
        // this.distinctCars = res.data.carriers.filter((de: string) => de != "");
        // this.distinctDeviceClass = res.data.deviceClasses.filter((de: string) => de != "");
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /** Fetches all wireless report data from API */
  getAllWirelessReports() {
    let url = `wirelessReports/getAllWirelessReports`;
    this.apiService.get<WirelessReports[]>(url).subscribe({
      next: (res: ApiResponse<WirelessReports[]>) => {
        this.wirelessReports = [];
        this.wirelessReports = res.data;
        this.dataSource.data = this.wirelessReports;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /** Filters wireless reports based on selected form criteria */
  filterWirelessReports() {
    let url = `wirelessReports/filterWirelessReports`;

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

    this.apiService.getWithData<WirelessReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<WirelessReports[]>) => {
        this.wirelessReports = res.data || [];
        this.dataSource.data = this.wirelessReports;
      },
      error: (err) => {
        console.error('Error fetching filtered wireless reports:', err);
      }
    });
  }

  /** Triggered on filter text input */
  applyFilter(event: string) {
    this.dataSource.filter = event.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** On filter button click, calls filtering logic */
  filterClicked() {
    this.filterWirelessReports();
  }

  /** Resets the filter form and fetches full report */
  resetFilters() {
    this.filterForm.reset();
    this.getAllWirelessReports();
  }

  /**
   * Returns a cleaned/normalized value to be displayed in table.
   * @param value Any value from the report
   */
  checkTheValue(value: any) {
    if (value == null) return "-";
    if (typeof value == "number") return value;
    else if (value == "") return "-";
    else return value;
  }

  /**
   * Opens the dialog for editing report row.
   * After closing, updates the data source if edited.
   * @param ele Row data for editing
   */
  editDetails(ele: WirelessReports) {
    const dialogRef = this.dialog.open(EditTelecomDialogComponent,
      {
        width: '800px',
        panelClass: 'custom-dialog-position',
        autoFocus: false,
        data: { details: ele, from: 'wireless' }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result[0]) {
        this.dataSource.data = this.dataSource.data.map(row => {
          return result[1].id === row.id ? result[1] : row;
        });
        this.wirelessReports = this.wirelessReports.map(row => {
          return result[1].id === row.id ? result[1] : row;
        });
      }
    });
  }

  /** All wireless columns to be exported */
  wirelessReportsColumns: string[] = [
    'carrier',
    'account',
    'phoneNumber',
    'nameOnInvoice',
    'department',
    'visCode',
    'deviceClass',
    'deviceModel',
    'imei',
    'sim',
    'status',
    'eligibilityDate',
    'servicePlan',
    'jan25PlanUsage',
    'feb25PlanUsage',
    'mar25PlanUsage',
    'planUsageAverage',
    'planUsageTotal',
    'jan25DataUsage',
    'feb25DataUsage',
    'mar25DataUsage',
    'dataUsageAverage',
    'dataUsageTotal',
    'jan25MessagingUsage',
    'feb25MessagingUsage',
    'mar25MessagingUsage',
    'messagingUsageAverage',
    'messagingUsageTotal',
    'usageChargesAverage',
    'usageChargesTotal',
    'accessChargesAverage',
    'accessChargesTotal',
    'equipmentChargesAverage',
    'equipmentChargesTotal',
    'otherChargesAverage',
    'otherChargesTotal',
    'taxesAndFeesAverage',
    'taxesAndFeesTotal',
    'adjustmentsAverage',
    'adjustmentsTotal',
    'jan25TotalCharges',
    'feb25TotalCharges',
    'mar25TotalCharges',
    'monthlyAverage',
    'total'
  ];

  /** Maps column keys to readable labels for export */
  wirelessHeaderMap = {
    carrier: 'Carrier',
    account: 'Account',
    phoneNumber: 'Phone Number',
    nameOnInvoice: 'Name on Invoice',
    department: 'Department',
    visCode: 'Vis Code',
    deviceClass: 'Device Class',
    deviceModel: 'Device Model',
    imei: 'IMEI',
    sim: 'SIM',
    status: 'Status',
    eligibilityDate: 'Eligibility Date',
    servicePlan: 'Service Plan',

    jan25PlanUsage: 'Jan 25 Plan Usage',
    feb25PlanUsage: 'Feb 25 Plan Usage',
    mar25PlanUsage: 'Mar 25 Plan Usage',
    planUsageAverage: 'Plan Usage Average',
    planUsageTotal: 'Plan Usage Total',

    jan25DataUsage: 'Jan 25 Data Usage',
    feb25DataUsage: 'Feb 25 Data Usage',
    mar25DataUsage: 'Mar 25 Data Usage',
    dataUsageAverage: 'Data Usage Average',
    dataUsageTotal: 'Data Usage Total',

    jan25MessagingUsage: 'Jan 25 Messaging Usage',
    feb25MessagingUsage: 'Feb 25 Messaging Usage',
    mar25MessagingUsage: 'Mar 25 Messaging Usage',
    messagingUsageAverage: 'Messaging Usage Average',
    messagingUsageTotal: 'Messaging Usage Total',

    usageChargesAverage: 'Usage Charges Average',
    usageChargesTotal: 'Usage Charges Total',

    accessChargesAverage: 'Access Charges Average',
    accessChargesTotal: 'Access Charges Total',

    equipmentChargesAverage: 'Equipment Charges Average',
    equipmentChargesTotal: 'Equipment Charges Total',

    otherChargesAverage: 'Other Charges Average',
    otherChargesTotal: 'Other Charges Total',

    taxesAndFeesAverage: 'Taxes & Fees Average',
    taxesAndFeesTotal: 'Taxes & Fees Total',

    adjustmentsAverage: 'Adjustments Average',
    adjustmentsTotal: 'Adjustments Total',

    jan25TotalCharges: 'Jan 25 Total Charges',
    feb25TotalCharges: 'Feb 25 Total Charges',
    mar25TotalCharges: 'Mar 25 Total Charges',

    monthlyAverage: 'Monthly Average',
    total: 'Total'
  };

  /** Exports visible data to Excel and shows snackbar */
  exportReport() {
    exportToExcel(this.wirelessReports, this.wirelessReportsColumns, this.wirelessHeaderMap, 'wireless-report.xlsx');
    this.snackbarService.open('success', SNACKBAR_MESSAGES.WIRELESS_EXPORTED);
  }
}
