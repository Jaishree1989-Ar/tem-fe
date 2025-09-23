import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrierDetailSheetComponent } from './carrier-detail-sheet/carrier-detail-sheet.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ApiService } from '../../../../core/services/http/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-carriers-by-department',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './carriers-by-department.component.html',
  styleUrl: './carriers-by-department.component.less'
})

/**
 * Component to display wireless carrier plans grouped by department.
 * Fetches department-wise data and opens a dialog to show detailed carrier info.
 */
export class CarriersByDepartmentComponent {

  departmentWiseData: any = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.getdepartmentWiseCarrierPlans();
  }

    /**
   * Makes an API call to retrieve carrier plans grouped by department.
   * Populates the `departmentWiseData` array with the response.
   */
  getdepartmentWiseCarrierPlans() {
    let url = `wirelessReports/departmentWiseCarrierPlans`;

    this.apiService.get<any[]>(url).subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.departmentWiseData = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching details:', err);
      }
    });
  }

    /**
   * Opens a dialog displaying carrier details for a specific department.
   * @param department The name of the department.
   * @param carriers The list of carriers associated with the department.
   */
  openDialog(department: string, carriers: any[]): void {
    this.dialog.open(CarrierDetailSheetComponent, {
      panelClass: 'custom-dialog-position',
      autoFocus: false,
      width: '500px',
      data: { department, carriers }
    });
  }
}
