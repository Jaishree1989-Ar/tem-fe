import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment, { Moment } from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../../shared/material/material.module';
import { HttpParams } from '@angular/common/http';
import { WirelessReports } from '../../../../core/models/wireless-reports';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { ApiService } from '../../../../core/services/http/api.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.less'
})

/**
 * Component for displaying wireless charge details in a table.
 * Supports filtering by month, table sorting, pagination, and multi-row headers.
 */
export class ChargesComponent {

  chargesData: WirelessReports[] = [];
  maxDate: Moment = moment();
  selectedDate = new FormControl(moment().subtract(1, 'M'));
  chosenYearAndMonth: any;
  private destroyed = new Subject<void>();
  tableDetails: WirelessReports[] = [];
  dataSource = new MatTableDataSource<WirelessReports>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'department',
    'carrier',
    'account',
    'usageChargesAverage',
    'usageChargesTotal',
    'accessChargesAverage',
    'accessChargesTotal',
    'equipmentChargesAverage',
    'equipmentChargesTotal',
    'otherChargesAverage',
    'otherChargesTotal'
  ];

  groupedColumns: string[] = [
    'department',
    'carrier',
    'account',
    'group_usage',
    'group_access',
    'group_equipment',
    'group_other'
  ];

  secondHeaderRowColumns: string[] = [
    'usageChargesAverage',
    'usageChargesTotal',
    'accessChargesAverage',
    'accessChargesTotal',
    'equipmentChargesAverage',
    'equipmentChargesTotal',
    'otherChargesAverage',
    'otherChargesTotal'
  ];

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.getChargesDetails();
    this.updateDisplayValue(this.selectedDate.value);

    this.selectedDate.valueChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(value => {
        this.updateDisplayValue(value);
      });
  }

  /**
   * Set the paginator and sort after table rendered
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
 * Updates the displayed month-year string based on the selected date.
 * @param value Moment object representing the selected date.
 */
  updateDisplayValue(value: Moment | null) {
    if (value) {
      this.chosenYearAndMonth = value.format('MMM YYYY');
    } else {
      this.chosenYearAndMonth = null;
    }
  }

  /**
 * Handler when a new month is selected via the datepicker.
 * Updates the selectedDate and fetches charge details.
 * @param normalizedMonth The selected month as a Moment object.
 * @param datepicker Reference to the datepicker instance.
 */
  setMonthAndYear(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.selectedDate.setValue(normalizedMonth);
    datepicker.close();
    this.getChargesDetails();
  }

  /**
 * Fetches wireless charges data for the selected month from the backend.
 * Populates the data source for the Material table.
 */
  getChargesDetails() {
    let url = `wirelessReports/reportsByDateRange`;

    let params = new HttpParams();
    params = params.append('startDate', moment(this.selectedDate.value).startOf('M').toISOString());
    params = params.append('endDate', moment(this.selectedDate.value).endOf('M').toISOString());

    this.apiService.getWithData<WirelessReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<WirelessReports[]>) => {
        this.tableDetails = res.data || [];
        this.dataSource.data = this.tableDetails;
      },
      error: (err) => {
        console.error('Error fetching charges table details:', err);
      }
    });
  }
}