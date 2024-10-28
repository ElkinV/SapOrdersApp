export interface SalesOrderItem {
  itemCode: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id?: number;
  customerName: string;
  cardCode: string;
  items: SalesOrderItem[];
  total: number;
  date: string;
  comments: string;
}