import { CommonModule } from '@angular/common';
import { Component, HostBinding, QueryList, ViewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { NavigationEnd, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material/material.module';
import { ApiResponse } from '../../models/api-response.model';
import { User } from '../../models/user.model';
import { ApiService } from '../../services/http/api.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.less'
})

/**
 * SidebarComponent - Displays the application's sidebar with collapsible menu panels.
 *
 * Features:
 * - Dynamically loads the menu list from a JSON file.
 * - Filters menu items based on user role and access.
 * - Highlights and expands the active menu based on current route.
 * - Uses Angular Material expansion panels to organize parent and child menus.
 * - Persists selected menu state and updates on route changes.
 *
 * Dependencies:
 * - SidebarService: Controls sidebar expansion state.
 * - StorageService: Provides user info and stores filtered menus.
 * - ApiService: Makes HTTP requests to fetch user and menu data.
 * - Router: Used for navigation tracking and updating menu state.
 *
 * Lifecycle:
 * - OnInit: Loads user info and menu list, initializes expanded menu state.
 *
 * Bindings:
 * - `@HostBinding('class.is-expanded')` binds sidebar open/close class based on SidebarService.
 * - `@ViewChildren(MatExpansionPanel)` manages references to menu panels for dynamic control.
 */
export class SidebarComponent {
  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private storageService: StorageService,
    private apiService: ApiService
  ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveParentIndex(event.urlAfterRedirects);
      }
    });
  }

  menuList: any = [];
  userDetails!: User | null;
  chosenParentMenu: string = '';
  chosenParentIndex!: number;
  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  ngOnInit(): void {
    this.userDetails = this.storageService.getUser();
    this.getMenuList();
  }

  /**
   * Get the user details by email
   * 
   * @param userEmail User email
   */
  getUserDetails(userEmail: string) {
    let url = 'user/getUserByEmail/' + userEmail;
    this.apiService.get<User>(url).subscribe({
      next: (res: ApiResponse<User>) => {
        this.userDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  /**
 * Getter method to retrieve the value of isExpanded property.
 *
 * @return {boolean} The value of isExpanded property.
 */
  @HostBinding('class.is-expanded')
  get isExpanded() {
    return this.sidebarService.isExpanded;
  }

  /**
   * Logout navigation sample method
   */
  // logout() {
  //   this.storageService.clearLocalStorageAndNavigateToLogin();
  // }

  /**
   * Close the other panels except current panel
   * @param index index positon of expansion panel
   */
  expandPanel(index: number) {
    this.panels.forEach((panel, i) => {
      if (i !== index) {
        panel.close();
      }
    });
  }

  /**
 * Get the parent menu while click the submenu by the parentIndex
 * @param parentIndex 
 */
  subMenuClick(parentIndex: any) {
    this.chosenParentIndex = parentIndex;
    this.chosenParentMenu = this.menuList[parentIndex].menuName;
  }

  /**
   * Method to fetch menu list from the json file
   */
  getMenuList() {
    this.apiService.getList("/assets/menu/menu.json").subscribe((data: any) => {
      this.menuList = data;
      this.updateMenuAccess();
      this.setActiveParentIndex(this.router.url);
    });
  }

  /**
   * To set the expansion panel opened state after reloaded (If we are in user page, after reloaded the sidemenu expansin panel will close defaulty so this method will set the panel to open)
   * 
   * @param currentUrl router url to check the current page to open repected panel
   */
  setActiveParentIndex(currentUrl: string) {
    this.menuList.forEach((menuGroup: any, index: number) => {
      if (menuGroup.menu) {
        const isActive = menuGroup.menu.some((subMenu: any) =>
          currentUrl.includes(subMenu.routerLink)
        );
        if (isActive) {
          this.chosenParentIndex = index;
          this.chosenParentMenu = menuGroup.menuName;
        }
      }
    });
  }

  /**
   * This method updates the menuList canShow and accessType field to show the menus
   */
  updateMenuAccess() {

    this.menuList.map((item: { parent: any; menu: any[]; menuName: string; canShow: boolean; accessType: string; }) => {
      if (item.parent && item.menu) {
        // For parent menus with children
        item.menu = item.menu.map(sub => {
          const match = this.userDetails?.role?.moduleAccessList.find(access => access.moduleName.toLowerCase() === sub.text.toLowerCase());
          if (match) {
            sub.canShow = true;
            sub.accessType = match.accessType;
          }
          return sub;
        });
      } else {
        // For top-level menus
        const match = this.userDetails?.role?.moduleAccessList.find(access => access.moduleName.toLowerCase() === item.menuName.toLowerCase());
        if (match) {
          item.canShow = true;
          item.accessType = match.accessType;
        }
      }
      return item;
    });
    this.storageService.setMenu(this.menuList);
  }
}
