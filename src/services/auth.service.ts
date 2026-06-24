import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });
    return data;
  },

  register: async (usuario: any) => {
    const { data } = await api.post(
      '/auth/register',
      usuario
    );
    return data;
  },

  perfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  actualizarPerfil: async (perfil: any) => {
    const { data } = await api.put(
      '/auth/perfil',
      perfil
    );
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};