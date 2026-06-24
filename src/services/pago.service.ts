import api from './api';

export const pagoService = {
  registrarPago: async (pago: {
    citaId: number;
    metodoPago: string;
    numeroOperacion?: string;
  }) => {
    const { data } = await api.post(
      '/pagos',
      pago
    );

    return data;
  },
};