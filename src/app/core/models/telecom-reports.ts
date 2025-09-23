/**
 * Interface representing a telecom reports entity.
 */
export interface TelecomReports {
  id?: number; // auto-generated
  department?: string;
  carrier?: string;
  phoneNumber?: string;
  masterAccount?: string;
  accountNumber?: string;
  nameOnInvoice?: string;
  accountDescription?: string;
  accountOwners?: string;
  mailingAddress?: string;
  deviceClass?: string;
  deviceModel?: string;
  imei?: string;
  sim?: string;
  ipAddress?: string;
  circuitIdentifier?: string;
  servicePlan?: string;
  status?: string;
  activatedOn?: Date | string;
  deactivatedOn?: Date | string;
  lastInvoiceOn?: Date | string;
  viscode?: string;
  monthlyRecurringCost?: number;
  billingAddress?: string;
  billingBuildingLocation?: string;
  invoiceDescription?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: Date | string;
  apEditListNumber?: string;
  paymentAmount?: number;
  checkNumber?: string;
}
