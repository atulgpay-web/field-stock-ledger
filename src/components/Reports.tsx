import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';
import { sampleStockReceipts, sampleStockConsumptions, calculateCurrentStock } from '../data/sampleData';
import { toast } from '@/hooks/use-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('receipt');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const currentStock = calculateCurrentStock();

  const getFilteredReceipts = () => {
    let filtered = [...sampleStockReceipts];
    if (dateFrom) {
      filtered = filtered.filter(r => r.deliveryDate >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(r => r.deliveryDate <= dateTo);
    }
    return filtered;
  };

  const getFilteredConsumptions = () => {
    let filtered = [...sampleStockConsumptions];
    if (dateFrom) {
      filtered = filtered.filter(c => c.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(c => c.date <= dateTo);
    }
    return filtered;
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/\s+/g, '')];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: `${filename} exported successfully` });
  };

  const exportReceiptReport = () => {
    const data = getFilteredReceipts().map(r => ({
      id: r.id,
      itemname: r.itemName,
      itemcode: r.itemCode,
      quantityreceived: r.quantityReceived,
      rateperunit: r.ratePerUnit,
      unitofmeasurement: r.unitOfMeasurement,
      totalvalue: r.totalValue,
      suppliername: r.supplierName,
      deliverydate: r.deliveryDate,
      receivedby: r.receivedBy,
      createdat: new Date(r.createdAt).toLocaleString(),
      createdby: r.createdBy
    }));
    
    const headers = [
      'ID', 'Item Name', 'Item Code', 'Quantity Received', 'Rate Per Unit', 
      'Unit Of Measurement', 'Total Value', 'Supplier Name', 'Delivery Date', 
      'Received By', 'Created At', 'Created By'
    ];
    
    exportToCSV(data, 'Stock_Receipt_Report', headers);
  };

  const exportConsumptionReport = () => {
    const data = getFilteredConsumptions().map(c => ({
      id: c.id,
      itemname: c.itemName,
      itemcode: c.itemCode,
      quantityused: c.quantityUsed,
      purpose: c.purpose,
      activitycode: c.activityCode,
      usedby: c.usedBy,
      date: c.date,
      remarks: c.remarks,
      rateperunit: c.ratePerUnit,
      totalvalue: c.totalValue,
      createdat: new Date(c.createdAt).toLocaleString(),
      createdby: c.createdBy
    }));
    
    const headers = [
      'ID', 'Item Name', 'Item Code', 'Quantity Used', 'Purpose', 'Activity Code',
      'Used By', 'Date', 'Remarks', 'Rate Per Unit', 'Total Value', 'Created At', 'Created By'
    ];
    
    exportToCSV(data, 'Stock_Consumption_Report', headers);
  };

  const exportValuationReport = () => {
    const data = currentStock.map(item => ({
      itemcode: item.itemCode,
      itemname: item.itemName,
      currentstock: item.currentStock,
      unitofmeasurement: item.unitOfMeasurement,
      lastrateperunit: item.lastRatePerUnit,
      totalvalue: item.totalValue,
      lastupdated: new Date(item.lastUpdated).toLocaleString()
    }));
    
    const headers = [
      'Item Code', 'Item Name', 'Current Stock', 'Unit Of Measurement', 
      'Last Rate Per Unit', 'Total Value', 'Last Updated'
    ];
    
    exportToCSV(data, 'Stock_Valuation_Report', headers);
  };

  const filteredReceipts = getFilteredReceipts();
  const filteredConsumptions = getFilteredConsumptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-muted-foreground">Generate and export detailed inventory reports</p>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Stock Receipt Report</SelectItem>
                  <SelectItem value="consumption">Stock Consumption Report</SelectItem>
                  <SelectItem value="valuation">Stock Valuation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={() => {
                  if (reportType === 'receipt') exportReceiptReport();
                  else if (reportType === 'consumption') exportConsumptionReport();
                  else exportValuationReport();
                }}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipt Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{filteredReceipts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total Value: ${filteredReceipts.reduce((sum, r) => sum + r.totalValue, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumption Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{filteredConsumptions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total Value: ${filteredConsumptions.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${currentStock.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{currentStock.length} active items</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Data */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            {reportType === 'receipt' && 'Stock Receipt Report'}
            {reportType === 'consumption' && 'Stock Consumption Report'}
            {reportType === 'valuation' && 'Stock Valuation Report'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {reportType === 'receipt' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Received By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{receipt.itemName}</TableCell>
                      <TableCell>{receipt.itemCode}</TableCell>
                      <TableCell>{receipt.quantityReceived} {receipt.unitOfMeasurement}</TableCell>
                      <TableCell>${receipt.ratePerUnit}</TableCell>
                      <TableCell>${receipt.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{receipt.supplierName}</TableCell>
                      <TableCell>{new Date(receipt.deliveryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{receipt.receivedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'consumption' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Activity Code</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumptions.map((consumption) => (
                    <TableRow key={consumption.id}>
                      <TableCell className="font-medium">{consumption.id}</TableCell>
                      <TableCell>{consumption.itemName}</TableCell>
                      <TableCell>{consumption.itemCode}</TableCell>
                      <TableCell>{consumption.quantityUsed} units</TableCell>
                      <TableCell>{consumption.purpose}</TableCell>
                      <TableCell>{consumption.activityCode}</TableCell>
                      <TableCell>{consumption.usedBy}</TableCell>
                      <TableCell>{new Date(consumption.date).toLocaleDateString()}</TableCell>
                      <TableCell>${consumption.totalValue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'valuation' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rate per Unit</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStock.map((item) => (
                    <TableRow key={item.itemCode}>
                      <TableCell className="font-medium">{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.unitOfMeasurement}</TableCell>
                      <TableCell>${item.lastRatePerUnit}</TableCell>
                      <TableCell className="font-medium">${item.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}