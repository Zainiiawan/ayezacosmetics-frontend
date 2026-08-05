import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { m as motion, AnimatePresence } from 'framer-motion';
import { orderApi, Order } from '@/lib/api/orderApi';
import { productApi } from '@/lib/api/productApi';
import Button from '@/components/ui/Button';
import { Plus, Trash2, X } from 'lucide-react';

export default function EditOrderModal({ 
  order, 
  isOpen, 
  onClose,
  onSuccess 
}: { 
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  
  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });
  const products = productsData?.products || [];

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
        customerEmail: order.customerEmail || (typeof order.user === 'object' ? order.user?.email : ''),
        customerPhone: order.customerPhone || order.shippingAddress?.phone || '',
        shippingAddress: { ...order.shippingAddress },
        shippingCost: order.shippingCost || 0,
        manualDiscount: order.manualDiscount || 0,
        manualDiscountReason: order.manualDiscountReason || '',
        items: order.items.map(i => ({ product: i.product, variant: i.variant, quantity: i.quantity, _id: i.product + (i.variant || '') })),
      });
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => orderApi.adminEditOrder(order!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      onSuccess();
    },
  });

  if (!isOpen || !order) return null;

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'product') {
       newItems[index].variant = ''; // reset variant when product changes
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', variant: '', quantity: 1, _id: Date.now().toString() }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to apply these changes? This will permanently update the order and inventory.')) {
      updateMutation.mutate(formData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden z-10"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold">Edit Order #{order.orderNumber}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-8 text-sm">
            
            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-rose-gold border-b pb-2">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.customerName || ''} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.customerEmail || ''} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Phone</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.customerPhone || ''} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-rose-gold border-b pb-2">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Street</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.shippingAddress?.street || ''} onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, street: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">City</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.shippingAddress?.city || ''} onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, city: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Country</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={formData.shippingAddress?.country || ''} onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, country: e.target.value}})} />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-semibold text-lg text-rose-gold">Order Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}><Plus className="w-4 h-4 mr-1"/> Add Item</Button>
              </div>
              
              <div className="space-y-4">
                {formData.items?.map((item: any, index: number) => {
                  const selectedProduct = products.find((p: any) => p._id === item.product);
                  return (
                    <div key={item._id || index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-1">Product</label>
                        <select className="w-full border rounded-lg px-3 py-2" value={item.product} onChange={(e) => handleItemChange(index, 'product', e.target.value)} required>
                          <option value="">Select Product...</option>
                          {products.map((p: any) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="w-48">
                          <label className="block text-gray-700 mb-1">Variant</label>
                          <select className="w-full border rounded-lg px-3 py-2" value={item.variant} onChange={(e) => handleItemChange(index, 'variant', e.target.value)}>
                            <option value="">Select Variant...</option>
                            {selectedProduct.variants.map((v: any) => (
                              <option key={v.sku} value={v.sku}>{v.name} ({v.sku})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="w-24">
                        <label className="block text-gray-700 mb-1">Quantity</label>
                        <input type="number" min="1" className="w-full border rounded-lg px-3 py-2" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} required />
                      </div>

                      <div className="pt-7">
                         <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  );
                })}
                {formData.items?.length === 0 && <p className="text-gray-500 italic">No items. Order will be empty.</p>}
              </div>
            </div>

            {/* Pricing Adjustments */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-rose-gold border-b pb-2">Pricing Adjustments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Shipping Cost (Rs.)</label>
                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={formData.shippingCost} onChange={(e) => setFormData({...formData, shippingCost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Manual Discount (Rs.)</label>
                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={formData.manualDiscount} onChange={(e) => setFormData({...formData, manualDiscount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Reason for Manual Discount</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Customer requested price match" value={formData.manualDiscountReason || ''} onChange={(e) => setFormData({...formData, manualDiscountReason: e.target.value})} />
                </div>
              </div>
            </div>

            {updateMutation.isError && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                 Error: {(updateMutation.error as any).response?.data?.error || 'Failed to update order'}
               </div>
            )}
            
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" loading={updateMutation.isPending} className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            </div>
          </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
