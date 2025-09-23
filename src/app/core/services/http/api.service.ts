import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})

/**
 * ApiService
 *
 * A reusable HTTP service for performing CRUD operations using Angular's HttpClient.
 * This service is used across the application to make API calls to the backend.
 *
 * Features:
 * - Automatically appends the base URL from environment settings.
 * - Standardized return type using `ApiResponse<T>`.
 */
export class ApiService {

  constructor(private http: HttpClient) { }
  baseUrl: string = environment.apiUrl;

  /**
   * Sends a GET request to the given endpoint.
   * 
   * @param endpoint - API endpoint relative to the base URL.
   * @returns Observable containing `ApiResponse<T>`.
   */
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.baseUrl + endpoint);
  }

  /**
 * Sends a GET request with additional request options (e.g., headers, params).
 *
 * @param endpoint - API endpoint relative to the base URL.
 * @param data - Request options to be passed (e.g., headers, params).
 * @returns Observable containing `ApiResponse<T>`.
 */
  getWithData<T>(endpoint: string, data: any): Observable<any> {
    return this.http.get<ApiResponse<T>>(this.baseUrl + endpoint, data);
  }

  /**
   * 
   * @param endpoint endpoint for local json file from asset folder
   * @returns array to the side menu list
   */
  getList<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(endpoint);
  }

  /**
 * Sends a POST request to the given endpoint with provided data.
 *
 * @param endpoint - API endpoint relative to the base URL.
 * @param data - Payload to be sent in the body.
 * @returns Observable containing `ApiResponse<T>`.
 */
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.baseUrl + endpoint, data);
  }

  /**
 * Sends a PUT request to the given endpoint with provided data.
 *
 * @param endpoint - API endpoint relative to the base URL.
 * @param data - Payload to be updated.
 * @returns Observable containing `ApiResponse<T>`.
 */
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.baseUrl + endpoint, data);
  }

  /**
 * Sends a DELETE request to the given endpoint.
 *
 * @param endpoint - API endpoint relative to the base URL.
 * @returns Observable containing `ApiResponse<T>`.
 */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.baseUrl + endpoint);
  }

  /**
   * Requests a password reset by sending an email to the backend.
   * 
   * @param email - User's email address to send the reset link.
   * @returns Observable containing `ApiResponse<string>` with the status message.
   */
  requestPasswordReset(email: string): Observable<ApiResponse<string>> {
    const endpoint = 'auth/forgot-password';
    const body = { email: email };
    return this.post<string>(endpoint, body);
  }

  /**
 * Reset password using temporary password
 * @param resetData Object containing email, temporaryPassword, newPassword, confirmPassword
 * @returns Observable with API response
 */
  resetPassword(resetData: {
    email: string;
    temporaryPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<ApiResponse<string>> {
    const endpoint = 'auth/reset-password';
    return this.post<string>(endpoint, resetData);
  }

  /**
   * Validate temporary password (optional method for frontend validation)
   * @param email User's email
   * @param tempPassword Temporary password to validate
   * @returns Observable with validation result
   */
  validateTemporaryPassword(email: string, tempPassword: string): Observable<ApiResponse<boolean>> {
    const endpoint = `auth/validate-temp-password?email=${encodeURIComponent(email)}&tempPassword=${encodeURIComponent(tempPassword)}`;
    return this.get<boolean>(endpoint);
  }

  /** 
 * Sends a PATCH request to the given endpoint with provided data. 
 * 
 * @param endpoint - API endpoint relative to the base URL. 
 * @param data - Payload for the partial update. 
 * @returns Observable containing `ApiResponse<T>`. 
 */ 
  patch<T>(endpoint: string, data: any): Observable<ApiResponse<T>> { 
    return this.http.patch<ApiResponse<T>>(this.baseUrl + endpoint, data); 
  } 

}
