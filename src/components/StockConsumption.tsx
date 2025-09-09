import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Minus, Activity, Edit, AlertCircle } from 'lucide-react';
import { sampleUsers } from '../data/sampleData';
import { StockConsumption as StockConsumptionType, InventoryItem } from '../types/inventory';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function StockConsumption() {
  const [showForm, setShowForm] = useState(false);
  const [consumptions, setConsumptions] = useState<StockConsumptionType[]>([]);
  const [editingConsumption, setEditingConsumption] = useState<StockConsumptionType | null>(null);
  const [currentStock, setCurrentStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    quantityUsed: '',
    purpose: '',
    activityCode: '',
    usedBy: '',
    date: '',
    remarks: '',
  });

  const activityCodes = ['ACT001', 'ACT002', 'ACT003', 'ACT004', 'ACT005', 'ACT006'];
  const purposes = [
    'Foundation Work', 
    'Column Reinforcement', 
    'Plastering Work', 
    'Roofing Work', 
    'Electrical Work', 
    'Plumbing Work'
  ];

  useEffect(() => {
    fetchConsumptions();
    fetchCurrentStock();
  }, []);

  const fetchConsumptions = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_consumptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedConsumptions = data?.map(consumption => ({
        id: consumption.id,
        itemName: consumption.item_name,
        itemCode: consumption.item_code,
        quantityUsed: consumption.quantity_used,
        purpose: consumption.purpose,
        activityCode: consumption.activity_code,
        usedBy: consumption.used_by,
        date: consumption.date,
        remarks: consumption.remarks,
        ratePerUnit: consumption.rate_per_unit,
        totalValue: consumption.total_value,
        createdAt: consumption.created_at,
        createdBy: 'System User',
        updatedAt: consumption.updated_at,
        updatedBy: consumption.updated_at ? 'System User' : undefined
      })) || [];
      
      setConsumptions(formattedConsumptions);
    } catch (error: any) {
      console.error('Error fetching consumptions:', error);
    }
  };

  const fetchCurrentStock = async () => {
    try {
      const { data, error } = await supabase
        .from('current_inventory')
        .select('*');

      if (error) throw error;
      
      const formattedStock = data?.map(item => ({
        itemCode: item.item_code,
        itemName: item.item_name,
        currentStock: item.current_stock,
        unitOfMeasurement: item.unit_of_measurement,
        lastRatePerUnit: item.last_rate_per_unit,
        totalValue: item.total_value,
        lastUpdated: item.last_updated,
      })) || [];
      
      setCurrentStock(formattedStock);
    } catch (error: any) {
      console.error('Error fetching current stock:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemCode: '',
      quantityUsed: '',
      purpose: '',
      activityCode: '',
      usedBy: '',
      date: '',
      remarks: '',
    });
    setEditingConsumption(null);
  };

  const getAvailableStock = (itemCode: string) => {
    const item = currentStock.find(stock => stock.itemCode === itemCode);
    return item ? item.currentStock : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const availableStock = getAvailableStock(formData.itemCode);
    const quantityUsed = parseFloat(formData.quantityUsed);
    
    if (quantityUsed > availableStock && !editingConsumption) {
      toast({ 
        title: "Insufficient Stock", 
        description: `Only ${availableStock} units available in stock.`,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    const stockItem = currentStock.find(item => item.itemCode === formData.itemCode);
    const ratePerUnit = stockItem?.lastRatePerUnit || 0;
    const totalValue = quantityUsed * ratePerUnit;
    const now = new Date().toISOString();

    try {
      if (editingConsumption) {
        const { error } = await supabase
          .from('stock_consumptions')
          .update({
            item_name: formData.itemName,
            item_code: formData.itemCode,
            quantity_used: quantityUsed,
            purpose: formData.purpose,
            activity_code: formData.activityCode,
            used_by: formData.usedBy,
            date: formData.date,
            remarks: formData.remarks,
            rate_per_unit: ratePerUnit,
            total_value: totalValue,
            user_id: '00000000-0000-0000-0000-000000000000'
          })
          .eq('id', editingConsumption.id);

        if (error) throw error;
        
        toast({ title: "Consumption updated in database successfully" });
        await fetchConsumptions();
        await fetchCurrentStock();
      } else {
        const { error } = await supabase
          .from('stock_consumptions')
          .insert({
            item_name: stockItem?.itemName || formData.itemName,
            item_code: formData.itemCode,
            quantity_used: quantityUsed,
            purpose: formData.purpose,
            activity_code: formData.activityCode,
            used_by: formData.usedBy,
            date: formData.date,
            remarks: formData.remarks,
            rate_per_unit: ratePerUnit,
            total_value: totalValue,
            user_id: '00000000-0000-0000-0000-000000000000'
          });

        if (error) throw error;
        
        toast({ title: "Consumption saved to database successfully" });
        await fetchConsumptions();
        await fetchCurrentStock();
      }
    } catch (error: any) {
      console.error('Database error:', error);
      
      // Fallback to local state
      if (editingConsumption) {
        const updatedConsumption: StockConsumptionType = {
          ...editingConsumption,
          ...formData,
          quantityUsed,
          ratePerUnit,
          totalValue,
          updatedAt: now,
          updatedBy: 'Demo User',
        };
        
        setConsumptions(consumptions.map(c => c.id === editingConsumption.id ? updatedConsumption : c));
        toast({ title: "Consumption updated (local only - add authentication to save to database)" });
      } else {
        const newConsumption: StockConsumptionType = {
          id: `SC${String(consumptions.length + 1).padStart(3, '0')}`,
          itemName: stockItem?.itemName || formData.itemName,
          ...formData,
          quantityUsed,
          ratePerUnit,
          totalValue,
          createdAt: now,
          createdBy: 'Demo User',
        };
        
        setConsumptions([newConsumption, ...consumptions]);
        toast({ title: "Consumption recorded (local only - add authentication to save to database)" });
      }
    } finally {
      setLoading(false);
      resetForm();
      setShowForm(false);
    }
  };

  const handleEdit = (consumption: StockConsumptionType) => {
    setFormData({
      itemName: consumption.itemName,
      itemCode: consumption.itemCode,
      quantityUsed: consumption.quantityUsed.toString(),
      purpose: consumption.purpose,
      activityCode: consumption.activityCode,
      usedBy: consumption.usedBy,
      date: consumption.date,
      remarks: consumption.remarks,
    });
    setEditingConsumption(consumption);
    setShowForm(true);
  };

  const selectedStock = currentStock.find(item => item.itemCode === formData.itemCode);
  const totalValue = parseFloat(formData.quantityUsed || '0') * (selectedStock?.lastRatePerUnit || 0);
  const availableStock = getAvailableStock(formData.itemCode);
  const isInsufficientStock = parseFloat(formData.quantityUsed || '0') > availableStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Stock Consumption</h2>
            <p className="text-muted-foreground">Record inventory usage and activities</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-gradient-primary hover:opacity-90"
        >
          <Minus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Consumption'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{editingConsumption ? 'Edit Consumption' : 'New Stock Consumption'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Select 
                  value={formData.itemCode} 
                  onValueChange={(value) => setFormData({...formData, itemCode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item code" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStock.map(item => (
                      <SelectItem key={item.itemCode} value={item.itemCode}>
                        {item.itemCode} - {item.itemName} (Available: {item.currentStock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Item Name</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedStock?.itemName || 'Select item code first'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Stock</Label>
                <div className={`p-3 rounded-md text-sm font-medium ${
                  availableStock < 10 ? 'bg-warning/20 text-warning' : 'bg-muted'
                }`}>
                  {availableStock} {selectedStock?.unitOfMeasurement || 'units'}
                  {availableStock < 10 && (
                    <div className="flex items-center mt-1 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Low stock warning
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityUsed">Quantity Used</Label>
                <Input
                  id="quantityUsed"
                  type="number"
                  value={formData.quantityUsed}
                  onChange={(e) => setFormData({...formData, quantityUsed: e.target.value})}
                  required
                  placeholder="0"
                  step="0.01"
                  className={isInsufficientStock ? 'border-destructive' : ''}
                />
                {isInsufficientStock && (
                  <p className="text-xs text-destructive">Quantity exceeds available stock!</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose/Activity</Label>
                <Select 
                  value={formData.purpose} 
                  onValueChange={(value) => setFormData({...formData, purpose: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map(purpose => (
                      <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityCode">Activity Code</Label>
                <Select 
                  value={formData.activityCode} 
                  onValueChange={(value) => setFormData({...formData, activityCode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity code" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityCodes.map(code => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usedBy">Used By</Label>
                <Select 
                  value={formData.usedBy} 
                  onValueChange={(value) => setFormData({...formData, usedBy: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team/person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Construction Team A">Construction Team A</SelectItem>
                    <SelectItem value="Construction Team B">Construction Team B</SelectItem>
                    <SelectItem value="Finishing Team">Finishing Team</SelectItem>
                    <SelectItem value="Electrical Team">Electrical Team</SelectItem>
                    {sampleUsers.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Total Value (Auto-calculated)</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-medium">
                  ${totalValue.toFixed(2)}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Additional notes or remarks"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <Button 
                  type="submit" 
                  disabled={loading || (isInsufficientStock && !editingConsumption)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {loading ? 'Saving...' : editingConsumption ? 'Update Consumption' : 'Record Consumption'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Consumptions Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Stock Consumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Activity Code</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumptions.map((consumption) => (
                  <TableRow key={consumption.id}>
                    <TableCell className="font-medium">{consumption.id}</TableCell>
                    <TableCell>{consumption.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{consumption.itemCode}</Badge>
                    </TableCell>
                    <TableCell>{consumption.quantityUsed} units</TableCell>
                    <TableCell>{consumption.purpose}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{consumption.activityCode}</Badge>
                    </TableCell>
                    <TableCell>{consumption.usedBy}</TableCell>
                    <TableCell>{new Date(consumption.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${consumption.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(consumption)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}