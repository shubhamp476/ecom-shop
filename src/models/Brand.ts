// API response types. MongoDB persistence is implemented in backend/.
export interface IBrand {
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  banner?: string;
  description: string;
  website?: string;
  countryOfOrigin?: string;
  warrantyPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
  status: "Active" | "Inactive";
  featured?: boolean;
  productCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
