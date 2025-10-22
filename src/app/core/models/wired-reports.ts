/**
 * Interface representing a single detail line item from a Wired report.
 */
export interface WiredReports {
  id: number;
  section: string;
  invoiceNumber: string;
  invoiceDate: string;
  ban: string;
  subgroup: string;
  btn: string;
  btnDescription: string;
  svcId: string;
  itemNumber: string;
  provider: string;
  contract: string;
  productId: string;
  featureName: string;
  description: string;
  quantity: number;
  minutes: number;
  contractRate: number;
  totalCharge: number;
  saafCalculation: string;
  chargeType: string;
  billPeriod: string;
  action: string;
  srNumber: string;
  node: string;
  svcAddress1: string;
  svcAddress2: string;
  svcCity: string;
  svcState: string;
  svcZip: string;
  viscode: string;
  carrier: string;
}