// API response types. MongoDB persistence is implemented in backend/.
export interface IStoreSettings {
  _id?: string;
  storeName: string;
  storeTagline: string;
  currency: "INR" | "USD" | "EUR";
  currencySymbol: string;
  defaultTaxRate: number; // default GST % (18)
  lowStockThreshold: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  codEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  orderPrefix: string;
  maintenanceMode: boolean;
  updatedAt?: Date;
}
