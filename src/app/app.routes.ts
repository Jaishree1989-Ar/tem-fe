import { Routes } from '@angular/router';
import { LoginComponent } from './pages/startup-page/login/login.component';
import { ForgotPasswordComponent } from './pages/startup-page/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/startup-page/reset-password/reset-password.component';
import { authGuard } from './core/auth/auth.guard';

/**
 * Application route configuration.
 * 
 * Routes include:
 * - Public routes: login, forgot-password, reset-password
 * - Lazy-loaded protected routes under `/app`, secured by `authGuard`
 */
export const routes: Routes = [
  /**
   * Redirect empty path to login
   */
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  /**
   * Login route
   */
  {
    path: 'login',
    component: LoginComponent,
  },

  /**
   * Forgot password route
   */
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },

  /**
   * Reset password route
   */
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },

  /**
   * Protected application routes under `/app`
   */
  {
    path: 'app',
    loadComponent: () => import('./pages/app-home/app-home.component').then(m => m.AppHomeComponent),
    children: [
      /**
       * Reports page - Protected
       */
      {
        path: 'reports',
        loadComponent: () => import('./pages/app-home/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [authGuard]
      },

      /**
       * Telecom reports page - Protected
       */
      {
        path: 'telecom-reports',
        loadComponent: () => import('./pages/app-home/telecom-reports/telecom-reports.component').then(m => m.TelecomReportsComponent),
        canActivate: [authGuard]
      },

      /**
       * Wireless reports page - Protected
       */
      {
        path: 'wireless-reports',
        loadComponent: () => import('./pages/app-home/wireless-reports/wireless-reports.component').then(m => m.WirelessReportsComponent),
        canActivate: [authGuard]
      },

      /**
       * Invoices page - Protected
       */
      {
        path: 'invoices',
        loadComponent: () => import('./pages/app-home/invoices/invoices.component').then(m => m.InvoicesComponent),
        canActivate: [authGuard]
      },

       /**
       * Inventory page - Protected
       */
      {
        path: 'inventory',
        loadComponent: () => import('./pages/app-home/inventory/inventory.component').then(m => m.InventoryComponent),
        canActivate: [authGuard]
      },

      /**
       * Dashboard page - Protected
       */
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/app-home/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },

      /**
       * User management page - Protected
       */
      {
        path: 'user',
        loadComponent: () => import('./pages/app-home/user/user.component').then(m => m.UserComponent),
        canActivate: [authGuard]
      },

      /**
       * Role management page - Protected
       */
      {
        path: 'role',
        loadComponent: () => import('./pages/app-home/role/role.component').then(m => m.RoleComponent),
        canActivate: [authGuard]
      },

      /**
       * Department management page - Protected
       */
      {
        path: 'department',
        loadComponent: () => import('./pages/app-home/department/department.component').then(m => m.DepartmentComponent),
        canActivate: [authGuard]
      },

      /**
       * Invoice data upload page - Protected
       */
      {
        path: 'invoice-upload',
        loadComponent: () => import('./pages/app-home/invoice-data-upload/invoice-data-upload.component').then(m => m.InvoiceDataUploadComponent),
        canActivate: [authGuard]
      },

      /**
       * Wired reports page - Protected
       */
      {
        path: 'wired-reports',
        loadComponent: () => import('./pages/app-home/wired-reports/wired-reports.component').then(m => m.WiredReportsComponent),
        canActivate: [authGuard]
      },
    ]
  }
];