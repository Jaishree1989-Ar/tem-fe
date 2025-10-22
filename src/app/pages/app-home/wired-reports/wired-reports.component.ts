import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CamelCaseToTitlePipePipe } from "../../../core/pipes/camel-case-to-title-pipe.pipe";
import { ApiService } from '../../../core/services/http/api.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpParams } from '@angular/common/http';
import { exportToExcel } from '../../../shared/utils/export-to-excel';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';
import { WiredReports } from '../../../core/models/wired-reports';
import moment from 'moment';

@Component({
  selector: 'app-wired-reports',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, MaterialModule, FilterInputComponent, CamelCaseToTitlePipePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './wired-reports.component.html',
  styleUrl: './wired-reports.component.less'
})

/**
 * Wired reports component
 */
export class WiredReportsComponent {

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder) {
  }

  wiredReports: WiredReports[] = [];
  displayedColumns: string[] = [
    'invoiceNumber',
    'invoiceDate',
    'itemNumber',
    'totalCharge'
  ];
  overallColumnArr1: string[] = [
    'section',
    'invoiceNumber',
    'invoiceDate',
    'ban',
    'subgroup',
    'btn',
    'btnDescription',
    'svcId',
    'itemNumber',
    'provider',
    'contract',
    'productId',
    'featureName',
    'description',
    'quantity',
  ];
  overallColumnArr2: string[] = [
    'minutes',
    'contractRate',
    'totalCharge',
    'saafCalculation',
    'chargeType',
    'billPeriod',
    'action',
    'srNumber',
    'node',
    'svcAddress1',
    'svcAddress2',
    'svcCity',
    'svcState',
    'svcZip',
    'viscode'
  ];
  dataSource: MatTableDataSource<WiredReports> = new MatTableDataSource<WiredReports>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterForm!: FormGroup;
  filterValue: string = '';
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: WiredReports | null = null;
  carrierList: string[] = ['All', 'Calnet'];

  editingElement: WiredReports | null = null;
  editedValue: string | null = null;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      carriers: [['All']],
      chargeTypes: [[]],
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      })
    });
    this.loadWiredReports();
  }

  /**
   * Checks if any filter field is selected.
   * @returns true if any filter field has a value, false otherwise.
   */
  isAnyFieldSelected(): boolean {
    const { carriers, chargeTypes, dateRange } = this.filterForm.value;
    const carriersFiltered = carriers && carriers.length > 0 && carriers.some((c: string) => c !== 'All' || carriers.length > 1);
    return carriersFiltered || (chargeTypes && chargeTypes.length > 0) || (dateRange?.start != null);
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Sets up the paginator and sort for the data table.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Fetches wired reports from the backend API based on filter criteria.
   * Updates the data source for the table with the fetched reports.
   */
  loadWiredReports() {
    const url = `wiredReports/searchWiredReports`;
    let params = new HttpParams();

    const { carriers, dateRange } = this.filterForm.value;
    const selectedCarrier = carriers && carriers.length > 0 ? carriers[0] : null;


    if (selectedCarrier && selectedCarrier !== 'All') {
      params = params.set('carrier', selectedCarrier);
    }

    if (dateRange?.start && dateRange?.end) {
      params = params.append('startDate', moment(dateRange.start).format('YYYY-MM-DD'));
      params = params.append('endDate', moment(dateRange.end).format('YYYY-MM-DD'));
    }

    this.apiService.getWithData<WiredReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<WiredReports[]>) => {
        this.wiredReports = res.data || [];
        this.dataSource.data = this.wiredReports;
      },
      error: (err) => {
        console.error('Error fetching wired reports:', err);
        this.dataSource.data = [];
        this.snackbarService.open('error', 'Failed to load reports. Check filters.');
      }
    });
  }

  /**
   * Applies a filter to the data source based on user input.
   * @param event The filter string input by the user.
   */
  applyFilter(event: string) {
    const filterValue = event.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
    * Triggered when the filter button is clicked.
    * Re-loads the wired reports based on the selected filter criteria.
    */
  filterClicked() {
    this.loadWiredReports();
  }

  /**
   * Resets all filter fields to their default values and reloads the reports.
   */
  resetFilters() {
    this.filterForm.reset({
      carriers: ['All'],
      chargeTypes: [],
      dateRange: { start: null, end: null }
    });
    this.loadWiredReports();
  }

  /**
   * Utility function to check and format values for display.
   * Returns a dash ("-") if the value is null or an empty string.
   */
  checkTheValue(value: any): string {
    return (value == null || value === "") ? "-" : value;
  }

  /**
  * Initiates editing mode for the viscode of a specific report.
  * @param element The report element to edit.
  */
  startEdit(element: WiredReports): void {
    this.editingElement = element;
    this.editedValue = element.viscode;
  }

  /**
   * Saves the edited viscode value to the backend.
   */
  saveEdit(): void {
    if (this.editingElement && this.editedValue !== null) {
      const id = this.editingElement.id;
      const url = `wiredReports/${id}/viscode`;

      const body = {
        newViscode: this.editedValue,
        carrier: this.editingElement.carrier
      };

      this.apiService.patch<WiredReports>(url, body).subscribe({
        next: (res: ApiResponse<WiredReports>) => {
          if (this.editingElement) {
            this.editingElement.viscode = res.data.viscode;
            this.snackbarService.open('success', SNACKBAR_MESSAGES.VISCODE_UPDATED);
            this.cancelEdit();
          }
        },
        error: (err) => {
          console.error('Error updating viscode:', err);
          this.snackbarService.open('error', SNACKBAR_MESSAGES.VISCODE_UPDATE_FAILED);
          this.cancelEdit();
        }
      });
    }
  }

  /**
   * Cancels the editing mode and resets the state variables.
   */
  cancelEdit(): void {
    this.editingElement = null;
    this.editedValue = null;
  }

  wiredReportsColumns: string[] = [
    'section', 'invoiceNumber', 'invoiceDate', 'ban', 'subgroup', 'btn',
    'btnDescription', 'svcId', 'itemNumber', 'provider', 'contract',
    'productId', 'featureName', 'description', 'quantity', 'minutes',
    'contractRate', 'totalCharge', 'saafCalculation', 'chargeType',
    'billPeriod', 'action', 'srNumber', 'node', 'svcAddress1',
    'svcAddress2', 'svcCity', 'svcState', 'svcZip', 'viscode'
  ];

  wiredHeaderMap = {
    section: 'Section',
    invoiceNumber: 'Invoice Number',
    invoiceDate: 'Invoice Date',
    ban: 'BAN',
    subgroup: 'Subgroup',
    btn: 'BTN',
    btnDescription: 'BTN Description',
    svcId: 'SVC ID',
    itemNumber: 'Item Number',
    provider: 'Provider',
    contract: 'Contract',
    productId: 'Product ID',
    featureName: 'Feature Name',
    description: 'Description',
    quantity: 'Quantity',
    minutes: 'Minutes',
    contractRate: 'Contract Rate',
    totalCharge: 'Total Charge',
    saafCalculation: 'SAAF Calculation',
    chargeType: 'Charge Type',
    billPeriod: 'Bill Period',
    action: 'Action',
    srNumber: 'SR Number',
    node: 'Node',
    svcAddress1: 'Service Address 1',
    svcAddress2: 'Service Address 2',
    svcCity: 'Service City',
    svcState: 'Service State',
    svcZip: 'Service Zip',
    viscode: 'VIS Code'
  };

  /** Exports the current wired reports to an Excel file.
   * Utilizes the exportToExcel utility function.
   */
  exportReport() {
    exportToExcel(this.wiredReports, this.wiredReportsColumns, this.wiredHeaderMap, 'wired-report.xlsx');
    this.snackbarService.open('success', 'Wired report exported successfully');
  }
}