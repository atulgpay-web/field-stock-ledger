import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { calculateCurrentStock, sampleStockReceipts, sampleStockConsumptions } from '../data/sampleData';

export default function Dashboard() {
  const currentStock = calculateCurrentStock();
  const totalItems = currentStock.length;
  const totalValue = currentStock.reduce((sum, item) => sum + item.totalValue, 0);
  const totalReceipts = sampleStockReceipts.length;
  const totalConsumptions = sampleStockConsumptions.length;
  const lowStockItems = currentStock.filter(item => item.currentStock < 10).length;

  const recentActivity = [
    ...sampleStockReceipts.slice(-3).map(item => ({
      type: 'receipt',
      description: `Received ${item.quantityReceived} ${item.unitOfMeasurement} of ${item.itemName}`,
      date: item.createdAt,
      value: item.totalValue
    })),
    ...sampleStockConsumptions.slice(-3).map(item => ({
      type: 'consumption',
      description: `Used ${item.quantityUsed} units of ${item.itemName} for ${item.purpose}`,
      date: item.createdAt,
      value: -item.totalValue
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const topItems = currentStock
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalReceipts}</div>
            <p className="text-xs text-muted-foreground">Total receipts recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumptions</CardTitle>
            <Activity className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalConsumptions}</div>
            <p className="text-xs text-muted-foreground">Total consumptions logged</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${activity.value > 0 ? 'text-success' : 'text-destructive'}`}>
                    {activity.value > 0 ? '+' : ''}${Math.abs(activity.value).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Items by Value */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Top Items by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.itemCode} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.currentStock} {item.unitOfMeasurement} @ ${item.lastRatePerUnit}/unit
                    </p>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    ${item.totalValue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}