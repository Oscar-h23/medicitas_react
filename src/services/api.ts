import axios from 'axios';

/**
 * =========================================================
 * CONFIGURACIÓN BASE DE AXIOS
 * =========================================================
 */

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * =========================================================
 * INTERCEPTOR: INYECTA x-user-id AUTOMÁTICAMENTE
 * =========================================================
 */

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers = config.headers ?? {};
    config.headers['x-user-id'] = userId;
  }
  return config;
});

/**
 * =========================================================
 * INTERCEPTOR: MANEJO GLOBAL DE ERRORES
 * =========================================================
 */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión inválida → limpiar y redirigir al login
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * =========================================================
 * AUTH SERVICE
 * =========================================================
 */

export const authService = {
  /** Iniciar sesión */
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /** Obtener perfil del usuario autenticado (SIEMPRE desde el backend) */
  getPerfil: async () => {
  const { data } = await api.get('/auth/perfil');
  return data;
},

actualizarPerfil: async (perfilData: {
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
}) => {
  const { data } = await api.put('/auth/perfil', perfilData);
  return data;
},

  /** Cerrar sesión */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /** Registrar nuevo usuario */
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
};

/**
 * =========================================================
 * DASHBOARD SERVICE
 * =========================================================
 */

export const dashboardService = {
  admin:         async () => { const { data } = await api.get('/dashboard/admin');         return data; },
  doctor:        async () => { const { data } = await api.get('/dashboard/doctor');        return data; },
  recepcionista: async () => { const { data } = await api.get('/dashboard/recepcionista'); return data; },
  paciente:      async () => { const { data } = await api.get('/dashboard/paciente');      return data; },
};

/**
 * =========================================================
 * DOCTORES SERVICE
 * =========================================================
 */

export const doctorService = {
  getAll:   async ()           => { const { data } = await api.get('/doctores');       return data; },
  getById:  async (id: number) => { const { data } = await api.get(`/doctores/${id}`); return data; },
};

/**
 * =========================================================
 * ESPECIALIDADES SERVICE
 * =========================================================
 */

export const especialidadService = {
  getAll: async () => { const { data } = await api.get('/especialidades'); return data; },
};

/**
 * =========================================================
 * SEDES SERVICE
 * =========================================================
 */

export const sedeService = {
  getAll: async () => { const { data } = await api.get('/sedes'); return data; },
};

/**
 * =========================================================
 * PACIENTE SERVICE
 * =========================================================
 */

export const pacienteService = {

  /* ── Autenticación ──────────────────────────────────── */

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  /**
   * Obtener perfil desde el backend.
   * NUNCA usa localStorage como fuente de datos;
   * localStorage solo se usa en MiPerfil para campos extendidos.
   */
  getPerfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },
  actualizarPerfil: async (perfilData: {
    nombres: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: string;
  }) => {
    const { data } = await api.put('/auth/perfil', perfilData);
    return data;
  },

  /* ── Doctores ───────────────────────────────────────── */

  getDoctores:    async ()           => { const { data } = await api.get('/doctores');       return data; },
  getDoctorById:  async (id: number) => { const { data } = await api.get(`/doctores/${id}`); return data; },

  /* ── Especialidades ─────────────────────────────────── */

  getEspecialidades: async () => { const { data } = await api.get('/especialidades'); return data; },

  /* ── Sedes ──────────────────────────────────────────── */

  getSedes: async () => { const { data } = await api.get('/sedes'); return data; },

  /* ── Horarios ───────────────────────────────────────── */

  getHorariosDisponibles: async (doctorId: number, fecha: string, sedeId?: number) => {
    const { data } = await api.get('/horarios-disponibles', {
      params: { doctorId, fecha, sedeId },
    });
    return data;
  },

  /* ── Citas ──────────────────────────────────────────── */

  getMisCitas: async () => {
    const { data } = await api.get('/citas');
    return data;
  },

  crearCita: async (citaData: {
    pacienteId: number;
    doctorId: number;
    fecha: string;
    horaInicio: string;
    motivoConsulta: string;
  }) => {
    const { data } = await api.post('/citas', citaData);
    return data;
  },

  cancelarCita: async (citaId: number) => {
    const { data } = await api.delete(`/citas/${citaId}`);
    return data;
  },

  actualizarEstadoCita: async (citaId: number, estado: string) => {
    const { data } = await api.patch(`/citas/${citaId}/estado`, { estado });
    return data;
  },

  getCitasHoy: async () => {
    const { data } = await api.get('/citas/hoy');
    return data;
  },

  /* ── Historial médico ───────────────────────────────── */

  getMiHistorial: async () => {
    const { data } = await api.get('/paciente/historial');
    return data;
  },

  /* ── Búsqueda de pacientes ──────────────────────────── */

  getPacienteByDocumento: async (documento: string) => {
    const { data } = await api.get('/pacientes/buscar', { params: { documento } });
    return data;
  },

  /* ── Dashboard ──────────────────────────────────────── */

  getDashboardData: async () => {
    const { data } = await api.get('/dashboard/paciente');
    return data;
  },

  /* ── Pagos ──────────────────────────────────────────── */

  registrarPago: async (pagoData: {
    citaId: number;
    metodoPago: string;
    numeroOperacion?: string;
  }) => {
    const { data } = await api.post('/pagos', pagoData);
    return data;
  },

  /* ── Consultas médicas ──────────────────────────────── */

  getConsultaByCita: async (citaId: number) => {
    const { data } = await api.get(`/consultas/cita/${citaId}`);
    return data;
  },
};

/**
 * =========================================================
 * EXPORT DEFAULT
 * =========================================================
 */

export default api;