import mongoose, { Schema, Model, models } from "mongoose";

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

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: String,
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: Number,
    usageLimit: { type: Number, default: 500 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Expired", "Disabled"], default: "Active" },
  },
  {
    timestamps: true,
  }
);

export const Coupon: Model<ICoupon> =
  models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
