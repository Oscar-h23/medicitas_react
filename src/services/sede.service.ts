import api from './api';

export const sedeService = {
  getSedes: async () => {
    const { data } = await api.get('/sedes');
    return data;
  },
};