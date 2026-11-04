// API response types. MongoDB persistence is implemented in backend/.
export interface ICoupon {
  _id?: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired" | "Disabled";
  createdAt?: Date;
  updatedAt?: Date;
}
