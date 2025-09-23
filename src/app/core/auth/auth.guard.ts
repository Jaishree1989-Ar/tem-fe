import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EncryptDecryptService } from '../services/encryptDecrypt/encrypt-decrypt.service';

/**
 * Route guard to prevent unauthorized access to protected routes.
 *
 * Dependencies:
 * - EncryptDecryptService: Used to decrypt the login status.
 * - Router: Used for navigation to the login page if not authenticated.
 *
 * @param route - The current route snapshot.
 * @param state - The current router state snapshot.
 * @returns `true` if the user is authenticated, otherwise navigates to `/login` and returns `false`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const encryptDecryptService = inject(EncryptDecryptService);
  
  const isLoggedIn = JSON.parse(encryptDecryptService.decryptDataString(localStorage.getItem('isLoggedIn') || 'false'));
  if (isLoggedIn)
    return true;
  else {
    router.navigate(['/login']);
    return false;
  }
};
