// API response types. MongoDB persistence is implemented in backend/.
export interface IInventoryLog {
  _id?: string;
  productId: string;
  productName: string;
  sku: string;
  type: "stock_in" | "stock_out" | "adjustment" | "order" | "return";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actor: string;
  timestamp: Date;
}
