import { api } from './axios';

export interface Settings {
  _id: string;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  getSettings: async (): Promise<Settings> => {
    const { data } = await api.get('/settings');
    return data.data;
  },

  updateSettings: async (settingsData: { defaultShippingCost: number; freeShippingThreshold: number }): Promise<Settings> => {
    const { data } = await api.put('/settings', settingsData);
    return data.data;
  },
};
