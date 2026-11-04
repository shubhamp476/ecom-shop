// API response types. MongoDB persistence is implemented in backend/.
export interface IActivityLog {
  _id?: string;
  actor: string;
  role: string;
  action: string; // e.g. "PRODUCT_CREATED", "PRICE_UPDATED", "STOCK_ADJUSTED", "ORDER_STATUS_CHANGED"
  entity: string; // e.g. "Product", "Order", "Category"
  entityId?: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}
