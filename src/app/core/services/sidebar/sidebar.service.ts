import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  constructor() { }
  isExpanded = true;

  /**
   * The function toggles the state of the sidenav between expanded and collapsed.
   */
  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }
}
