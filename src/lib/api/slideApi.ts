import { api } from './axios';

export interface SlideImage {
  url: string;
  publicId?: string;
}

export interface Slide {
  _id: string;
  image: SlideImage;
  mobileImage?: SlideImage;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

export type SlideInput = Omit<Slide, '_id' | 'order' | 'mobileImage'> & { order?: number; mobileImage?: SlideImage | null };

export const slideApi = {
  // homepage slides; an older backend without slides just means none
  getActive: async (): Promise<Slide[]> => {
    try {
      const response = await api.get('/slides');
      return response.data.data ?? [];
    } catch {
      return [];
    }
  },

  getAll: async (): Promise<Slide[]> => {
    const response = await api.get('/slides/all');
    return response.data.data;
  },

  create: async (data: SlideInput): Promise<Slide> => {
    const response = await api.post('/slides', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<SlideInput>): Promise<Slide> => {
    const response = await api.put(`/slides/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/slides/${id}`);
  },

  reorder: async (ids: string[]): Promise<Slide[]> => {
    const response = await api.put('/slides/reorder', { ids });
    return response.data.data;
  },
};
