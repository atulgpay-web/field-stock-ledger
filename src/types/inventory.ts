export interface StockReceipt {
  id: string;
  itemName: string;
  itemCode: string;
  quantityReceived: number;
  ratePerUnit: number;
  unitOfMeasurement: string;
  totalValue: number;
  supplierName: string;
  deliveryDate: string;
  receivedBy: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface StockConsumption {
  id: string;
  itemName: string;
  itemCode: string;
  quantityUsed: number;
  purpose: string;
  activityCode: string;
  usedBy: string;
  date: string;
  remarks: string;
  ratePerUnit: number;
  totalValue: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface InventoryItem {
  itemCode: string;
  itemName: string;
  currentStock: number;
  unitOfMeasurement: string;
  lastRatePerUnit: number;
  totalValue: number;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
}