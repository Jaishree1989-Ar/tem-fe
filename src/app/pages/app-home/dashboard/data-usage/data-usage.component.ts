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
  selector: 'app-data-usage',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    NgxEchartsModule
  ],
  templateUrl: './data-usage.component.html',
  styleUrl: './data-usage.component.less'
})

/**
 * Component for displaying data usage summaries in a line chart.
 * Users can filter by department, carrier, and date range.
 */
export class DataUsageComponent {
  chartOptions: EChartsOption = {};
  daysList: string[] = [];
  maxDate: Date = new Date();
  selectedDate = new FormControl(moment());
  controlForm!: FormGroup;
  distinctDepts: any = [];
  distinctCars: any = [];
  wirelessReportDetails: WirelessReports[] = [];
  chartInputdata: any = [];
  deptSelected!: string;
  carSelected!: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) { }

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
 * Applies selected department and carrier to the chart and fetches data.
 */
  filterClicked() {
    this.deptSelected = this.controlForm.value.department;
    this.carSelected = this.controlForm.value.carrier;
    this.getDetails(this.controlForm.value.department, this.controlForm.value.carrier);
  }

  /**
 * Called when the date range is changed.
 * Updates the days list used in the chart based on the new range.
 */
  onRangeChange() {
    if (this.controlForm.value.dateRange.end != null) {
      const start = this.controlForm.value.dateRange.start;
      const end = this.controlForm.value.dateRange.end;
      this.daysList = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
    }
  }

  /**
 * Fetches distinct departments and carriers from the backend.
 * Sets the initial filter values and fetches initial report data.
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
   * Fetches usage details for a specific department and carrier within a date range.
   * Aggregates usage totals and prepares chart data.
   * @param department The department to filter reports by.
   * @param carrier The carrier to filter reports by.
   */
  getDetails(department: string, carrier: string) {
    let url = `wirelessReports/reportsByFilter`;
    let params = new HttpParams();
    params = params.append('startDate', this.controlForm.value.dateRange.start.toISOString());
    params = params.append('endDate', this.controlForm.value.dateRange.end.toISOString());
    params = params.append('department', department);
    params = params.append('carrier', carrier);
    console.log(params);

    this.apiService.getWithData<WirelessReports[]>(url, { params }).subscribe({
      next: (res: ApiResponse<WirelessReports[]>) => {
        this.wirelessReportDetails = [];
        this.chartInputdata = [];
        this.wirelessReportDetails = res.data;

        const usageMap = new Map<string, number>();
        this.wirelessReportDetails.forEach(entry => {
          const date = new Date(entry.lastInvoiceOn);
          const dateLabel = format(date, 'yyyy-MM-dd');
          const usage = entry.dataUsageTotal || 0;
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
 * Configures the chart with department, carrier, and usage data.
 * Uses ECharts to render a smooth line chart.
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
        name: 'Usage (KB)',
        nameLocation: 'middle',
        nameGap: 65,
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
