import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EncryptDecryptService } from '../encryptDecrypt/encrypt-decrypt.service';

@Injectable({
  providedIn: 'root'
})

/**
 * StorageService
 *
 * A centralized service for securely storing and retrieving user and menu data
 * using encrypted cookies and localStorage.
 *
 * Features:
 * - Encrypts and stores user and menu objects in cookies.
 * - Retrieves and decrypts data from cookies.
 * - Handles localStorage set/remove actions with optional encryption.
 * - Provides a method to clear all storage and redirect to login.
 *
 * Dependencies:
 * - CookieService: For managing browser cookies.
 * - EncryptDecryptService: For AES-based encryption/decryption.
 * - Router: For navigation after logout or session clear.
 */
export class StorageService {

  constructor(private router: Router, private cookieService: CookieService, private encryptDecryptService: EncryptDecryptService) { }

  /**
   * Stores the encrypted user object in a cookie.
   * 
   * @param user - The user object to be stored.
   */
  setUser(user: User) {
    let encryptedStr = this.encryptDecryptService.encryptData(JSON.stringify(user));
    this.cookieService.set('user', encryptedStr, { expires: 1, path: '/' });
  }

  /**
   * Stores the encrypted menu array in a cookie.
   * 
   * @param menu - The menu array to be stored.
   */
  setMenu(menu: any) {
    let encryptedStr = this.encryptDecryptService.encryptData(JSON.stringify(menu));
    this.cookieService.set('menu', encryptedStr, { expires: 1, path: '/' });
  }

  /**
   * Retrieves and decrypts the user object from the cookie.
   * 
   * @returns The user object or `null` if the cookie is not found.
   */
  getUser(): User | null {
    const userCookie = this.cookieService.get('user');
    let decryptedUser = this.encryptDecryptService.decryptDataString(userCookie);
    return userCookie ? JSON.parse(decryptedUser) : null;
  }

  /**
 * Retrieves and decrypts the menu array from the cookie.
 * 
 * @returns The menu array or `null` if the cookie is not found.
 */
  getMenu(): any {
    const userCookie = this.cookieService.get('menu');
    let decryptedMenu = this.encryptDecryptService.decryptDataString(userCookie);
    return userCookie ? JSON.parse(decryptedMenu) : null;
  }

  /**
   * Clears the user data from the cookie.
   * This method deletes the user cookie from the browser, effectively logging out the user.
   */
  clearUser() {
    this.cookieService.delete('user');
  }

  /**
 * Clears the menu data from the cookie.
 * This method deletes the menu cookie from the browser
 */
  clearMenu() {
    this.cookieService.delete('menu');
  }

  /**
   * Stores or removes data in localStorage.
   *
   * @param action - `true` to set data, `false` to remove it.
   * @param key - The localStorage key.
   * @param value - The data to store (if action is true).
   */
  setDataInLocal(action: boolean, key: string, value?: any) {
    if (action)
      localStorage.setItem(key, this.encryptDecryptService.encryptData(JSON.stringify(value)) ?? '');
    else localStorage.removeItem(key);
  }

  /**
   * Clears user data, menu, and all localStorage, then navigates to login.
   */
  clearLocalStorageAndNavigateToLogin() {
    this.clearUser();
    this.clearMenu();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
