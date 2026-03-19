'use client';

import { useState, useMemo, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Receipt, Search, ChevronLeft, ChevronRight, X, Download, Edit, Zap, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { PAKISTAN_CITIES } from '@/lib/cities';
import { updateOrderAction } from '@/app/actions';
import { toast } from 'sonner';

const statusVariant = {
  Pending: 'accent',
  Confirmed: 'primary',
  'In Process': 'secondary',
  Delivered: 'emerald',
  'Delivery Address Issue': 'destructive',
  Returned: 'outline',
};

const ITEMS_PER_PAGE = 10;

const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

export default function AdminOrdersClient({ initialOrders }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Modals & Popovers State
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quick Action State (Status/Tracking)
  const [quickActionOrder, setQuickActionOrder] = useState(null);
  const [quickStatus, setQuickStatus] = useState('');
  const [quickTracking, setQuickTracking] = useState('');
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);
  
  // City Search State (for Modal)
  const [cityOpen, setCityOpen] = useState(false);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    let result = initialOrders;

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [initialOrders, statusFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const isAllPaginatedSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => o && selectedOrders.includes(o._id));

  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelected = new Set(selectedOrders);
      paginatedOrders.forEach(o => {
        if (o?._id) newSelected.add(o._id);
      });
      setSelectedOrders(Array.from(newSelected));
    } else {
      setSelectedOrders(selectedOrders.filter(id => !paginatedOrders.find(o => o?._id === id)));
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, id]);
    } else {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    }
  };

  const handleDownloadExcel = async () => {
    const ordersToExport = initialOrders.filter(o => selectedOrders.includes(o._id));
    if (ordersToExport.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    
    // 1. Create a single sheet named 'Sheet1' (Courier Portal requirement)
    const mainSheet = workbook.addWorksheet('Sheet1');

    // 2. Populate Reference Cities into a far-off hidden column (Column T / 20)
    // This allows a single-sheet file while still providing dropdown functionality.
    PAKISTAN_CITIES.forEach((city, index) => {
      mainSheet.getCell(index + 1, 20).value = city;
    });
    mainSheet.getColumn(20).hidden = true;

    // 3. Define exact headers for courier portal (No hidden spaces)
    const headers = [
      'ConsigneeName',
      'ConsigneeAddress',
      'ConsigneeEmail',
      'ConsigneeCellNo',
      'ConsigneeCity',
      'ItemType',
      'Quantity',
      'CODAmount',
      'Weight',
      'SpecialInstruction'
    ];
    
    mainSheet.getRow(1).values = headers;
    mainSheet.getRow(1).font = { bold: true };

    // 4. Populate Rows and Formatting
    ordersToExport.forEach((order, index) => {
      // CODAmount Logic: 0 if Online, manual override, or totalAmount
      let codAmount = 0;
      if (order.manualCodAmount !== undefined && order.manualCodAmount !== null && order.manualCodAmount !== '') {
        codAmount = Number(order.manualCodAmount);
      } else if (order.paymentStatus === 'Online') {
        codAmount = 0;
      } else {
        codAmount = order.totalAmount;
      }

      // Address Cleaning: Merge, remove commas/newlines. NO MANUAL QUOTES (Excel handles it).
      const cleanAddress = [order.customerAddress, order.landmark]
        .filter(Boolean)
        .join(' - ')
        .replace(/[, \n\r]+/g, ' ') 
        .trim();

      // Pre-process City: Trim, Match Case, and Fallback
      let city = (order.customerCity || '').trim();
      const exactMatch = PAKISTAN_CITIES.find(c => c.trim().toLowerCase() === city.toLowerCase());
      city = exactMatch || 'KARACHI';

      const rowIndex = index + 2; // Data starts from row 2
      const row = mainSheet.getRow(rowIndex);
      
      // Email Fallback: Ensure never empty
      const email = (order.customerEmail || 'customer@store.com').trim();
      
      row.values = [
        order.customerName,
        cleanAddress,           // NO manual quotes here
        email,
        order.customerPhone,
        city,
        'Mix',                 // Static ItemType
        '1',                   // Static Quantity
        codAmount,
        order.weight ?? 2,
        order.notes || ''
      ];

      // 5. Apply Data Validation Rule to ConsigneeCity cell (Column 5/E)
      // Reference the hidden T column on the same sheet
      row.getCell(5).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`$T$1:$T$${PAKISTAN_CITIES.length}`],
        showDropDown: true,
      };
    });

    // Finalize columns width for better readability
    mainSheet.columns.forEach((column, index) => {
      if (index < 10) column.width = 20;
    });

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daily_Courier_Sheet_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSelectedOrders([]);
  };

  const handleQuickUpdate = async (id) => {
    setIsQuickUpdating(true);
    const res = await updateOrderAction(id, { 
      status: quickStatus, 
      trackingNumber: quickTracking,
      courierName: editingOrder?.courierName || ''
    });
    
    if (res.success) {
      toast.success('Order updated quickly');
      setQuickActionOrder(null);
      router.refresh();
    } else {
      toast.error(res.error || 'Failed to update order');
    }
    setIsQuickUpdating(false);
  };

  const handleFullUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsUpdating(true);
    // Collect updates from form fields
    const form = e.target;
    const updates = {
      customerName: form.customerName.value,
      customerEmail: form.customerEmail.value,
      customerPhone: form.customerPhone.value,
      customerAddress: form.customerAddress.value,
      landmark: form.landmark.value,
      customerCity: editingOrder.customerCity,
      itemType: form.itemType.value,
      orderQuantity: form.orderQuantity.value,
      weight: form.weight.value,
      manualCodAmount: form.manualCodAmount.value,
      courierName: editingOrder.courierName || '',
    };
    const res = await updateOrderAction(editingOrder._id, updates);
    if (res.success) {
      toast.success('Order details updated successfully');
      setIsEditModalOpen(false);
      setEditingOrder(null);
      router.refresh();
    } else {
      toast.error(res.error || 'Failed to update order');
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage customer orders ({filteredOrders.length} found).</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by Order ID or Customer Name..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <Button onClick={handleDownloadExcel} className="h-10 px-3 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="size-4" />
              Download {selectedOrders.length} Selected (Excel)
            </Button>
          )}
          <Select 
            value={statusFilter} 
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In Process">In Process</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Delivery Address Issue">Address Issue</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-10 px-3 gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4 w-12">
                  <Checkbox 
                    checked={isAllPaginatedSelected} 
                    onCheckedChange={handleSelectAll} 
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Receipt className="mx-auto mb-4 size-10 text-muted-foreground/40" />
                    <p className="text-lg font-semibold text-foreground">No orders found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                    {(searchQuery || statusFilter !== 'all') && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                        Clear all filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  if (!order) return null;
                  return (
                    <tr key={order._id} className="transition-colors hover:bg-muted/35">
                    <td className="px-6 py-4">
                      <Checkbox 
                        checked={selectedOrders.includes(order._id)} 
                        onCheckedChange={(checked) => handleSelectOne(checked, order._id)} 
                        aria-label={`Select order ${order.orderId}`}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-foreground">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{formatDate(order.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.status] || 'secondary'} className="rounded-full px-3">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        {/* Quick Action Popover */}
                        <Popover 
                          open={quickActionOrder === order._id} 
                          onOpenChange={(open) => {
                            if (open) {
                              setQuickActionOrder(order._id);
                              setQuickStatus(order.status);
                              setQuickTracking(order.trackingNumber || '');
                            } else {
                              setQuickActionOrder(null);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-muted-foreground hover:bg-amber-500 hover:text-white shadow-sm transition-all">
                              <Zap className="size-5 mr-2" />
                              <span className="text-sm font-semibold">Quick Update</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-4" align="end">
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm">Quick Update</h4>
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Status</Label>
                                <Select value={quickStatus} onValueChange={setQuickStatus}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.keys(statusVariant).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tracking ID</Label>
                                <Input 
                                  className="h-8 text-xs" 
                                  value={quickTracking} 
                                  onChange={(e) => setQuickTracking(e.target.value)} 
                                  placeholder="Enter Tracking ID"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Courier Name</Label>
                                <Input 
                                  className="h-8 text-xs" 
                                  value={editingOrder?.courierName || ''} 
                                  onChange={(e) => setEditingOrder({ ...editingOrder, courierName: e.target.value })} 
                                  placeholder="e.g. Trax, Leopard, PostEx"
                                />
                              </div>
                              <Button 
                                className="w-full h-8 text-xs" 
                                disabled={isQuickUpdating} 
                                onClick={() => handleQuickUpdate(order._id)}
                              >
                                {isQuickUpdating ? <Loader2 className="size-3 animate-spin" /> : 'Update Order'}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Edit Modal Trigger */}
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-muted-foreground hover:bg-blue-600 hover:text-white shadow-sm transition-all"
                          onClick={() => {
                            setEditingOrder(order);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="size-5 mr-2" />
                          <span className="text-sm font-semibold">Edit</span>
                        </Button>

                        <Link
                          href={`/admin/orders/${order._id}`}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-muted-foreground hover:bg-primary hover:text-white hover:border-primary shadow-sm transition-all"
                          )}
                        >
                          <Eye className="size-5 mr-2" />
                          <span className="text-sm font-semibold">View</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order {editingOrder?.orderId}</DialogTitle>
          </DialogHeader>
          
          {editingOrder && (
            <form onSubmit={handleFullUpdate} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consignee Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-primary tracking-widest">Consignee Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input id="customerName" name="customerName" defaultValue={editingOrder.customerName} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input id="customerEmail" name="customerEmail" type="email" defaultValue={editingOrder.customerEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input id="customerPhone" name="customerPhone" defaultValue={editingOrder.customerPhone} required />
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-primary tracking-widest">Shipping Address</h3>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className="w-full justify-between font-normal"
                        >
                          {editingOrder.customerCity || editingOrder.city || "Select city..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search city..." />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {PAKISTAN_CITIES.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={(currentValue) => {
                                    if (editingOrder) {
                                      setEditingOrder({ ...editingOrder, customerCity: currentValue });
                                    }
                                    setCityOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (editingOrder.customerCity || editingOrder.city) === city ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Full Address</Label>
                    <Input id="customerAddress" name="customerAddress" defaultValue={editingOrder.customerAddress} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input id="landmark" name="landmark" defaultValue={editingOrder.landmark} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Courier Sheet Overrides */}
                <div className="space-y-2">
                  <Label htmlFor="itemType">Item Type</Label>
                  <Input id="itemType" name="itemType" defaultValue={editingOrder.itemType || 'Mix'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderQuantity">Quantity</Label>
                  <Input id="orderQuantity" name="orderQuantity" type="number" defaultValue={editingOrder.orderQuantity || 1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.5" defaultValue={editingOrder.weight ?? 2} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="manualCodAmount">COD Amount (Manual Override)</Label>
                  <Input id="manualCodAmount" name="manualCodAmount" type="number" placeholder="Leave blank for automatic total" defaultValue={editingOrder.manualCodAmount ?? ''} />
                  <p className="text-[10px] text-muted-foreground mt-1">If blank, COD will be {formatPrice(editingOrder.totalAmount || 0)}</p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating} className="min-w-[120px]">
                  {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            of <span className="font-medium text-foreground">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="size-9 font-medium"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
