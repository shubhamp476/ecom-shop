import mongoose, { Schema, Model, models } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  variantTitle?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "Credit Card" | "UPI" | "Net Banking" | "Cash on Delivery";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  fulfillmentStatus:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Return Requested"
    | "Returned";
  trackingNumber?: string;
  shippingCarrier?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  variantTitle: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: "India" },
      },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "UPI", "Net Banking", "Cash on Delivery"],
      default: "Credit Card",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Paid",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Returned",
      ],
      default: "Processing",
      index: true,
    },
    trackingNumber: String,
    shippingCarrier: String,
    customerNotes: String,
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  models.Order || mongoose.model<IOrder>("Order", OrderSchema);
