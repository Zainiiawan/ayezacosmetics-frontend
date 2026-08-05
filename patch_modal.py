import re

with open('src/app/admin/orders/EditOrderModal.tsx', 'r') as f:
    content = f.read()

# Replace import
content = content.replace("import { Dialog } from '@headlessui/react';", "import { m as motion, AnimatePresence } from 'framer-motion';")

# Replace Dialog component
old_dialog_start = """    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <Dialog.Title className="text-xl font-serif font-bold">Edit Order #{order.orderNumber}</Dialog.Title>"""

new_dialog_start = """    <AnimatePresence>
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
              <h2 className="text-xl font-serif font-bold">Edit Order #{order.orderNumber}</h2>"""

content = content.replace(old_dialog_start, new_dialog_start)

# Replace Dialog end
old_dialog_end = """        </Dialog.Panel>
      </div>
    </Dialog>"""

new_dialog_end = """          </motion.div>
        </div>
      )}
    </AnimatePresence>"""

content = content.replace(old_dialog_end, new_dialog_end)

with open('src/app/admin/orders/EditOrderModal.tsx', 'w') as f:
    f.write(content)
