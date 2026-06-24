import api from './api';

export const consultaService = {
  getConsultaByCita: async (
    citaId: number
  ) => {
    const { data } = await api.get(
      `/consultas/cita/${citaId}`
    );

    return data;
  },
};