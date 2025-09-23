import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { MatDialog } from '@angular/material/dialog';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import { ApiService } from '../../../../core/services/http/api.service';
import { HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../../core/models/api-response.model';

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
  selector: 'app-expense-summary',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
  ],
  templateUrl: './expense-summary.component.html',
  styleUrl: './expense-summary.component.less'
})

/**
 * Component for displaying a summary of wireless carrier expenses for a selected month.
 * Allows users to pick a month, fetch related expense data, and view details in a dialog.
 */
export class ExpenseSummaryComponent implements OnChanges {
  @Input() selectedCarrier: string = '';
  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) { }

  maxDate: Moment = moment();
  selectedDate = new FormControl(moment().subtract(1, 'M'));
  chosenYearAndMonth: any;
  private destroyed = new Subject<void>();
  expenseDetails: any = [];

  ngOnInit() {
    this.updateDisplayValue(this.selectedDate.value);

    this.selectedDate.valueChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(value => {
        this.updateDisplayValue(value);
      });
  }

  /**
   * Responds to changes in input properties.
   * @param changes The changes detected in the input properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCarrier']) {
      if (changes['selectedCarrier'].currentValue) {
        this.carrierTotalsByRange();
      }
    }
  }

  /**
 * Updates the displayed formatted string for the selected month and year.
 * @param value Moment object representing the selected date, or null.
 */
  updateDisplayValue(value: Moment | null) {
    if (value) {
      this.chosenYearAndMonth = value.format('MMM YYYY');
    } else {
      this.chosenYearAndMonth = null;
    }
  }

  /**
 * Called when a month is selected in the date picker.
 * Updates the selectedDate value and refreshes the data.
 * @param normalizedMonth The selected month as a Moment object.
 * @param datepicker Reference to the Material Datepicker instance.
 */
  setMonthAndYear(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.selectedDate.setValue(normalizedMonth);
    datepicker.close();
    this.carrierTotalsByRange();
  }

  /**
 * Fetches the expense totals for all carriers within the selected month.
 * Sends a GET request with start and end of the month as query parameters.
 */
  carrierTotalsByRange() {
    this.expenseDetails = [];
    let url = `wirelessReports/expenseSummaryByCarrier`;
    let params = new HttpParams();
    params = params.append('carrier', this.selectedCarrier);
    params = params.append('startDate', moment(this.selectedDate.value).startOf('M').format('YYYY-MM-DD'));
    params = params.append('endDate', moment(this.selectedDate.value).endOf('M').format('YYYY-MM-DD'));

    this.apiService.getWithData<any[]>(url, { params }).subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.expenseDetails = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching charges table details:', err);
      }
    });
  }

  /**
   * Opens the dialog to view details for a specific expense item.
   * @param details The expense item details to display.
   */
  openDialog(details: any): void {
    this.dialog.open(ViewDetailsComponent, {
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      width: 'fit-content',
      minWidth: '500px',
      data: details
    });
  }
}
