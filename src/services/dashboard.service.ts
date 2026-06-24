import api from './api';

export const dashboardService = {
  admin: async () => {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },

  doctor: async () => {
    const { data } = await api.get('/dashboard/doctor');
    return data;
  },

  recepcionista: async () => {
    const { data } = await api.get(
      '/dashboard/recepcionista'
    );
    return data;
  },

  paciente: async () => {
    const { data } = await api.get(
      '/dashboard/paciente'
    );
    return data;
  },
};