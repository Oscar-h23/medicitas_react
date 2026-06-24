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
 * AUTH SERVICE
 * =========================================================
 */

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  perfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Registrar nuevo usuario (NUEVO)
   */
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  /**
   * Actualizar perfil del usuario (NUEVO)
   */
  actualizarPerfil: async (userData: any) => {
    const { data } = await api.put('/auth/perfil', userData);
    return data;
  },
};

/**
 * =========================================================
 * DASHBOARD SERVICE
 * =========================================================
 */

export const dashboardService = {
  /**
   * Dashboard para administradores
   */
  admin: async () => {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },

  /**
   * Dashboard para doctores
   */
  doctor: async () => {
    const { data } = await api.get('/dashboard/doctor');
    return data;
  },

  /**
   * Dashboard para recepcionistas
   */
  recepcionista: async () => {
    const { data } = await api.get('/dashboard/recepcionista');
    return data;
  },

  /**
   * Dashboard para pacientes
   */
  paciente: async () => {
    const { data } = await api.get('/dashboard/paciente');
    return data;
  },
};

/**
 * =========================================================
 * DOCTORES SERVICE (NUEVO)
 * =========================================================
 */

export const doctorService = {
  /**
   * Obtener todos los doctores
   */
  getAll: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  /**
   * Obtener doctor por ID
   */
  getById: async (id: number) => {
    const { data } = await api.get(`/doctores/${id}`);
    return data;
  },
};

/**
 * =========================================================
 * ESPECIALIDADES SERVICE (NUEVO)
 * =========================================================
 */

export const especialidadService = {
  /**
   * Obtener todas las especialidades
   */
  getAll: async () => {
    const { data } = await api.get('/especialidades');
    return data;
  },
};

/**
 * =========================================================
 * SEDES SERVICE (NUEVO)
 * =========================================================
 */

export const sedeService = {
  /**
   * Obtener todas las sedes
   */
  getAll: async () => {
    const { data } = await api.get('/sedes');
    return data;
  },
};

/**
 * =========================================================
 * PACIENTE SERVICE
 * =========================================================
 */

export const pacienteService = {
  /**
   * ===== AUTENTICACIÓN =====
   */

  /**
   * Iniciar sesión como paciente (NUEVO)
   */
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Registrar nuevo paciente (NUEVO)
   */
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  /**
   * Cerrar sesión (NUEVO)
   */
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  /**
   * Obtener perfil del paciente (NUEVO)
   */
  getPerfil: async () => {
  const localData = localStorage.getItem('perfilPaciente');

  if (localData) {
    return JSON.parse(localData);
  }

  const { data } = await api.get('/auth/perfil');

  localStorage.setItem(
    'perfilPaciente',
    JSON.stringify(data)
  );

  return data;
},

  /**
   * Actualizar perfil del paciente (NUEVO)
   */
 actualizarPerfil: async (userData: any) => {
  localStorage.setItem(
    'perfilPaciente',
    JSON.stringify(userData)
  );

  return userData;
},

  /**
   * ===== DOCTORES =====
   */

  /**
   * Obtener doctores con especialidades (EXISTENTE)
   */
  getDoctores: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  /**
   * Obtener doctor por ID (NUEVO)
   */
  getDoctorById: async (id: number) => {
    const { data } = await api.get(`/doctores/${id}`);
    return data;
  },

  /**
   * ===== ESPECIALIDADES =====
   */

  /**
   * Obtener todas las especialidades (NUEVO)
   */
  getEspecialidades: async () => {
    const { data } = await api.get('/especialidades');
    return data;
  },

  /**
   * ===== SEDES =====
   */

  /**
   * Obtener todas las sedes (NUEVO)
   */
  getSedes: async () => {
    const { data } = await api.get('/sedes');
    return data;
  },

  /**
   * ===== HORARIOS =====
   */

  /**
   * Obtener horarios disponibles de un doctor (EXISTENTE)
   */
  getHorariosDisponibles: async (doctorId: number, fecha: string, sedeId?: number) => {
    const { data } = await api.get('/horarios-disponibles', {
      params: { doctorId, fecha, sedeId },
    });
    return data;
  },

  /**
   * ===== CITAS =====
   */

  /**
   * Obtener citas del paciente (EXISTENTE)
   */
  getMisCitas: async () => {
    const { data } = await api.get('/citas');
    return data;
  },

  /**
   * Crear nueva cita (EXISTENTE)
   */
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

  /**
   * Cancelar cita (EXISTENTE)
   */
  cancelarCita: async (citaId: number) => {
    const { data } = await api.delete(`/citas/${citaId}`);
    return data;
  },

  /**
   * Actualizar estado de una cita (NUEVO)
   */
  actualizarEstadoCita: async (citaId: number, estado: string) => {
    const { data } = await api.patch(`/citas/${citaId}/estado`, { estado });
    return data;
  },

  /**
   * Obtener citas del día actual (NUEVO)
   */
  getCitasHoy: async () => {
    const { data } = await api.get('/citas/hoy');
    return data;
  },

  /**
   * ===== HISTORIAL MÉDICO =====
   */

  /**
   * Obtener historial médico del paciente (EXISTENTE)
   */
  getMiHistorial: async () => {
  // Primero intentar desde localStorage
  try {
    const stored = JSON.parse(localStorage.getItem('pacienteData') || '{}');
    if (stored.id) {
      const { data } = await api.get(`/pacientes/${stored.id}/historial`);
      return data;
    }
  } catch { /* continúa */ }

  // Si no hay pacienteData, obtener el id desde las citas
  const citas = await api.get('/citas').then(r => r.data);
  if (Array.isArray(citas) && citas.length > 0) {
    const pacienteId = citas[0].pacienteId;
    // Guardar para próximas veces
    const userId = localStorage.getItem('userId');
    localStorage.setItem('pacienteData', JSON.stringify({ id: pacienteId, userId }));
    const { data } = await api.get(`/pacientes/${pacienteId}/historial`);
    return data;
  }

  // Si no tiene citas, retornar historial vacío en lugar de lanzar error
  return { consultas: [], paciente: null };
},

  /**
   * ===== PACIENTES =====
   */

  /**
   * Buscar paciente por documento (NUEVO)
   */
  getPacienteByDocumento: async (documento: string) => {
    const { data } = await api.get('/pacientes/buscar', {
      params: { documento },
    });
    return data;
  },

  /**
   * ===== DASHBOARD =====
   */

  /**
   * Obtener datos del dashboard del paciente (EXISTENTE)
   */
  getDashboardData: async () => {
    const { data } = await api.get('/dashboard/paciente');
    return data;
  },

  /**
   * ===== PAGOS =====
   */

  /**
   * Registrar un pago (NUEVO)
   */
  registrarPago: async (pagoData: {
    citaId: number;
    metodoPago: string;
    numeroOperacion?: string;
  }) => {
    const { data } = await api.post('/pagos', pagoData);
    return data;
  },

  /**
   * ===== CONSULTAS MÉDICAS =====
   */

  /**
   * Obtener consulta médica por ID de cita (NUEVO)
   */
  getConsultaByCita: async (citaId: number) => {
    const { data } = await api.get(`/consultas/cita/${citaId}`);
    return data;
  },
};

/**
 * =========================================================
 * EXPORT DEFAULT (INSTANCIA AXIOS)
 * =========================================================
 */

export default api;