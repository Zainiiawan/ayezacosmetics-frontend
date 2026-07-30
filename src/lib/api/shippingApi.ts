import { api } from './axios';

export interface ShippingRate {
  _id: string;
  city: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const shippingApi = {
  getAllRates: async (): Promise<ShippingRate[]> => {
    const { data } = await api.get('/shipping');
    return data.data;
  },

  createRate: async (rateData: { city: string; cost: number; isActive?: boolean }): Promise<ShippingRate> => {
    const { data } = await api.post('/shipping', rateData);
    return data.data;
  },

  updateRate: async (id: string, rateData: { city: string; cost: number; isActive?: boolean }): Promise<ShippingRate> => {
    const { data } = await api.put(`/shipping/${id}`, rateData);
    return data.data;
  },

  deleteRate: async (id: string): Promise<void> => {
    await api.delete(`/shipping/${id}`);
  },
};
