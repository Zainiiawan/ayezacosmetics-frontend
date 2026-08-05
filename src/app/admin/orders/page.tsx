'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { orderApi, Order } from '@/lib/api/orderApi';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import EditOrderModal from './EditOrderModal';

const STATUS_OPTIONS = [
  'pending',
  'pending_confirmation',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  pending_confirmation: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [message, setMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderApi.getAllAdmin({ limit: 50 }),
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => orderApi.updateStatus(data.orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setCourierName('');
      setTrackingUrl('');
      setEstimatedDelivery('');
      setMessage('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    },
  });

  const orders = data?.orders ?? [];

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && orders.length > 0 && !selectedOrder) {
      const order = orders.find((o: Order) => o._id === id);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams, orders, selectedOrder]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-black">Orders</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Auto-refreshes every 10s · Last updated {new Date(dataUpdatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Order</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const customer = typeof order.user === 'object' ? order.user : null;
                      return (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.customerName || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                          </td>
                          <td className="px-4 py-3 font-medium text-rose-gold">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100'}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.createdAt ? formatDate(order.createdAt) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                                setTrackingNumber(order.trackingNumber ?? '');
                                setCourierName(order.courierName ?? '');
                                setTrackingUrl(order.trackingUrl ?? '');
                                setEstimatedDelivery(order.estimatedDelivery?.slice(0, 10) ?? '');
                              }}
                              className="text-sm text-rose-gold hover:underline"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg">Order Details</h3>
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit Order</Button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{selectedOrder.orderNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.customerType === 'guest' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedOrder.customerType === 'guest' ? 'Guest' : 'Registered'}
                  </span>
                </div>
                <div className="space-y-1 text-gray-600 mb-4 pb-4 border-b">
                  <p><span className="font-medium text-gray-700">Name:</span> {selectedOrder.customerName || `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {selectedOrder.customerEmail || (typeof selectedOrder.user === 'object' && selectedOrder.user?.email) || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Phone:</span> {selectedOrder.customerPhone || selectedOrder.shippingAddress.phone || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">City:</span> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
                  <p><span className="font-medium text-gray-700">Address:</span> {selectedOrder.shippingAddress.street}</p>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2 mb-4">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-600">
                      <span>{item.quantity}x {item.name} {item.variant ? `(${item.variant})` : ''}</span>
                      <span>{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-4 border-t text-right">
                  <p className="text-gray-600"><span className="mr-4">Subtotal:</span> {formatPrice(selectedOrder.subtotal)}</p>
                  {selectedOrder.productDiscount && selectedOrder.productDiscount > 0 && (
                    <p className="text-green-600"><span className="mr-4">Product Discount:</span> -{formatPrice(selectedOrder.productDiscount)}</p>
                  )}
                  {selectedOrder.discount > 0 && (
                    <p className="text-green-600"><span className="mr-4">Coupon Discount:</span> -{formatPrice(selectedOrder.discount)}</p>
                  )}
                  {selectedOrder.manualDiscount && selectedOrder.manualDiscount > 0 && (
                    <p className="text-orange-600"><span className="mr-4">Manual Discount:</span> -{formatPrice(selectedOrder.manualDiscount)}</p>
                  )}
                  <p className="text-gray-600"><span className="mr-4">Shipping:</span> +{formatPrice(selectedOrder.shippingCost)}</p>
                  {selectedOrder.tax > 0 && (
                    <p className="text-gray-600"><span className="mr-4">Tax:</span> +{formatPrice(selectedOrder.tax)}</p>
                  )}
                  <p className="text-lg font-bold text-gray-900 pt-2"><span className="mr-4 text-base font-medium">Total:</span> {formatPrice(selectedOrder.total)}</p>
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking Number</label>
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="Courier tracking ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Courier Name</label>
                  <input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="e.g. TCS, Leopards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking URL (optional)</label>
                  <input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Delivery</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:outline-none"
                    placeholder="Status update message"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    loading={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        orderId: selectedOrder._id,
                        status: newStatus,
                        trackingNumber: trackingNumber || undefined,
                        courierName: courierName || undefined,
                        trackingUrl: trackingUrl || undefined,
                        estimatedDelivery: estimatedDelivery || undefined,
                        message: message || undefined,
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    loading={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to completely delete this order? This action cannot be undone and will restore stock if not already cancelled.')) {
                        deleteMutation.mutate(selectedOrder._id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Order
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <EditOrderModal 
        order={selectedOrder} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
