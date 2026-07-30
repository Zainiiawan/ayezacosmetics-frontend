'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Check, X, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { shippingApi, ShippingRate } from '@/lib/api/shippingApi';

export default function AdminShippingPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ city: '', cost: 200, isActive: true });

  const { data: rates, isLoading } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: shippingApi.getAllRates,
  });

  const createMutation = useMutation({
    mutationFn: shippingApi.createRate,
    onSuccess: () => {
      alert('Shipping rate added');
      setIsAdding(false);
      setFormData({ city: '', cost: 200, isActive: true });
      void queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
    },
    onError: () => alert('Failed to add shipping rate'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ShippingRate> }) => shippingApi.updateRate(id, data as any),
    onSuccess: () => {
      alert('Shipping rate updated');
      setEditingId(null);
      setFormData({ city: '', cost: 200, isActive: true });
      void queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
    },
    onError: () => alert('Failed to update shipping rate'),
  });

  const deleteMutation = useMutation({
    mutationFn: shippingApi.deleteRate,
    onSuccess: () => {
      alert('Shipping rate deleted');
      void queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
    },
    onError: () => alert('Failed to delete shipping rate'),
  });

  const handleSave = () => {
    if (!formData.city.trim()) return alert('City name is required');
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rate: ShippingRate) => {
    setEditingId(rate._id);
    setFormData({ city: rate.city, cost: rate.cost, isActive: rate.isActive });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ city: '', cost: 200, isActive: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="text-gray-500 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-black">Custom Shipping Rates</h1>
              <p className="text-gray-600">Manage city-specific shipping costs</p>
            </div>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ city: '', cost: 200, isActive: true }); }} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 mr-2" /> Add Rate
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-700">City</th>
                  <th className="p-4 font-semibold text-gray-700">Cost (Rs.)</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="border-b border-gray-50 bg-blue-50/30">
                    <td className="p-4">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Karachi"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-black focus:border-black"
                        autoFocus
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:ring-black focus:border-black"
                        min="0"
                      />
                    </td>
                    <td className="p-4">
                      <select
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:ring-black focus:border-black"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" onClick={handleSave} disabled={createMutation.isPending}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </td>
                  </tr>
                )}
                
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Loading rates...</td>
                  </tr>
                ) : rates?.length === 0 && !isAdding ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No custom shipping rates found.</p>
                      <p className="text-sm">The default shipping cost will be applied to all cities.</p>
                    </td>
                  </tr>
                ) : (
                  rates?.map((rate) => (
                    <tr key={rate._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      {editingId === rate._id ? (
                        <>
                          <td className="p-4">
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={formData.cost}
                              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                              className="w-32 px-3 py-1.5 border border-gray-300 rounded"
                              min="0"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              value={formData.isActive ? 'true' : 'false'}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                              className="px-3 py-1.5 border border-gray-300 rounded"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 font-medium text-black">{rate.city}</td>
                          <td className="p-4">Rs. {rate.cost}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rate.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(rate)}
                              className="text-gray-400 hover:text-rose-gold p-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the rate for ${rate.city}?`)) {
                                  deleteMutation.mutate(rate._id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
