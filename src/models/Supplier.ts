// API response types. MongoDB persistence is implemented in backend/.
export interface ISupplier {
  _id?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  brandsSupplied: string[];
  paymentTerms: string;
  status: "Active" | "Inactive";
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
