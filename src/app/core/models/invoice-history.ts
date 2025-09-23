export interface InvoiceHistory {
  invoiceId?: number; // optional if not set when creating new record
  createdAt?: string; // ISO date string (Timestamp from backend)
  updatedAt?: string;
  name?: string;
  carrier?: string;
  dateUploaded?: string;
  uploadedBy?: string;
  fileSize?: string;
  isDeleted?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED';
}