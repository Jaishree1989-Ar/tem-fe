import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { cryptoKey } from '../../../shared/constants/constants';
@Injectable({
  providedIn: 'root'
})

/**
 * EncryptDecryptService
 *
 * A service that provides AES encryption and decryption functionalities using CryptoJS.
 * It uses a predefined key and IV (initialization vector) in CBC mode with ZeroPadding.
 *
 * Purpose:
 * - Securely encrypt and decrypt data (typically strings or JSON arrays).
 * - Used for storing sensitive data in localStorage or transmitting securely.
 *
 * Dependencies:
 * - Uses `CryptoJS`
 */
export class EncryptDecryptService {

  private readonly key = CryptoJS.enc.Latin1.parse(cryptoKey.cryptoKey || '');
  private readonly iv = CryptoJS.enc.Latin1.parse(cryptoKey.cryptoIV || '');

  /**
   * Encrypts the given plain text data using AES.
   * 
   * @param data - The plain text data to encrypt.
   * @returns The AES encrypted string (Base64 format).
   */
  encryptData(data: string): string {
    var encryptedPassword = CryptoJS.AES.encrypt(data, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding });
    const encrypted = CryptoJS.AES.encrypt(data, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    });
    return encrypted.toString();
  }

  /**
   * Decrypts the given AES encrypted string into a JSON array.
   * 
   * @param encryptedData - The encrypted data string (Base64).
   * @returns The decrypted data as a JSON array.
   * @throws Error if data cannot be parsed into a valid JSON array.
   */
  decryptData(encryptedData: string): any[] {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    }).toString(CryptoJS.enc.Utf8);
    // Remove non-printable characters and trim
    const cleanedDecrypted = decrypted.replace(/[^\x20-\x7E]+/g, '').trim();
    try {
      const jsonArray = JSON.parse(cleanedDecrypted);
      if (Array.isArray(jsonArray)) {
        return jsonArray;
      } else {
        throw new Error('Decrypted data is not a JSON array');
      }
    } catch (error) {
      console.error('Failed to parse decrypted data:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
 * Decrypts the given AES encrypted string into plain text.
 * 
 * @param encryptedData - The encrypted data string (Base64).
 * @returns The decrypted plain text string.
 */
  decryptDataString(encryptedData: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
