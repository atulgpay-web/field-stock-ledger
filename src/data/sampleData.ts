import { StockReceipt, StockConsumption, InventoryItem, User } from '../types/inventory';

export const sampleUsers: User[] = [
  { id: '1', name: 'John Smith', role: 'Site Supervisor' },
  { id: '2', name: 'Sarah Johnson', role: 'Project Manager' },
  { id: '3', name: 'Mike Wilson', role: 'Site Engineer' },
  { id: '4', name: 'Emma Davis', role: 'Store Keeper' },
];

export const sampleStockReceipts: StockReceipt[] = [
  {
    id: 'SR001',
    itemName: 'Portland Cement',
    itemCode: 'CEM001',
    quantityReceived: 100,
    ratePerUnit: 8.50,
    unitOfMeasurement: 'Bags',
    totalValue: 850,
    supplierName: 'ABC Construction Materials',
    deliveryDate: '2024-01-15',
    receivedBy: 'John Smith',
    createdAt: '2024-01-15T10:30:00',
    createdBy: 'John Smith',
  },
  {
    id: 'SR002',
    itemName: 'Steel Rebar 12mm',
    itemCode: 'STL001',
    quantityReceived: 50,
    ratePerUnit: 85.00,
    unitOfMeasurement: 'Pieces',
    totalValue: 4250,
    supplierName: 'Steel World Ltd',
    deliveryDate: '2024-01-16',
    receivedBy: 'Mike Wilson',
    createdAt: '2024-01-16T14:20:00',
    createdBy: 'Mike Wilson',
  },
  {
    id: 'SR003',
    itemName: 'Sand (Fine)',
    itemCode: 'SND001',
    quantityReceived: 20,
    ratePerUnit: 45.00,
    unitOfMeasurement: 'Cubic Feet',
    totalValue: 900,
    supplierName: 'Quality Aggregates',
    deliveryDate: '2024-01-17',
    receivedBy: 'Emma Davis',
    createdAt: '2024-01-17T09:15:00',
    createdBy: 'Emma Davis',
  },
  {
    id: 'SR004',
    itemName: 'Red Bricks',
    itemCode: 'BRK001',
    quantityReceived: 5000,
    ratePerUnit: 0.15,
    unitOfMeasurement: 'Pieces',
    totalValue: 750,
    supplierName: 'Brick Masters',
    deliveryDate: '2024-01-18',
    receivedBy: 'John Smith',
    createdAt: '2024-01-18T11:45:00',
    createdBy: 'John Smith',
  },
];

export const sampleStockConsumptions: StockConsumption[] = [
  {
    id: 'SC001',
    itemName: 'Portland Cement',
    itemCode: 'CEM001',
    quantityUsed: 25,
    purpose: 'Foundation Work',
    activityCode: 'ACT001',
    usedBy: 'Construction Team A',
    date: '2024-01-20',
    remarks: 'Foundation casting for Block A',
    ratePerUnit: 8.50,
    totalValue: 212.50,
    createdAt: '2024-01-20T08:30:00',
    createdBy: 'John Smith',
  },
  {
    id: 'SC002',
    itemName: 'Steel Rebar 12mm',
    itemCode: 'STL001',
    quantityUsed: 15,
    purpose: 'Column Reinforcement',
    activityCode: 'ACT002',
    usedBy: 'Construction Team B',
    date: '2024-01-21',
    remarks: 'Column reinforcement Ground Floor',
    ratePerUnit: 85.00,
    totalValue: 1275.00,
    createdAt: '2024-01-21T10:15:00',
    createdBy: 'Mike Wilson',
  },
  {
    id: 'SC003',
    itemName: 'Sand (Fine)',
    itemCode: 'SND001',
    quantityUsed: 8,
    purpose: 'Plastering Work',
    activityCode: 'ACT003',
    usedBy: 'Finishing Team',
    date: '2024-01-22',
    remarks: 'Internal wall plastering',
    ratePerUnit: 45.00,
    totalValue: 360.00,
    createdAt: '2024-01-22T14:20:00',
    createdBy: 'Sarah Johnson',
  },
];

export const calculateCurrentStock = (): InventoryItem[] => {
  const itemMap = new Map<string, InventoryItem>();

  // Add received items
  sampleStockReceipts.forEach(receipt => {
    const key = receipt.itemCode;
    if (itemMap.has(key)) {
      const item = itemMap.get(key)!;
      item.currentStock += receipt.quantityReceived;
      item.totalValue += receipt.totalValue;
      item.lastRatePerUnit = receipt.ratePerUnit;
      item.lastUpdated = receipt.createdAt;
    } else {
      itemMap.set(key, {
        itemCode: receipt.itemCode,
        itemName: receipt.itemName,
        currentStock: receipt.quantityReceived,
        unitOfMeasurement: receipt.unitOfMeasurement,
        lastRatePerUnit: receipt.ratePerUnit,
        totalValue: receipt.totalValue,
        lastUpdated: receipt.createdAt,
      });
    }
  });

  // Subtract consumed items
  sampleStockConsumptions.forEach(consumption => {
    const key = consumption.itemCode;
    if (itemMap.has(key)) {
      const item = itemMap.get(key)!;
      item.currentStock -= consumption.quantityUsed;
      item.totalValue = item.currentStock * item.lastRatePerUnit;
      if (consumption.createdAt > item.lastUpdated) {
        item.lastUpdated = consumption.createdAt;
      }
    }
  });

  return Array.from(itemMap.values());
};