// src/services/api.ts

import axios from 'axios';

/* =========================================================
   CONFIGURACIÓN BASE DE AXIOS
   ========================================================= */

/**
 * Instancia de Axios con configuración base:
 * - URL base: http://localhost:3000/api
 * - Content-Type: application/json
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

/* =========================================================
   INTERCEPTORES
   ========================================================= */

/**
 * Interceptor de solicitudes: inyecta automáticamente el header 'x-user-id'
 * con el ID del usuario almacenado en localStorage.
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
 * Interceptor de respuestas: maneja errores globales.
 * - Si recibe 401 (No autenticado), limpia localStorage y redirige al login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   SERVICIO DE AUTENTICACIÓN (authService)
   ========================================================= */

export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   * @returns Datos del usuario autenticado.
   */
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Obtiene el perfil del usuario autenticado (desde el backend).
   * @returns Datos completos del perfil (incluye campos extendidos).
   */
  getPerfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   * @param perfilData - Objeto con los campos a actualizar.
   * @returns Respuesta del servidor.
   */
  actualizarPerfil: async (perfilData: {
    nombres: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: string;
    numeroDocumento?: string;
    sexo?: string;
    direccion?: string;
    distrito?: string;
    grupoSanguineo?: string;
    alergias?: string;
    contactoEmergencia?: string;
    telefonoEmergencia?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    const { data } = await api.put('/auth/perfil', perfilData);
    return data;
  },

  /**
   * Cierra sesión (notifica al backend y limpia localStorage en el interceptor).
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Registra un nuevo usuario (paciente).
   * @param userData - Datos del nuevo usuario (email, password, nombres, apellidos, etc.).
   * @returns Respuesta del servidor.
   */
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
};

/* =========================================================
   SERVICIO DE DASHBOARD (dashboardService)
   ========================================================= */

export const dashboardService = {
  /** Datos del dashboard para el rol ADMIN */
  admin: async () => {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },

  /** Datos del dashboard para el rol DOCTOR */
  doctor: async () => {
    const { data } = await api.get('/dashboard/doctor');
    return data;
  },

  /** Datos del dashboard para el rol RECEPCIONISTA */
  recepcionista: async () => {
    const { data } = await api.get('/dashboard/recepcionista');
    return data;
  },

  /** Datos del dashboard para el rol PACIENTE */
  paciente: async () => {
    const { data } = await api.get('/dashboard/paciente');
    return data;
  },
};

/* =========================================================
   SERVICIO DE DOCTORES (doctorService)
   ========================================================= */

export const doctorService = {
  // ─── Dashboard ──────────────────────────────────────────────────────
  getDashboard: async () => {
    const { data } = await api.get('/dashboard/doctor');
    return data;
  },

  getEstadisticas: async () => {
    const { data } = await api.get('/doctor/estadisticas');
    return data;
  },

  getProximoPaciente: async () => {
    const { data } = await api.get('/doctor/proximo-paciente');
    return data;
  },

  // ─── Historiales ────────────────────────────────────────────────────
  getHistoriales: async (params?: {
    pacienteId?: number;
    doctorId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    const { data } = await api.get('/historiales', { params });
    return data;
  },

  // ─── Doctores ──────────────────────────────────────────────────────
  /** Lista todos los doctores (público). */
  getAll: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  /** Obtiene un doctor por ID. */
  getById: async (id: number) => {
    const { data } = await api.get(`/doctores/${id}`);
    return data;
  },

  /** Obtiene el perfil del doctor autenticado (datos básicos). */
  getPerfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  /** Obtiene el perfil completo del doctor (incluye usuario, persona y doctor). */
  getPerfilCompleto: async () => {
    const { data } = await api.get('/doctor/perfil');
    return data;
  },

  /** Actualiza el perfil del doctor autenticado. */
  actualizarPerfil: async (perfilData: {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    especialidadId: number;
    precioConsulta: number;
    foto?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    const { data } = await api.put('/doctor/perfil', perfilData);
    return data;
  },

  // ─── Consultas médicas ──────────────────────────────────────────────
  registrarConsulta: async (consulta: {
    citaId: number;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    sintomas: string;
    signosVitales: any;
  }) => {
    const { data } = await api.post('/consultas', consulta);
    return data;
  },

  /** Obtiene detalle de una cita específica (para atender). */
  getDetalleCita: async (id: number) => {
    const { data } = await api.get(`/citas/${id}`);
    return data;
  },

  /** Atiende a un paciente: registra la consulta y actualiza estado de cita. */
  atenderPaciente: async (
    citaId: number,
    consulta: {
      diagnostico: string;
      tratamiento: string;
      observaciones: string;
      sintomas?: string;
      signosVitales?: any;
    }
  ) => {
    const { data } = await api.post('/consultas', {
      citaId,
      ...consulta,
    });
    return data;
  },

  // ─── Pacientes del doctor ──────────────────────────────────────────
  /** Lista los pacientes que ha atendido el doctor autenticado. */
  getPacientes: async () => {
    const { data } = await api.get('/doctor/pacientes');
    return data;
  },

  // ─── Citas ─────────────────────────────────────────────────────────
  /** Obtiene las citas del doctor autenticado (con filtros opcionales). */
  getMisCitas: async (params?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    const { data } = await api.get('/citas', { params });
    return data;
  },

  /** Actualiza el estado de una cita (solo estados permitidos para doctor). */
  actualizarEstadoCita: async (
    citaId: number,
    estado: 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO'
  ) => {
    const { data } = await api.patch(`/citas/${citaId}/estado`, { estado });
    return data;
  },

  /** Obtiene las citas del día de hoy para el doctor autenticado. */
  getCitasHoy: async () => {
    const { data } = await api.get('/citas/hoy');
    return data;
  },

  /** Obtiene la agenda del doctor (citas futuras o filtradas por fecha). */
  getAgenda: async (fecha?: string) => {
    const { data } = await api.get('/doctor/agenda', {
      params: fecha ? { fecha } : {},
    });
    return data;
  },

  /** Cambia el estado de una cita (genérico, con validación en backend). */
  cambiarEstadoCita: async (
    citaId: number,
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO'
  ) => {
    const { data } = await api.patch(`/citas/${citaId}/estado`, { estado });
    return data;
  },

  // ─── Horarios ──────────────────────────────────────────────────────
  /** Crea un bloque de horario para un doctor (ADMIN o propio DOCTOR). */
  crearHorario: async (horario: {
    doctorId: number;
    sedeId: number;
    consultorioId: number;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    intervaloMinutos?: number;
  }) => {
    const { data } = await api.post('/horarios-doctor', horario);
    return data;
  },

  // ─── Historial de paciente ────────────────────────────────────────
  /** Obtiene el historial médico de un paciente específico (solo si el doctor lo ha atendido). */
  getHistorialPaciente: async (pacienteId: number) => {
    const { data } = await api.get(`/pacientes/${pacienteId}/historial`);
    return data;
  },

  // ─── Sesión ────────────────────────────────────────────────────────
  /** Cierra sesión del doctor. */
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};

/* =========================================================
   SERVICIO DE ESPECIALIDADES (especialidadService)
   ========================================================= */

export const especialidadService = {
  /** Obtiene todas las especialidades médicas. */
  getAll: async () => {
    const { data } = await api.get('/especialidades');
    return data;
  },
};

/* =========================================================
   SERVICIO DE SEDES (sedeService)
   ========================================================= */

export const sedeService = {
  /** Obtiene todas las sedes activas. */
  getAll: async () => {
    const { data } = await api.get('/sedes');
    return data;
  },
};

/* =========================================================
   SERVICIO DE PACIENTE (pacienteService)
   ========================================================= */

export const pacienteService = {
  // ─── Autenticación ──────────────────────────────────────────────────
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

  /** Obtiene el perfil del paciente autenticado (desde backend). */
  getPerfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  /** Actualiza el perfil del paciente autenticado. */
  actualizarPerfil: async (perfilData: {
    nombres: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: string;
    numeroDocumento?: string;
    sexo?: string;
    direccion?: string;
    distrito?: string;
    grupoSanguineo?: string;
    alergias?: string;
    contactoEmergencia?: string;
    telefonoEmergencia?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    const { data } = await api.put('/auth/perfil', perfilData);
    return data;
  },

  // ─── Doctores ──────────────────────────────────────────────────────
  getDoctores: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  getDoctorById: async (id: number) => {
    const { data } = await api.get(`/doctores/${id}`);
    return data;
  },

  // ─── Especialidades ──────────────────────────────────────────────
  getEspecialidades: async () => {
    const { data } = await api.get('/especialidades');
    return data;
  },

  // ─── Sedes ────────────────────────────────────────────────────────
  getSedes: async () => {
    const { data } = await api.get('/sedes');
    return data;
  },

  // ─── Horarios ────────────────────────────────────────────────────
  getHorariosDisponibles: async (doctorId: number, fecha: string, sedeId?: number) => {
    const { data } = await api.get('/horarios-disponibles', {
      params: { doctorId, fecha, sedeId },
    });
    return data;
  },

  // ─── Citas ────────────────────────────────────────────────────────
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

  // ─── Historial médico ────────────────────────────────────────────
  getMiHistorial: async () => {
    const { data } = await api.get('/paciente/historial');
    return data;
  },

  // ─── Búsqueda de pacientes ──────────────────────────────────────
  getPacienteByDocumento: async (documento: string) => {
    const { data } = await api.get('/pacientes/buscar', { params: { documento } });
    return data;
  },

  // ─── Dashboard ────────────────────────────────────────────────────
  getDashboardData: async () => {
    const { data } = await api.get('/dashboard/paciente');
    return data;
  },

  // ─── Pagos ────────────────────────────────────────────────────────
  registrarPago: async (pagoData: {
    citaId: number;
    metodoPago: string;
    numeroOperacion?: string;
  }) => {
    const { data } = await api.post('/pagos', pagoData);
    return data;
  },

  // ─── Consultas médicas ──────────────────────────────────────────
  getConsultaByCita: async (citaId: number) => {
    const { data } = await api.get(`/consultas/cita/${citaId}`);
    return data;
  },
};

/* =========================================================
   SERVICIO DE RECEPCIONISTA (recepcionistaService)
   ========================================================= */

export const recepcionistaService = {
  // ─── Dashboard ──────────────────────────────────────────────────────
  getDashboard: async () => {
    const { data } = await api.get('/dashboard/recepcionista');
    return data;
  },

  // ─── Citas ──────────────────────────────────────────────────────────
  getCitasHoy: async () => {
    const { data } = await api.get('/citas/hoy');
    return data;
  },

  getCitas: async (params?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    pacienteId?: number;
    doctorId?: number;
  }) => {
    const { data } = await api.get('/citas', { params });
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

  cambiarEstadoCita: async (citaId: number, estado: string) => {
    const { data } = await api.patch(`/citas/${citaId}/estado`, { estado });
    return data;
  },

  getDetalleCita: async (citaId: number) => {
    const { data } = await api.get(`/citas/${citaId}`);
    return data;
  },

  // ─── Pacientes ──────────────────────────────────────────────────────
  getPacientes: async () => {
    const { data } = await api.get('/pacientes');
    return data;
  },

  buscarPacientePorDocumento: async (documento: string) => {
    const { data } = await api.get('/pacientes/buscar', { params: { documento } });
    return data;
  },

  crearPaciente: async (pacienteData: {
    nombres: string;
    apellidos: string;
    email: string;
    password?: string;
    numeroDocumento: string;
    telefono?: string;
    fechaNacimiento?: string;
    seguroId?: number;
  }) => {
    const { data } = await api.post('/pacientes', pacienteData);
    return data;
  },

  // ─── Pagos ──────────────────────────────────────────────────────────
  registrarPago: async (pagoData: {
    citaId: number;
    metodoPago: string;
    numeroOperacion?: string;
  }) => {
    const { data } = await api.post('/pagos', pagoData);
    return data;
  },

  /** Anula un pago (solo si está PAGADO). */
  anularPago: async (pagoId: number) => {
    const { data } = await api.patch(`/pagos/${pagoId}/anular`);
    return data;
  },

  getPagos: async () => {
    // Obtiene citas atendidas para mostrar en la sección de pagos.
    const { data } = await api.get('/citas', { params: { estado: 'ATENDIDA' } });
    return data;
  },

  // ─── Doctores ──────────────────────────────────────────────────────
  getDoctores: async () => {
    const { data } = await api.get('/doctores');
    return data;
  },

  // ─── Especialidades ──────────────────────────────────────────────
  getEspecialidades: async () => {
    const { data } = await api.get('/especialidades');
    return data;
  },

  // ─── Horarios ──────────────────────────────────────────────────────
  getHorariosDisponibles: async (doctorId: number, fecha: string) => {
    const { data } = await api.get('/horarios-disponibles', {
      params: { doctorId, fecha },
    });
    return data.horariosDisponibles; // Devuelve array de strings "HH:MM"
  },

  // ─── Perfil ──────────────────────────────────────────────────────
  getPerfil: async () => {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  getPerfilCompleto: async () => {
    // Para recepcionista, se puede usar /auth/perfil o crear un endpoint específico.
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  listarPacientes: async () => {
    const { data } = await api.get('/pacientes');
    return data;
  },

  actualizarPerfil: async (perfilData: {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
  }) => {
    const { data } = await api.put('/auth/perfil', perfilData);
    return data;
  },
};

/* =========================================================
   EXPORT DEFAULT (opcional, para casos de uso general)
   ========================================================= */

export default api;