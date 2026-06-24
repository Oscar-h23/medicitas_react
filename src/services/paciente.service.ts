import api from './api';

export const pacienteService = {
  getMiHistorial: async () => {
    const paciente = JSON.parse(
      localStorage.getItem('pacienteData') || '{}'
    );

    if (!paciente.id) {
      throw new Error(
        'No se encontró el ID del paciente'
      );
    }

    const { data } = await api.get(
      `/pacientes/${paciente.id}/historial`
    );

    return data;
  },

  getPacienteByDocumento: async (
    documento: string
  ) => {
    const { data } = await api.get(
      '/pacientes/buscar',
      {
        params: { documento },
      }
    );

    return data;
  },

  getDashboardData: async () => {
    const { data } = await api.get(
      '/dashboard/paciente'
    );

    return data;
  },
};