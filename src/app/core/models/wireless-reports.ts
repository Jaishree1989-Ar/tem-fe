/**
 * Interface representing a wireless reports entity.
 */
export interface WirelessReports {
  id: number;

  carrier: string;
  account: string;
  phoneNumber: string;
  nameOnInvoice: string;
  department: string;
  visCode: string;
  deviceClass: string;
  deviceModel: string;
  imei: string;
  sim: string;
  status: string;
  eligibilityDate: string;
  servicePlan: string;
  lastInvoiceOn: Date;

  jan25PlanUsage: number;
  feb25PlanUsage: number;
  mar25PlanUsage: number;
  planUsageAverage: number;
  planUsageTotal: number;

  jan25DataUsage: number;
  feb25DataUsage: number;
  mar25DataUsage: number;
  dataUsageAverage: number;
  dataUsageTotal: number;

  jan25MessagingUsage: number;
  feb25MessagingUsage: number;
  mar25MessagingUsage: number;
  messagingUsageAverage: number;
  messagingUsageTotal: number;

  usageChargesAverage: number;
  usageChargesTotal: number;

  accessChargesAverage: number;
  accessChargesTotal: number;

  equipmentChargesAverage: number;
  equipmentChargesTotal: number;

  otherChargesAverage: number;
  otherChargesTotal: number;

  taxesAndFeesAverage: number;
  taxesAndFeesTotal: number;

  adjustmentsAverage: number;
  adjustmentsTotal: number;

  jan25TotalCharges: number;
  feb25TotalCharges: number;
  mar25TotalCharges: number;

  monthlyAverage: number;
  total: number;
}
