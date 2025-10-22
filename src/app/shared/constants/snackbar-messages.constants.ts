/**
 * SNACKBAR_MESSAGES
 *
 * Centralized constant object to define all snackbar notification messages
 * used across the application for actions
 *
 * These messages are typically displayed using Angular Material Snackbars.
 */
export const SNACKBAR_MESSAGES = {
  // login and signup messages
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILURE: 'Login failed. Please try again',
  LOGIN_INTERNAL_PASSWORD: 'Internal password',
  LOGIN_INTERNAL_EMAIL: 'Internal email',
  LOGIN_INTERNAL_USER: 'Internal user',
  SOMETHING_WENT_WRONG: 'Something went wrong',

  // user messages
  USER_CREATED: 'User account created successfully',
  USER_DELETED: 'User account deleted',
  USER_DELETED_FAILED: 'Failed to delete user',
  USER_UPDATED: 'User account updated successfully',
  USER_FETCHED: 'User account fetched successfully',
  USER_FETCH_FAILED: 'Failed to fetch user account',
  USER_FETCH_ERROR: 'Error fetching user account',
  USER_FETCH_NO_DATA: 'No user data found',
  USER_FETCH_NO_DATA_ERROR: 'Error fetching user data',
  USER_FETCH_NO_DATA_SUCCESS: 'User data fetched successfully',
  USER_FETCH_NO_DATA_FAILURE: 'Failed to fetch user data',
  USER_FETCH_NO_DATA_WARNING: 'Warning: No user data found',
  USER_CREATION_NO_DATA_ERROR: 'Please fill all required fields correctly',

  // role messages
  ROLE_DELETED: 'Role deleted successfully',
  ROLE_DELETED_FAILED: 'Failed to delete role',
  ROLE_UPDATED: 'Role updated successfully',
  ROLE_FETCHED: 'Role fetched successfully',
  ROLE_FETCH_FAILED: 'Failed to fetch role',
  ROLE_FETCH_ERROR: 'Error fetching role',
  ROLE_FETCH_NO_DATA: 'No role data found',
  ROLE_FETCH_NO_DATA_ERROR: 'Error fetching role data',
  ROLE_FETCH_NO_DATA_SUCCESS: 'Role data fetched successfully',
  ROLE_FETCH_NO_DATA_FAILURE: 'Failed to fetch role data',
  ROLE_FETCH_NO_DATA_WARNING: 'Warning: No role data found',
  ROLE_CREATED: 'Role created successfully',
  ROLE_CREATION_FAILED: 'Role creation failed Please try again',
  ROLE_UPDATE_FAILED: 'Role update failed Please try again',
  ROLE_CREATION_ERROR: 'Error creating role',
  ROLE_CREATION_NO_DATA: 'No role data found',
  ROLE_CREATION_NO_DATA_ERROR: 'Error creating role data',

  //Telecom
  TELECOM_UPDATED: 'Telecom details updated',
  TELECOM_EXPORTED: 'Telecom report downloaded successfully',

  // Password change messages
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully!',


  //Wireless
  WIRELESS_EXPORTED: 'Wireless report downloaded successfully',

  //Invoice upload
  INVOICE_UPLOADED: 'Invoice details uploaded successfully',
  INVOICE_UPLOAD_FAILED: 'Invoice upload failed. Please try again.',
  INVALID_FILE: 'Invalid file type. Only xlsx, and csv allowed',
  INVOICE_DELETE: 'Invoice details deleted successfully',
  INVOICE_FAILED: 'Invoice delete failed Please try again',

  //Inventory upload
  INVENTORY_UPLOADED: 'Inventory details uploaded successfully',
  INVENTORY_UPLOAD_FAILED: 'Inventory upload failed. Please try again.',
  INVENTORY_INVALID_FILE: 'Invalid file type. Only xlsx, and csv allowed',
  INVENTORY_DELETE: 'Inventory details deleted successfully',
  INVENTORY_FAILED: 'Inventory delete failed Please try again',

  // Invoice review
  INVOICE_REVIEW_APPROVED: 'Invoice details approved successfully.',
  INVOICE_REVIEW_REJECTED: 'Invoice details rejected successfully.',
  INVOICE_REVIEW_INTERNAL_ERROR: 'An error occurred while processing the request.',

  // Inventory review
  INVENTORY_REVIEW_APPROVED: 'Inventory details approved successfully.',
  INVENTORY_REVIEW_REJECTED: 'Inventory details rejected successfully.',
  INVENTORY_REVIEW_INTERNAL_ERROR: 'An error occurred while processing the request.',

  // Department messages
  DEPARTMENT_ACCOUNT_CREATED: 'Department created successfully',
  DEPARTMENT_ACCOUNT_NOT_CREATED: 'File processed successfully, but no new mappings were created. Records may already exist or be invalid.',
  DEPARTMENT_ACCOUNT_CREATION_FAILED: 'Department creation failed Please try again',
  DEPARTMENT_ACCOUNT_DELETED: 'Department deleted successfully',
  DEPARTMENT_ACCOUNT_DELETED_FAILED: 'Failed to delete department Please try again',
  DEPARTMENT_UPDATED: 'Department updated successfully',
  DEPARTMENT_CREATED: 'Department created successfully',
  DEPARTMENT_UPDATED_FAILED: 'Department update failed Please try again',
  INVALID_FORM: 'Please fill all required fields correctly',

  // Recurring charges
  RECURRING_CHARGES_UPDATED: 'Recurring charges updated successfully.', 
  RECURRING_CHARGES_UPDATE_FAILED: 'Failed to update recurring charges. Please try again.',

  // Viscode update
  VISCODE_UPDATED: 'Viscode updated successfully.',
  VISCODE_UPDATE_FAILED: 'Failed to update viscode. Please try again.',
};
