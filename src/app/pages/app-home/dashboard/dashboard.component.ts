import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StorageService } from '../../../core/services/storage/storage.service';
import { MaterialModule } from '../../../shared/material/material.module';
import { CarriersByDepartmentComponent } from "./carriers-by-department/carriers-by-department.component";
import { ChargesComponent } from "./charges/charges.component";
import { DataUsageComponent } from "./data-usage/data-usage.component";
import { ExpenseSummaryComponent } from "./expense-summary/expense-summary.component";
import { MessagingUsageComponent } from "./messaging-usage/messaging-usage.component";
import { ApiService } from '../../../core/services/http/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    DataUsageComponent,
    MessagingUsageComponent,
    ChargesComponent,
    CarriersByDepartmentComponent,
    ExpenseSummaryComponent,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less'
})
export class DashboardComponent {
  distinctCars: string[] = [];
  selectedCarrier: string = '';

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.getDistinctDepartmentsAndCarriers();
  }

  /**
   * Fetches distinct departments and carriers (used for form data).
   */
  getDistinctDepartmentsAndCarriers() {
    let url = 'telecomReports/getDistinctDepartmentsAndCarriers';
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        this.distinctCars = res.data.carriers;
        if (this.distinctCars.length > 0) {
          this.selectedCarrier = this.distinctCars[0];
        }
      },
      error: (err) => {
        console.error('Error fetching carriers:', err);
      }
    });
  }
}