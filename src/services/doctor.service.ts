import api from './api';

export const doctorService = {
  getDoctores: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  getDoctorById: async (id: number) => {
    const { data } = await api.get(
      `/doctores/${id}`
    );
    return data;
  },

  getEspecialidades: async () => {
    const { data } = await api.get(
      '/especialidades'
    );
    return data;
  },

  getHorariosDisponibles: async (
    doctorId: number,
    fecha: string,
    sedeId?: number
  ) => {
    const { data } = await api.get(
      '/horarios-disponibles',
      {
        params: {
          doctorId,
          fecha,
          sedeId,
        },
      }
    );

    return data;
  },
};