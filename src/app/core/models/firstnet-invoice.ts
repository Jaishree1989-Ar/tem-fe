export interface FirstNetInvoice {
  invoiceId?: number;
  createdAt?: string; // ISO date-time string
  updatedAt?: string; // ISO date-time string
  foundationAccount?: string;
  foundationAccountName?: string;
  accountNumber?: string;
  accountAndDescriptions?: string;
  billingAccountName?: string;
  wirelessNumberAndDescriptions?: string;
  wirelessNumber?: string;
  department?: string;
  userName?: string;
  udl2?: string;
  udl4?: string;
  marketCycleEndDate?: string; // MM/dd/yyyy from backend
  invoiceDate?: string; // MM/dd/yyyy from backend
  rateCode?: string;
  ratePlanName?: string;
  groupId?: string;
  totalCurrentCharges?: string;
  totalMonthlyCharges?: string;
  totalActivitySinceLastBill?: string;
  totalTaxes?: string;
  totalCompanyFeesAndSurcharges?: string;
  totalKbUsage?: string;
  totalMinutesUsage?: string;
  totalMessages?: string;
  totalFanLevelCharges?: string;
  totalAdjustments?: string;
  totalReoccurringCharges?: string;
}