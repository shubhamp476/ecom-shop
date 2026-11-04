// API response types. MongoDB persistence is implemented in backend/.
export interface ICustomer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive" | "Blocked";
  tier: "Standard" | "Silver" | "Gold" | "VIP";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
