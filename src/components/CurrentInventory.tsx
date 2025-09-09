import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { List, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { calculateCurrentStock } from '../data/sampleData';

export default function CurrentInventory() {
  const currentStock = calculateCurrentStock();
  const totalValue = currentStock.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = currentStock.filter(item => item.currentStock < 10);
  const outOfStockItems = currentStock.filter(item => item.currentStock <= 0);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock < 10) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <List className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Current Inventory</h2>
          <p className="text-muted-foreground">Real-time stock levels and valuation</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentStock.length}</div>
            <p className="text-xs text-muted-foreground">Unique items in inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {outOfStockItems.length} out of stock, {lowStockItems.length - outOfStockItems.length} low stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rate per Unit</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStock.map((item) => {
                  const status = getStockStatus(item.currentStock);
                  return (
                    <TableRow key={item.itemCode}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{item.itemCode}</Badge>
                      </TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell className={`font-medium ${
                        item.currentStock <= 0 ? 'text-destructive' :
                        item.currentStock < 10 ? 'text-warning' : 'text-foreground'
                      }`}>
                        {item.currentStock}
                      </TableCell>
                      <TableCell>{item.unitOfMeasurement}</TableCell>
                      <TableCell>${item.lastRatePerUnit.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        ${item.totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning shadow-card">
          <CardHeader>
            <CardTitle className="text-warning flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.itemCode} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {item.itemCode} | Only {item.currentStock} {item.unitOfMeasurement} remaining
                    </p>
                  </div>
                  <Badge variant={item.currentStock <= 0 ? 'destructive' : 'warning'}>
                    {item.currentStock <= 0 ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}