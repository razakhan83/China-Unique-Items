'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShoppingBag, 
  Truck,
  MessageSquare,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import InvoiceButton from '@/components/InvoiceButtonWrapper';
import CopyButton from '@/components/CopyButton';
import ReviewModal from '@/components/ReviewModal';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Process': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Delivery Address Issue': 'bg-red-100 text-red-700 border-red-200',
  Returned: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function OrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    setMounted(true);
  }, []);

  // Updated Grouping Logic
  const activeOrders = orders.filter(order => 
    ['Pending', 'Confirmed', 'In Process', 'Delivery Address Issue'].includes(order.status)
  );
  
  const historyOrders = orders.filter(order => 
    ['Delivered', 'Returned'].includes(order.status)
  );

  // Auto-popup and Cleanup logic
  useEffect(() => {
    if (!mounted) return;

    // 1. Cleanup: Remove tracking for fully reviewed orders
    orders.forEach(order => {
      const allReviewed = order.items.every(item => item.isReviewed);
      if (allReviewed) {
        localStorage.removeItem(`review_popup_count_${order.orderId}`);
      }
    });

    // 2. Auto-popup: Find a delivered order that needs a review prompt
    const deliveredUnreviewedOrders = orders.filter(order => 
      order.status === 'Delivered' && 
      order.items.some(item => !item.isReviewed)
    );

    for (const order of deliveredUnreviewedOrders) {
      const storageKey = `review_popup_count_${order.orderId}`;
      const count = parseInt(localStorage.getItem(storageKey) || '0', 10);

      if (count < 2) {
        // Trigger popup for the first qualifying order
        const timer = setTimeout(() => {
          setSelectedOrder(order);
          setIsReviewModalOpen(true);
          localStorage.setItem(storageKey, (count + 1).toString());
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, orders]);

  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setIsReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    window.location.reload();
  };

  const renderOrderCard = (order) => {
    const hasUnreviewedItems = order.status === 'Delivered' && order.items.some(item => !item.isReviewed);
    
    return (
      <div key={order._id} className="surface-card overflow-hidden rounded-xl border border-border shadow-sm transition-all hover:shadow-md">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-muted/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm font-semibold text-foreground">{order.orderId}</span>
                <CopyButton 
                  text={order.orderId} 
                  className="size-6 p-1 hover:bg-primary/10 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="size-3" />
                {mounted ? new Date(order.createdAt).toLocaleDateString() : '---'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                {mounted ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InvoiceButton order={order} />
            {hasUnreviewedItems && (
              <Button 
                size="sm" 
                className="h-8 text-xs gap-2 bg-primary hover:bg-primary/90"
                onClick={() => handleReviewClick(order)}
              >
                <MessageSquare className="size-3" />
                Review Now
              </Button>
            )}
            <Badge 
              variant="outline" 
              className={cn("px-3 py-1 rounded-full border shadow-sm", STATUS_COLORS[order.status] || 'bg-muted')}
            >
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  )}
                  {item.isReviewed && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[8px] h-4 px-1">Reviewed</Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">Rs. {(item.price * item.quantity).toLocaleString('en-PK')}</span>
              </div>
            ))}
          </div>

          {/* Tracking Info */}
          {(order.courierName || order.trackingNumber) && (
            <>
              <Separator className="my-6" />
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-primary">Tracking Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.courierName && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Courier</p>
                      <p className="text-sm font-semibold text-foreground">{order.courierName}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Tracking ID</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-mono font-semibold text-foreground">{order.trackingNumber}</span>
                        <CopyButton 
                          text={order.trackingNumber} 
                          className="size-6 p-1 hover:bg-primary/10 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold text-primary">Rs. {order.totalAmount.toLocaleString('en-PK')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {/* Tabs Switcher */}
        <div className="flex p-1 bg-muted rounded-xl w-full sm:w-fit overflow-hidden">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'active' 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Active Orders
            {activeOrders.length > 0 && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 text-[10px] rounded-full",
                activeTab === 'active' ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'history' 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Order History
            {historyOrders.length > 0 && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 text-[10px] rounded-full",
                activeTab === 'history' ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {historyOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {activeTab === 'active' ? (
            activeOrders.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeOrders.map(renderOrderCard)}
              </div>
            ) : (
              <div className="text-center py-12 surface-card rounded-xl border border-dashed border-border">
                <Package className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground">No active orders</h3>
                <p className="text-sm text-muted-foreground">You don't have any ongoing shipments at the moment.</p>
              </div>
            )
          ) : (
            historyOrders.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {historyOrders.map(renderOrderCard)}
              </div>
            ) : (
              <div className="text-center py-12 surface-card rounded-xl border border-dashed border-border">
                <Clock className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground">No order history</h3>
                <p className="text-sm text-muted-foreground">Your completed orders will appear here.</p>
              </div>
            )
          )}
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onOpenChange={setIsReviewModalOpen}
        order={selectedOrder}
        onComplete={handleReviewComplete}
      />
    </>
  );
}
