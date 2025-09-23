import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/http/api.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { User } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/services/storage/storage.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { SNACKBAR_MESSAGES } from '../../../../shared/constants/snackbar-messages.constants';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './file-upload-dialog.component.html',
  styleUrl: './file-upload-dialog.component.less',
})
export class FileUploadDialogComponent implements OnInit {

  public dialogRef = inject(MatDialogRef<FileUploadDialogComponent>);
  carrier = new FormControl<string | null>(null, [Validators.required]);
  private uploadedByUsername: string = 'System';
  distinctCars: string[] = [];

  selectedFile: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  isFileHovered = false;

  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private storageService: StorageService) {
  }

  ngOnInit(): void {
    this.getDistinctCarriers();
    this.setCurrentUser();
  }

  /** Handlers for drag-and-drop file upload */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = true;
  }

  /** Handlers for drag-and-drop file upload */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = false;
  }

  /** Handlers for drag-and-drop file upload */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileHovered = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /** Handlers for file input selection */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  /** Validates and processes the selected file */
  private handleFile(file: File): void {
    if (this.isValidFileType(file)) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
    } else {
      this.removeSelectedFile();
      this.snackbarService.open('warning', SNACKBAR_MESSAGES.INVALID_FILE);
    }
  }

  /** Removes the selected file and resets the file information. */
  removeSelectedFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
  }

  /** Fetches the list of distinct carriers from the API. */
  getDistinctCarriers(): void {
    const url = `telecomReports/getDistinctDepartmentsAndCarriers`;
    this.apiService.get<any>(url).subscribe({
      next: (res: ApiResponse<any>) => {
        this.distinctCars = res.data.carriers;
      },
      error: (err) => {
        console.error('Error fetching carriers:', err);
      }
    });
  }

  /** Sets the current user information for the form. */
  setCurrentUser(): void {
    const currentUser: User | null = this.storageService.getUser();
    if (currentUser?.userName) {
      this.uploadedByUsername = currentUser.userName;
    }
  }

  /** Cancels the file upload and closes the dialog. */
  onCancel(): void {
    this.dialogRef.close();
  }

  /** Submits the selected file and carrier information. */
  onUpload(): void {
    if (this.selectedFile && this.carrier.valid) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('carrier', this.carrier.value!);
      formData.append('uploadedBy', this.uploadedByUsername);
      this.dialogRef.close(formData);
    }
  }

  /** Validates the file type against allowed types (CSV and XLSX). */
  private isValidFileType(file: File): boolean {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return allowedTypes.includes(file.type);
  }

  /** Checks the file type of the selected file. */
  checkFileType(): 'csv' | 'xlsx' | 'unknown' {
    if (!this.selectedFile) return 'unknown';
    if (this.selectedFile.type.includes('csv')) return 'csv';
    if (this.selectedFile.type.includes('spreadsheetml.sheet')) return 'xlsx';
    return 'unknown';
  }

  /** Formats the file size into a human-readable string (KB or MB). */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  }
}