export interface PaymentDetails {
  name: string;
  email: string;
}

export interface PayPalResponse {
  orderID: string;
  payerID?: string;
  paymentID?: string;
}

export interface PaymentState extends PayPalResponse, PaymentDetails {}

export type PricingCurrency = "USD" | "GBP" | "EUR";

export type PricingRegion = "US" | "UK" | "EU" | "INTL";

export interface RegionPricing {
  region: PricingRegion;
  countryCode: string;
  regionLabel: string;
  currency: PricingCurrency;
  /** Price in minor currency units (cents / pence). */
  amount: number;
  priceLabel: string;
}

export interface PaidPass {
  orderID: string;
  payerID?: string;
  name?: string;
  email?: string;
  paidAt: number;
  expiresAt: number;
  currency: PricingCurrency;
  amount: number;
  priceLabel: string;
}
