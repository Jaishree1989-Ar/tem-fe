import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FirstNetInvoice } from '../../../core/models/firstnet-invoice';
import { CamelCaseToTitlePipePipe } from "../../../core/pipes/camel-case-to-title-pipe.pipe";
import { ApiService } from '../../../core/services/http/api.service';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { MaterialModule } from '../../../shared/material/material.module';
import moment from 'moment';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil, tap } from 'rxjs/operators';
import { Page } from '../../../core/models/page';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-invoices',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, FilterInputComponent, MaterialModule, CamelCaseToTitlePipePipe, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.less'
})
export class InvoicesComponent implements OnInit, AfterViewInit {

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder) {
  }

  filterForm!: FormGroup;
  filterValue: string = '';
  private searchSubject = new Subject<string>();
  distinctDepts: string[] = [];
  isUpdatingSelectAll: boolean = false;
  carrier: string = 'FirstNet';

  dataSource: MatTableDataSource<FirstNetInvoice> = new MatTableDataSource<FirstNetInvoice>([]);
  expandedElement: FirstNetInvoice | null = null;
  isLoading = true;
  totalElements = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  editingElement: FirstNetInvoice | null = null;
  editedValue: number | null = null;

  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [];
  overallColumnArr1: string[] = [];
  overallColumnArr2: string[] = [];

  private columnConfigs: { [key: string]: any } = {
    'FirstNet': {
      displayedColumns: [
        'department',
        'accountNumber',
        'invoiceNumber',
        'foundationAccount',
        'wirelessNumber',
        'totalMonthlyCharges'
      ],
      overallColumnArr1: [
        'department',
        'division',
        'foundationAccount',
        'foundationAccountName',
        'accountNumber',
        'accountAndDescriptions',
        'billingAccountName',
        'wirelessNumberAndDescriptions',
        'wirelessNumber',
        'userName',
        'visCode',
        'udl4',
        'invoiceDate',
      ],
      overallColumnArr2: [
        'marketCycleEndDate',
        'rateCode',
        'ratePlanName',
        'groupId',
        'totalCurrentCharges',
        'totalMonthlyCharges',
        'totalActivitySinceLastBill',
        'totalTaxes',
        'totalCompanyFeesAndSurcharges',
        'totalKbUsage',
        'totalMinutesUsage',
        'totalMessages',
        'totalFanLevelCharges',
        'totalAdjustments',
        'totalReoccurringCharges',
      ]
    },
    'AT&T Mobility': {
      displayedColumns: [
        'department',
        'accountNumber',
        'invoiceNumber',
        'foundationAccount',
        'wirelessNumber',
        'totalMonthlyCharges'
      ],
      overallColumnArr1: [
        'department',
        'division',
        'foundationAccount',
        'foundationAccountName',
        'accountNumber',
        'accountAndDescriptions',
        'billingAccountName',
        'wirelessNumberAndDescriptions',
        'wirelessNumber',
        'userName',
        'visCode',
        'assetTag',
        'invoiceDate',
      ],
      overallColumnArr2: [
        'marketCycleEndDate',
        'rateCode',
        'ratePlanName',
        'groupId',
        'totalCurrentCharges',
        'totalMonthlyCharges',
        'totalActivitySinceLastBill',
        'totalTaxes',
        'totalCompanyFeesAndSurcharges',
        'totalKbUsage',
        'totalMinutesUsage',
        'totalMessages',
        'totalFanLevelCharges',
        'totalAdjustments',
        'totalReoccurringCharges',
      ]
    },
    'Verizon': {
      displayedColumns: [
      ],
      overallColumnArr1: [
      ],
      overallColumnArr2: [
      ]
    }
  };

  get columnsToDisplayWithExpand() {
    return [...this.displayedColumns, 'expand'];
  }

  ngOnInit(): void {
    this.setColumnsForCarrier(this.carrier);
    this.filterForm = this.fb.group({
      departments: [[]],
      dateRange: this.fb.group({ start: [null], end: [null] })
    });

    this.filterForm.get('departments')?.valueChanges.subscribe((selected: string[]) => {
      if (!this.isUpdatingSelectAll) setTimeout(() => this.updateSelectAllState(), 0);
    });

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadInvoices();
    });

    this.getDistinctDepartments();
  }

  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.initializeSortersAndPaginators();
    } else {
      setTimeout(() => this.initializeSortersAndPaginators());
    }
  }

  /**
  * Sets the column configurations based on the selected carrier
  * @param carrier The carrier name (FirstNet, AT&T Mobility, Verizon)
  */
  private setColumnsForCarrier(carrier: string): void {
    const config = this.columnConfigs[carrier];
    if (config) {
      this.displayedColumns = [...config.displayedColumns];
      this.overallColumnArr1 = [...config.overallColumnArr1];
      this.overallColumnArr2 = [...config.overallColumnArr2];
    } else {
      console.warn(`Column configuration for carrier '${carrier}' not found. Using FirstNet as default.`);
      const defaultConfig = this.columnConfigs['FirstNet'];
      this.displayedColumns = [...defaultConfig.displayedColumns];
      this.overallColumnArr1 = [...defaultConfig.overallColumnArr1];
      this.overallColumnArr2 = [...defaultConfig.overallColumnArr2];
    }
  }

  /**
   * Initializes sort and paginator for the table.
   */
  initializeSortersAndPaginators() {
    if (this.paginator && this.sort) {
      this.sort.sortChange.pipe(
        takeUntil(this.destroy$),
        tap(() => (this.paginator.pageIndex = 0))
      ).subscribe();

      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe(() => this.loadInvoices());
    }
  }

  /** Cleanup subscriptions on component destroy */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles the tab change event.
   * Resets pagination and filters, then fetches data for the new tab with "Select All" as default.
   * @param event The MatTabChangeEvent object.
   */
  onTabChange(event: MatTabChangeEvent): void {
    this.carrier = event.tab.textLabel;
    this.setColumnsForCarrier(this.carrier);
    this.filterValue = '';
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.filterForm.get('dateRange')?.reset({ start: null, end: null });
    this.dataSource.data = [];
    this.totalElements = 0;
    this.distinctDepts = [];
    this.filterForm.get('departments')?.setValue([], { emitEvent: false });
    this.getDistinctDepartments();
  }

  /**
   * The single, central method to load invoices from the backend.
   * It builds parameters from the form, paginator, and sort state.
   */
  loadInvoices() {
    this.isLoading = true;
    const url = `invoice/search`;
    let params = new HttpParams()
      .set('carrier', this.carrier)
      .set('page', this.paginator ? this.paginator.pageIndex.toString() : '0')
      .set('size', this.paginator ? this.paginator.pageSize.toString() : '10');

    if (this.sort && this.sort.active && this.sort.direction) {
      params = params.set('sort', `${this.sort.active},${this.sort.direction}`);
    }

    if (this.filterValue && this.filterValue.trim() !== '') {
      params = params.set('keyword', this.filterValue.trim());
    }

    const selectedDepartments = this.filterForm.value.departments || [];
    const actualDepartments = selectedDepartments.filter((dept: string) => dept !== 'selectAll');
    if (actualDepartments.length > 0) {
      actualDepartments.forEach((dep: string) => {
        params = params.append('departments', dep);
      });
    }

    const { dateRange } = this.filterForm.value;
    if (dateRange?.start && dateRange?.end) {
      params = params.append('startDate', moment(dateRange.start).format('YYYY-MM-DD'));
      params = params.append('endDate', moment(dateRange.end).format('YYYY-MM-DD'));
    }

    this.apiService.getWithData<Page<FirstNetInvoice>>(url, { params }).subscribe({
      next: (res: ApiResponse<Page<FirstNetInvoice>>) => {
        this.isLoading = false;
        this.totalElements = res.data.totalElements;
        this.dataSource.data = res.data.content;
      },
      error: (err) => {
        this.isLoading = false;
        this.dataSource.data = [];
        this.totalElements = 0;
        console.error(`Error fetching invoices for ${this.carrier}:`, err);
      }
    });
  }

  /**
   * Fetches distinct department values for the current carrier.
   * After fetching, it defaults the department filter to "Select All" and triggers loading the invoice data.
   */
  getDistinctDepartments() {
    const url = `invoice/distinct-departments/${this.carrier}`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<{ departments: string[] }>) => {
        this.distinctDepts = res.data.departments.filter(
          (dept) => dept && dept.trim() !== ''
        );
        this.loadInvoices();
      },
      error: (err) => {
        this.distinctDepts = [];
        this.filterForm.get('departments')?.setValue([]);
        console.error(`Error fetching distinct departments for ${this.carrier}:`, err);
        this.loadInvoices();
      }
    });
  }

  /**
   * Triggered by the filter button, resets pagination and reloads data.
   */
  filterClicked() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadInvoices();
  }

  /**
   * Manually resets all filters to their initial state and reloads data.
   */
  resetFilters() {
    this.filterForm.reset({ departments: [], dateRange: { start: null, end: null } });
    this.filterValue = '';
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadInvoices();
  }

  /**
   * Applies a text filter to the data source.
   * Resets pagination and triggers data reload.
   * @param event The filter string input by the user.
   */
  applyFilter(event: string) {
    this.filterValue = event;
    this.searchSubject.next(event);
  }

  /**
   * Checks if any filter field is selected or filled.
   * Used to enable/disable the Reset button.
   * @returns True if any filter field has a value, false otherwise.
   */
  isAnyFieldSelected(): boolean {
    const { departments, dateRange } = this.filterForm.value;
    const actualDepartments = departments ? departments.filter((dept: string) => dept !== 'selectAll') : [];
    return actualDepartments.length > 0 || dateRange?.start != null || dateRange?.end != null;
  }

  /**
   * Handles the "Select All" option toggle.
   * When "Select All" is selected, all departments are selected.
   */
  toggleSelectAll(event: any): void {
    if (event.isUserInput) {
      this.isUpdatingSelectAll = true;
      if (event.source.selected) {
        this.filterForm.get('departments')?.setValue(['selectAll', ...this.distinctDepts]);
      } else {
        this.filterForm.get('departments')?.setValue([]);
      }
      setTimeout(() => this.isUpdatingSelectAll = false, 0);
    }
  }

  /**
   * Updates the "Select All" checkbox state based on individual department selections.
   * Ensures "Select All" is checked if all departments are selected, and unchecked otherwise.
   */
  private updateSelectAllState(): void {
    if (this.distinctDepts.length === 0) {
      return;
    }
    this.isUpdatingSelectAll = true;
    const selected = this.filterForm.get('departments')?.value || [];
    const actualSelected = selected.filter((d: string) => d !== 'selectAll');
    const hasSelectAll = selected.includes('selectAll');

    if (actualSelected.length === this.distinctDepts.length && !hasSelectAll) {
      this.filterForm.get('departments')?.setValue(['selectAll', ...actualSelected], { emitEvent: false });
    } else if (actualSelected.length < this.distinctDepts.length && hasSelectAll) {
      this.filterForm.get('departments')?.setValue(actualSelected, { emitEvent: false });
    }
    setTimeout(() => this.isUpdatingSelectAll = false, 0);
  }

  /** Initiates editing mode for the specified invoice element.
   * @param element The invoice element to edit.
   */
  startEdit(element: FirstNetInvoice): void {
    this.editingElement = element;
    this.editedValue = parseFloat(element.totalReoccurringCharges || '0');
  }

  /** Saves the edited recurring charges value to the backend.
   * On success, updates the local data and exits editing mode.
   * On failure, shows an error message and exits editing mode.
   */
  saveEdit(): void {
    if (this.editingElement && this.editedValue !== null) {
      const invoiceId = this.editingElement.invoiceId;
      const url = `invoice/${invoiceId}/recurring-charges`;
      const body = { newRecurringCharges: this.editedValue, carrier: this.carrier };

      this.apiService.patch<FirstNetInvoice>(url, body).subscribe({
        next: (res: ApiResponse<FirstNetInvoice>) => {
          if (this.editingElement) {
            this.editingElement.totalReoccurringCharges = res.data.totalReoccurringCharges;
            this.snackbarService.open('success', SNACKBAR_MESSAGES.RECURRING_CHARGES_UPDATED);
            this.cancelEdit();
          }
        },
        error: (err) => {
          console.error('Error updating recurring charges:', err);
          this.snackbarService.open('error', SNACKBAR_MESSAGES.RECURRING_CHARGES_UPDATE_FAILED);
          this.cancelEdit();
        }
      });
    }
  }

  /** Cancels the editing mode and resets temporary values. */
  cancelEdit(): void {
    this.editingElement = null;
    this.editedValue = null;
  }
}