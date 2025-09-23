import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { eachDayOfInterval, format } from 'date-fns';
import { EChartsOption } from 'echarts';
import moment from 'moment';
import { NgxEchartsModule } from 'ngx-echarts';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { WirelessReports } from '../../../../core/models/wireless-reports';
import { ApiService } from '../../../../core/services/http/api.service';
import { MaterialModule } from '../../../../shared/material/material.module';

@Component({
  selector: 'app-messaging-usage',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgxEchartsModule],
  templateUrl: './messaging-usage.component.html',
  styleUrl: './messaging-usage.component.less'
})

/**
 * Component responsible for displaying messaging usage data in a line chart.
 * Allows filtering by date range, department, and carrier, and fetches data accordingly.
 */
export class MessagingUsageComponent {
  chartOptions: EChartsOption = {};
  maxDate: Date = new Date();
  selectedDate = new FormControl(moment());
  controlForm!: FormGroup;
  daysList: string[] = [];
  distinctDepts: any = [];
  distinctCars: any = [];
  wirelessReportDetails: WirelessReports[] = [];
  chartInputdata: any = [];
  deptSelected!: string;
  carSelected!: string;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    const start = moment().subtract(1, 'M').startOf('M').toDate();
    const end = moment().subtract(1, 'M').endOf('M').toDate();
    this.daysList = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));

    this.controlForm = this.fb.group({
      dateRange: this.fb.group({
        start: [moment().subtract(1, 'M').startOf('M').toDate(), [Validators.required]],
        end: [moment().subtract(1, 'M').endOf('M').toDate(), [Validators.required]]
      }),
      department: [null],
      carrier: [null]
    });

    this.getDistinctDepartmentsAndCarriers();
  }


  /**
   * Triggered when the filter button is clicked.
   * Updates selected department and carrier, and fetches chart data.
   */
  filterClicked() {
    this.deptSelected = this.controlForm.value.department;
    this.carSelected = this.controlForm.value.carrier;
    this.getDetails(this.controlForm.value.department, this.controlForm.value.carrier);
  }

  /**
 * Triggered when the date range is modified.
 * Updates the internal list of days for the chart x-axis.
 */
  onRangeChange(): void {
    if (this.controlForm.value.dateRange.end != null) {
      const start = this.controlForm.value.dateRange.start;
      const end = this.controlForm.value.dateRange.end;
      this.daysList = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
    }
  }

  /**
 * Fetches distinct departments and carriers for the filter dropdowns.
 * Also sets defaults and triggers initial data load.
 */
  getDistinctDepartmentsAndCarriers() {
    let url = `wirelessReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        this.distinctDepts = res.data.departments.filter((de: string) => de != "");
        this.distinctCars = res.data.carriers;
        this.controlForm.patchValue(
          { department: this.distinctDepts[0], carrier: this.distinctCars[0] }
        );
        this.deptSelected = this.distinctDepts[0];
        this.carSelected = this.distinctCars[0];
        this.getDetails(this.distinctDepts[0] || null, this.distinctCars[0] || null);
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Fetches messaging usage details from the backend filtered by department and carrier.
 * Aggregates and triggers chart update.
 * 
 * @param department Selected department
 * @param carrier Selected carrier
 */
  getDetails(department: string, carrier: string) {
    let url = `wirelessReports/reportsByFilter`;
    let params = new HttpParams();
    params = params.append('startDate', this.controlForm.value.dateRange.start.toISOString());
    params = params.append('endDate', this.controlForm.value.dateRange.end.toISOString());
    params = params.append('department', department);
    params = params.append('carrier', carrier);

    this.apiService.getWithData<WirelessReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<WirelessReports[]>) => {
        this.wirelessReportDetails = [];
        this.chartInputdata = [];
        this.wirelessReportDetails = res.data;

        const usageMap = new Map<string, number>();
        this.wirelessReportDetails.forEach(entry => {
          const date = new Date(entry.lastInvoiceOn);
          const dateLabel = format(date, 'yyyy-MM-dd');
          const usage = entry.messagingUsageTotal || 0;
          if (usageMap.has(dateLabel)) {
            usageMap.set(dateLabel, usageMap.get(dateLabel)! + usage);
          } else {
            usageMap.set(dateLabel, usage);
          }
        });
        this.chartInputdata = this.daysList.map(date => usageMap.get(date) ?? 0);
        this.updateChart();
      },
      error: (err) => {
        console.error('Error fetching details:', err);
      }
    });
  }

  /**
 * Updates the ECharts line chart with the latest data and formatting.
 */
  updateChart() {
    this.chartOptions = {
      title: {
        text: `${this.deptSelected} - ${this.carSelected}`,
        left: 'center',
        textStyle: {
          color: '#0A606F',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      legend: {
        data: [this.carSelected],
        top: 'bottom'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: this.daysList
      },
      yAxis: {
        type: 'value',
        name: 'Usage (Count)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: '#0A606F',
          fontSize: 11,
          fontWeight: 'bold'
        }
      },
      series: [
        {
          name: this.carSelected,
          data: this.chartInputdata,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#E5BF24',
            width: 2
          },
          itemStyle: {
            color: '#0A606F'
          }
        }
      ]
    };
  }
}
