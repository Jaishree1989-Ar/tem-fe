import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/material/material.module';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';
import { User } from '../../models/user.model';
import { ChangePasswordComponent } from '../../../pages/startup-page/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less'
})

/**
 * HeaderComponent - Displays the top header of the application.
 *
 * Features:
 * - Shows user information(name and mail) fetched from `StorageService`.
 * - Handles user logout and redirects to the login page.
 *
 * Dependencies:
 * - Router: Used for route navigation.
 * - StorageService: Used to retrieve the logged-in user's details.
 *
 * Lifecycle:
 * - On init, retrieves user details from local storage.
 */
export class HeaderComponent {


  isMenuActive: boolean = false;
  userDetails!: User | null;
  constructor(private router: Router, private storageService: StorageService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.userDetails = this.storageService.getUser();
  }

  redirectSettingsPage() {
    this.router.navigate(['/app/home/settings']);
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-position',
      data: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/login']);
      }
    });
  }
  
  redirectToResetPassword() {
    console.log("Redirecting to change password dialog");

    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '800px',
      panelClass: 'custom-dialog-position'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.router.navigate(['/login']);
      }
    });
  }
}
