/**
 * CONFIRM_DIALOG
 *
 * A centralized configuration object that stores standard dialog content
 * (title, message, confirm and cancel button labels) for confirmation dialogs
 * used throughout the application.
 *
 * Categories include:
 * - DELETE_USER: Confirmation when deleting a user
 * - DELETE_ROLE: Confirmation when deleting a role
 * - LOGOUT: Confirmation when logging out
 */
export const CONFIRM_DIALOG = {
    //Delete user confirmation messages
    DELETE_USER: {
        TITLE: 'Delete User',
        MESSAGE: 'Are you sure you want to delete this user? This action cannot be undone.',
        CONFIRM_BUTTON: 'Delete',
        CANCEL_BUTTON: 'Cancel'
    },

    //Delete role confirmation messages
    DELETE_ROLE: {
        TITLE: 'Delete Role',
        MESSAGE: 'Are you sure you want to delete this role? This action cannot be undone.',
        CONFIRM_BUTTON: 'Delete',
        CANCEL_BUTTON: 'Cancel'
    },

    //logout confirmation messages
    LOGOUT: {
        TITLE: 'Logout',
        MESSAGE: 'Are you sure you want to logout?',
        CONFIRM_BUTTON: 'Logout',
        CANCEL_BUTTON: 'Stay'
    },

    //Delete role confirmation messages
    DELETE_INVOICEHISTORY: {
        TITLE: 'Delete Invoice',
        MESSAGE: 'Are you sure you want to delete this invoice?',
        CONFIRM_BUTTON: 'Delete',
        CANCEL_BUTTON: 'Cancel'
    },

    //Delete department account confirmation messages
    DELETE_DEPARTMENT_ACCOUNT: {
        TITLE: 'Delete Department',
        MESSAGE: 'Are you sure you want to delete this department? This action cannot be undone.',
        CONFIRM_BUTTON: 'Delete',
        CANCEL_BUTTON: 'Cancel'
    }


};
