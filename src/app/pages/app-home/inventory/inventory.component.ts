import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment, { Moment } from 'moment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FirstNetInventory } from '../../../core/models/firstnet-inventory';
import { CamelCaseToTitlePipePipe } from "../../../core/pipes/camel-case-to-title-pipe.pipe";
import { ApiService } from '../../../core/services/http/api.service';
import { FilterInputComponent } from "../../../shared/components/filter-input/filter-input.component";
import { MaterialModule } from '../../../shared/material/material.module';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { Page } from '../../../core/models/page';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

export const MY_FORMATS = {
  parse: { dateInput: 'MM/YYYY' },
  display: { dateInput: 'MM/YYYY', monthYearLabel: 'MMM YYYY', dateA11yLabel: 'LL', monthYearA11yLabel: 'MMMM YYYY' },
};

@Component({
  selector: 'app-inventory',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, FilterInputComponent, MaterialModule, CamelCaseToTitlePipePipe, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.less',
  providers: [provideMomentDateAdapter(MY_FORMATS)],
})
export class InventoryComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) { }

  filterForm!: FormGroup;
  filterValue: string = '';
  private searchSubject = new Subject<string>();
  distinctDepts: string[] = [];
  isUpdatingSelectAll: boolean = false;
  carrier: string = 'FirstNet';
  maxDate: Moment = moment();

  dataSource: MatTableDataSource<FirstNetInventory> = new MatTableDataSource<FirstNetInventory>([]);
  expandedElement: FirstNetInventory | null = null;
  isLoading = true;
  totalElements = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [];
  overallColumnArr1: string[] = [];
  overallColumnArr2: string[] = [];

  private carrierConfigurations: { [key: string]: any } = {
    'FirstNet': {
      displayedColumns: [
        'department',
        'billingAccountNumber',
        'foundationAccount',
        'wirelessNumber'
      ],
      overallColumnArr1: [
        "foundationAccount",
        "foundationAccountName",
        "billingAccountNumber",
        "billingAccountName",
        "wirelessNumber",
        "wirelessUserName",
        "deviceStatus",
        "statusEffectiveDate",
        "department",
        "emailAddress",
        "ratePlanName",
        "udl2",
        "assetTag",
        "udl4",
        "deviceType",
        "deviceImei",
        "deviceMake",
        "deviceModel",
        "networkImeiMismatch",
        "deviceImeiNetwork",
        "deviceMakeNetwork",
        "deviceModelNetwork",
        "operatingSystem",
        "operatingSystemVersion",
      ],
      overallColumnArr2: [
        "imeiSoftwareVersion",
        "simType",
        "simNetwork",
        "simNumberIccid",
        "lastUpdatedDate",
        "ratePlanSocName",
        "groupId",
        "groupPlanSocName",
        "groupLineSocName",
        "primaryLine",
        "activationDate",
        "lastUpgradeDate",
        "upgradeInProgress",
        "contractType",
        "contractStartDate",
        "contractEndDate",
        "contractTerm",
        "contractStatus",
        "primaryPlaceOfUse",
        "deviceEffectiveDate"]
    },
    'AT&T Mobility': {
      displayedColumns: [
        'department',
        'billingAccountNumber',
        'foundationAccount',
        'wirelessNumber'
      ],
      overallColumnArr1: [
        "foundationAccount",
        "foundationAccountName",
        "billingAccountNumber",
        "billingAccountName",
        "wirelessNumber",
        "wirelessUserName",
        "deviceStatus",
        "statusEffectiveDate",
        "department",
        "emailAddress",
        "ratePlanName",
        "visCode",
        "pcn",
        "assetTag",
        "deviceType",
        "deviceImei",
        "deviceMake",
        "deviceModel",
        "operatingSystem",
        "operatingSystemVersion",
      ],
      overallColumnArr2: [
        "imeiSoftwareVersion",
        "simType",
        "simNetwork",
        "simNumberIccid",
        "ratePlanSocName",
        "groupId",
        "groupPlanSocName",
        "groupLineSocName",
        "primaryLine",
        "activationDate",
        "lastUpgradeDate",
        "upgradeInProgress",
        "contractType",
        "contractStartDate",
        "contractEndDate",
        "contractTerm",
        "contractStatus",
        "primaryPlaceOfUse",
        "deviceEffectiveDate"]
    },
    'Verizon Wireless': {
      displayedColumns: [
        'department',
        'accountNumber',
        'accountName',
        'wirelessNumber'
      ],
      overallColumnArr1: [
        'accountName',
        'accountNumber',
        'billCycleDate',
        'costCenter',
        'emailAddress',
        'pricePlanId',
        'profileId',
        'profileName',
        'userId',
        'userName',
        'wirelessNumber',
        'connectedDevice',
        'cstmDtOvolWirelessnumberDeviceEuimid',
        'currentDeviceId4GOnly',
        'deviceSim4GYn',
        'deviceManufacturer',
        'deviceModel',
        'deviceType',
        'earlyUpgradeIndicator',
        'ne2Date',
        'parentWirelessNumber',
        'sim',
        'simType',
        'serialNumberDualSimDevicesOnly',
        'shippedDeviceId',
        'upgradeEligibilityDate',
        'activationDate',
        'autoPortIndicator',
        'deviceChangeLatestDate',
        'deviceChangeReasonDescription',
        'minTiedToWirelessNumber',
        'preferredRoamList',
        'preferredRoamListLastUpdate',
        'wirelessNumberDeactivateDescription',
        'wirelessNumberDisconnectDate',
        'wirelessNumberResumeDate',
        'wirelessNumberStatus',
        'wirelessNumberSuspendDate',
        'wirelessNumberSuspendDescription',
        'dataAccessCharge',
      ],
      overallColumnArr2: [
        'dataPlan',
        'dataPlanAllowance',
        'dataPlanCode',
        'pricePlanDescription',
        'usageAndPurchaseCharges',
        'voiceAccessCharge',
        'voiceAllowance',
        'accountCharges',
        'economicAdjustmentCharge',
        'equipmentCharges',
        'internationalCharges',
        'monthlyAccessCharges',
        'monthlyNonRecurringCharges',
        'otherChargesCredits',
        'phones',
        'purchaseCharges',
        'taxesAndSurcharges',
        'thirdPartyCharges',
        'totalAdditionalCharges',
        'totalCurrentCharges',
        'billableMinutes',
        'longDistanceOtherCharges',
        'minutes',
        'totalAllowanceMinutes',
        'totalCallDetail',
        'usedMinutes',
        'additionalChargesData',
        'additionalServicesDataUsage',
        'currentDataCharges',
        'dataChargesHome',
        'dataOverageCharges',
        'dataUsage',
        'delayedDataCharges',
        'totalDataUsageCharges',
        'additionalServicesMessagingUsage',
        'messagingCharges',
        'mobileToMobileAllowanceMinutes',
        'mobileToMobileMinutes',
        'mobileToMobileMinutesTotal',
        'mobileToMobileUsedMinutes'
      ]
    }
  };

  get columnsToDisplayWithExpand() {
    return [...this.displayedColumns, 'expand'];
  }

  ngOnInit(): void {
    this.setCarrierConfiguration(this.carrier);
    this.filterForm = this.fb.group({
      departments: [[]],
      monthYear: [null]
    });

    this.filterForm.get('departments')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isUpdatingSelectAll) setTimeout(() => this.updateSelectAllState(), 0);
    });

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadInventories();
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
        .subscribe(() => this.loadInventories());
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles the tab change event.
   * Resets pagination and filters, then fetches data for the new tab.
   * @param event The MatTabChangeEvent object.
   */
  onTabChange(event: MatTabChangeEvent) {
    this.carrier = event.tab.textLabel;
    this.setCarrierConfiguration(this.carrier);
    this.filterValue = '';
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.filterForm.get('monthYear')?.reset(null);
    this.dataSource.data = [];
    this.totalElements = 0;
    this.distinctDepts = [];
    this.filterForm.get('departments')?.setValue([], { emitEvent: false });
    this.getDistinctDepartments();
  }

  /**
   * Sets the table column arrays based on the currently selected carrier.
   * @param carrier The carrier name (FirstNet, AT&T Mobility, Verizon)
   */
  private setCarrierConfiguration(carrier: string): void {
    const config = this.carrierConfigurations[carrier];
    if (config) {
      this.displayedColumns = config.displayedColumns;
      this.overallColumnArr1 = config.overallColumnArr1;
      this.overallColumnArr2 = config.overallColumnArr2;
    } else {
      console.warn(`Column configuration for carrier '${carrier}' not found. Using FirstNet as default.`);
      const defaultConfig = this.carrierConfigurations['FirstNet'];
      this.displayedColumns = [...defaultConfig.displayedColumns];
      this.overallColumnArr1 = [...defaultConfig.overallColumnArr1];
      this.overallColumnArr2 = [...defaultConfig.overallColumnArr2];
    }
  }

  /**
  * The single, central method to load inventories from the backend.
  * It builds parameters from the form, paginator, and sort state.
  */
  loadInventories() {
    this.isLoading = true;
    const url = `inventory/search`;
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

    const selectedDepts = this.filterForm.value.departments?.filter((d: string) => d !== 'selectAll');
    if (selectedDepts.length > 0) {
      selectedDepts.forEach((dep: string) => { params = params.append('departments', dep) });
    }

    const { monthYear } = this.filterForm.value;
    if (monthYear) {
      params = params.append('startDate', moment(monthYear).startOf('month').format('YYYY-MM-DD'));
      params = params.append('endDate', moment(monthYear).endOf('month').format('YYYY-MM-DD'));
    }

    this.apiService.getWithData<Page<FirstNetInventory>>(url, { params }).subscribe({
      next: (res: ApiResponse<Page<FirstNetInventory>>) => {
        this.isLoading = false;
        this.totalElements = res.data.totalElements;
        this.dataSource.data = res.data.content;
      },
      error: (err) => {
        this.isLoading = false;
        this.dataSource.data = [];
        this.totalElements = 0;
        console.error(`Error fetching inventories for ${this.carrier}:`, err);
      }
    });
  }

  /**
   * Fetches distinct department values for the current carrier.
   * After fetching, it triggers loading the inventory data.
   */
  getDistinctDepartments() {
    let url = `inventory/distinct-departments/${this.carrier}`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<{ departments: string[] }>) => {
        this.distinctDepts = res.data.departments.filter(
          (dept) => dept && dept.trim() !== ''
        );
        this.loadInventories();
      },
      error: (err) => {
        this.distinctDepts = [];
        this.filterForm.get('departments')?.setValue([]);
        console.error(`Error fetching distinct departments for ${this.carrier}:`, err);
        this.loadInventories();
      }
    });
  }

  /**
   * Triggered when the filter button is clicked.
   */
  filterClicked() {
    if (this.paginator) { this.paginator.pageIndex = 0; }
    this.loadInventories();
  }

  /** Resets all filters to their default state and reloads the inventory data.
   * Clears the filter form, search input, and resets pagination.
   */
  resetFilters() {
    this.filterForm.reset({ departments: [], monthYear: null });
    this.filterValue = '';
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadInventories();
  }

  /**
   * Applies a filter to the table data.
   * @param event Filter input event
   */
  applyFilter(event: string) {
    this.filterValue = event;
    this.searchSubject.next(event);
  }

  /** Handles month selection from the date picker.
   * Sets the selected month in the form and closes the date picker.
   * @param date The selected month as a Moment object
   * @param datepicker The MatDatepicker instance to close
   */
  monthSelected(date: Moment, datepicker: MatDatepicker<Moment>) {
    this.filterForm.controls['monthYear'].setValue(date);
    datepicker.close();
  }

  /** Checks if any filter field is selected.
   * Used to enable/disable the Reset Filters button.
   * @returns true if any filter field has a value, false otherwise
   */
  isAnyFieldSelected(): boolean {
    const { departments, monthYear } = this.filterForm.value;
    const actualDepartments = departments ? departments.filter((dept: string) => dept !== 'selectAll') : [];
    return actualDepartments.length > 0 || monthYear != null;
  }

  /**
   * Toggles the selection of all departments.
   * @param event The change event from the select component
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
   * Updates the state of the "Select All" checkbox based on the current selection.
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

}