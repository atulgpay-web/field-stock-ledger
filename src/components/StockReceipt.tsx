import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Eye } from 'lucide-react';
import { sampleStockReceipts, sampleUsers } from '../data/sampleData';
import { StockReceipt as StockReceiptType } from '../types/inventory';
import { toast } from '@/hooks/use-toast';

export default function StockReceipt() {
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState<StockReceiptType[]>(sampleStockReceipts);
  const [editingReceipt, setEditingReceipt] = useState<StockReceiptType | null>(null);
  
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    quantityReceived: '',
    ratePerUnit: '',
    unitOfMeasurement: '',
    supplierName: '',
    deliveryDate: '',
    receivedBy: '',
  });

  const units = ['Pieces', 'Bags', 'Cubic Feet', 'Meters', 'Tons', 'Liters', 'Square Feet'];
  const itemCodes = ['CEM001', 'STL001', 'SND001', 'BRK001', 'GRV001', 'PLY001', 'WIR001'];

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemCode: '',
      quantityReceived: '',
      ratePerUnit: '',
      unitOfMeasurement: '',
      supplierName: '',
      deliveryDate: '',
      receivedBy: '',
    });
    setEditingReceipt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalValue = parseFloat(formData.quantityReceived) * parseFloat(formData.ratePerUnit);
    const now = new Date().toISOString();
    
    if (editingReceipt) {
      const updatedReceipt: StockReceiptType = {
        ...editingReceipt,
        ...formData,
        quantityReceived: parseFloat(formData.quantityReceived),
        ratePerUnit: parseFloat(formData.ratePerUnit),
        totalValue,
        updatedAt: now,
        updatedBy: 'John Smith',
      };
      
      setReceipts(receipts.map(r => r.id === editingReceipt.id ? updatedReceipt : r));
      toast({ title: "Receipt updated successfully" });
    } else {
      const newReceipt: StockReceiptType = {
        id: `SR${String(receipts.length + 1).padStart(3, '0')}`,
        ...formData,
        quantityReceived: parseFloat(formData.quantityReceived),
        ratePerUnit: parseFloat(formData.ratePerUnit),
        totalValue,
        createdAt: now,
        createdBy: 'John Smith',
      };
      
      setReceipts([newReceipt, ...receipts]);
      toast({ title: "Receipt created successfully" });
    }
    
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (receipt: StockReceiptType) => {
    setFormData({
      itemName: receipt.itemName,
      itemCode: receipt.itemCode,
      quantityReceived: receipt.quantityReceived.toString(),
      ratePerUnit: receipt.ratePerUnit.toString(),
      unitOfMeasurement: receipt.unitOfMeasurement,
      supplierName: receipt.supplierName,
      deliveryDate: receipt.deliveryDate,
      receivedBy: receipt.receivedBy,
    });
    setEditingReceipt(receipt);
    setShowForm(true);
  };

  const totalValue = parseFloat(formData.quantityReceived || '0') * parseFloat(formData.ratePerUnit || '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Stock Receipt</h2>
            <p className="text-muted-foreground">Record incoming inventory items</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Receipt'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{editingReceipt ? 'Edit Receipt' : 'New Stock Receipt'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  required
                  placeholder="Enter item name"
                />
              </div>

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
                    {itemCodes.map(code => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityReceived">Quantity Received</Label>
                <Input
                  id="quantityReceived"
                  type="number"
                  value={formData.quantityReceived}
                  onChange={(e) => setFormData({...formData, quantityReceived: e.target.value})}
                  required
                  placeholder="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ratePerUnit">Rate per Unit</Label>
                <Input
                  id="ratePerUnit"
                  type="number"
                  value={formData.ratePerUnit}
                  onChange={(e) => setFormData({...formData, ratePerUnit: e.target.value})}
                  required
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasurement">Unit of Measurement</Label>
                <Select 
                  value={formData.unitOfMeasurement} 
                  onValueChange={(value) => setFormData({...formData, unitOfMeasurement: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Value (Auto-calculated)</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-medium">
                  ${totalValue.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  required
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivedBy">Received By</Label>
                <Select 
                  value={formData.receivedBy} 
                  onValueChange={(value) => setFormData({...formData, receivedBy: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select receiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleUsers.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
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

      {/* Receipts Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Stock Receipts</CardTitle>
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
                  <TableHead>Rate</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Received By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.id}</TableCell>
                    <TableCell>{receipt.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{receipt.itemCode}</Badge>
                    </TableCell>
                    <TableCell>{receipt.quantityReceived} {receipt.unitOfMeasurement}</TableCell>
                    <TableCell>${receipt.ratePerUnit}</TableCell>
                    <TableCell className="font-medium">${receipt.totalValue.toLocaleString()}</TableCell>
                    <TableCell>{receipt.supplierName}</TableCell>
                    <TableCell>{new Date(receipt.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>{receipt.receivedBy}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(receipt)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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