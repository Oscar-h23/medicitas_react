import api from './api';

export const citaService = {
  getMisCitas: async () => {
    const { data } = await api.get('/citas');
    return data;
  },

  crearCita: async (cita: {
    pacienteId: number;
    doctorId: number;
    fecha: string;
    horaInicio: string;
    motivoConsulta: string;
  }) => {
    const { data } = await api.post(
      '/citas',
      cita
    );

    return data;
  },

  cancelarCita: async (citaId: number) => {
    const { data } = await api.delete(
      `/citas/${citaId}`
    );

    return data;
  },

  actualizarEstadoCita: async (
    citaId: number,
    estado: string
  ) => {
    const { data } = await api.patch(
      `/citas/${citaId}/estado`,
      { estado }
    );

    return data;
  },

  getCitasHoy: async () => {
    const { data } = await api.get(
      '/citas/hoy'
    );

    return data;
  },
};