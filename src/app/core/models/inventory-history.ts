export interface InventoryHistory {
  invoiceId?: number;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  carrier?: string;
  dateUploaded?: string;
  uploadedBy?: string;
  fileSize?: string;
  isDeleted?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED';
}