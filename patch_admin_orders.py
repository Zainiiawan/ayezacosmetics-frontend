import re

with open('src/app/admin/orders/page.tsx', 'r') as f:
    content = f.read()

# Import EditOrderModal
if "import EditOrderModal" not in content:
    content = content.replace("import Button from '@/components/ui/Button';", "import Button from '@/components/ui/Button';\nimport EditOrderModal from './EditOrderModal';")

# Add state for EditOrderModal
if "const [isEditModalOpen, setIsEditModalOpen]" not in content:
    content = content.replace("const [message, setMessage] = useState('');", "const [message, setMessage] = useState('');\n  const [isEditModalOpen, setIsEditModalOpen] = useState(false);")

# Update the display panel
old_panel = """              <h3 className="font-serif font-bold text-lg mb-4">Order Details</h3>
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{selectedOrder.orderNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.customerType === 'guest' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedOrder.customerType === 'guest' ? 'Guest' : 'Registered'}
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <p><span className="font-medium text-gray-700">Name:</span> {selectedOrder.customerName || `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {selectedOrder.customerEmail || (typeof selectedOrder.user === 'object' && selectedOrder.user?.email) || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Phone:</span> {selectedOrder.customerPhone || selectedOrder.shippingAddress.phone || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">City:</span> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
                  <p><span className="font-medium text-gray-700">Address:</span> {selectedOrder.shippingAddress.street}</p>
                </div>
              </div>"""

new_panel = """              <div className="flex justify-between items-center mb-4">
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
              </div>"""

if old_panel in content:
    content = content.replace(old_panel, new_panel)
else:
    print("Could not find old panel")

# Add the EditOrderModal component right before the closing div of the main component
if "<EditOrderModal" not in content:
    content = content.replace("    </div>\n  );\n}", "      <EditOrderModal \n        order={selectedOrder} \n        isOpen={isEditModalOpen} \n        onClose={() => setIsEditModalOpen(false)}\n        onSuccess={() => {\n          setIsEditModalOpen(false);\n        }}\n      />\n    </div>\n  );\n}")

with open('src/app/admin/orders/page.tsx', 'w') as f:
    f.write(content)

