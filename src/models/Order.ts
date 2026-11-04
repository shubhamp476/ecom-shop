// API response types. MongoDB persistence is implemented in backend/.
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
