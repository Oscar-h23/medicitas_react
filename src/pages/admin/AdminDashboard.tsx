// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

interface DashboardData {
  totalPacientes: number;
  totalDoctores: number;
  totalCitas: number;
  citasHoy: number;
  ingresosTotales: number;
  citasPorEstado: {
    PENDIENTE: number;
    CONFIRMADA: number;
    ATENDIDA: number;
    CANCELADA: number;
    NO_ASISTIO?: number;
  };
}

interface CitaFiltrada {
  id: number;
  pacienteNombre: string;
  pacienteDocumento?: string;
  doctorNombre: string;
  fecha: string;
  horaInicio: string;
  estado: string;
  precioConsulta: number;
  pagoEstado?: string; // PAGADO, PENDIENTE, ANULADO, NO_REGISTRADO
  pagoId?: number;
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [citasFiltradas, setCitasFiltradas] = useState<CitaFiltrada[]>([]);
  const [citasPorMes, setCitasPorMes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filtros
  const [periodo, setPeriodo] = useState('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctores, setDoctores] = useState<any[]>([]);

  // 💰 Ingresos calculados
  const [totalIngresosFiltrados, setTotalIngresosFiltrados] = useState(0);
  const [totalPendientesCobro, setTotalPendientesCobro] = useState(0);

  // ─── Cargar datos iniciales ─────────────────────────────
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // ─── Aplicar filtros cuando cambien ──────────────────────
  useEffect(() => {
    aplicarFiltros();
  }, [periodo, fechaInicio, fechaFin, doctorId]);

  // ─── Obtener datos iniciales (dashboard + doctores) ──────
  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, doctoresData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getDoctores().catch(() => []),
      ]);
      setDashboard(dashboardData);
      setDoctores(doctoresData);
    } catch (error: any) {
      console.error('❌ Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Obtener rango de fechas según el periodo ────────────
  const obtenerRangoFechas = (): { inicio: Date; fin: Date } | null => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (periodo) {
      case 'hoy': {
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { inicio: hoy, fin };
      }
      case 'semana': {
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 7);
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case 'mes': {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case 'personalizado': {
        if (!fechaInicio || !fechaFin) return null;
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (inicio > fin) return null;
        return { inicio, fin };
      }
      default:
        return null;
    }
  };

  // ─── Aplicar filtros y actualizar datos ──────────────────
  const aplicarFiltros = async () => {
    try {
      setLoadingFiltros(true);
      setError(null);

      const rango = obtenerRangoFechas();
      const params: any = {};
      if (rango) {
        params.fechaInicio = rango.inicio.toISOString().split('T')[0];
        params.fechaFin = rango.fin.toISOString().split('T')[0];
      }
      if (doctorId) params.doctorId = parseInt(doctorId);

      const citasData = await adminService.getCitasFiltrar(params);
      const citas = citasData.citas || [];
      setCitasFiltradas(citas);

      // 🔥 Calcular ingresos filtrando por pagoEstado
      const ingresos = citas
        .filter((c: CitaFiltrada) => c.pagoEstado === 'PAGADO')
        .reduce((sum: number, c: CitaFiltrada) => sum + c.precioConsulta, 0);
      setTotalIngresosFiltrados(ingresos);

      // 🔥 Calcular pendientes de cobro (atendidas pero no pagadas)
      const pendientes = citas
        .filter((c: CitaFiltrada) => c.estado === 'ATENDIDA' && c.pagoEstado !== 'PAGADO')
        .reduce((sum: number, c: CitaFiltrada) => sum + c.precioConsulta, 0);
      setTotalPendientesCobro(pendientes);

      // Obtener estadísticas por mes (para el gráfico)
      const anio = rango ? rango.inicio.getFullYear() : new Date().getFullYear();
      const statsMes = await adminService.getCitasPorMes({
        anio,
        doctorId: doctorId ? parseInt(doctorId) : undefined,
      });
      setCitasPorMes(statsMes.citasPorMes || []);
    } catch (error: any) {
      console.error('❌ Error al aplicar filtros:', error);
      setError('Error al cargar los datos filtrados.');
    } finally {
      setLoadingFiltros(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h5>❌ Error al cargar los datos</h5>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={cargarDatosIniciales}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="alert alert-warning m-4">No se pudieron cargar los datos del dashboard.</div>;
  }

  const totalCitasFiltradas = citasFiltradas.length;
  const totalGeneralCitas = totalIngresosFiltrados + totalPendientesCobro;
  const maxCitasMes = citasPorMes.reduce((max, m) => Math.max(max, m.total), 0);

  const stats = [
    { label: 'Total Pacientes', value: dashboard.totalPacientes, icon: 'bi-people', color: 'primary' },
    { label: 'Total Doctores', value: dashboard.totalDoctores, icon: 'bi-person-badge', color: 'success' },
    { label: 'Citas (filtradas)', value: totalCitasFiltradas, icon: 'bi-calendar-check', color: 'info' },
    {
      label: '💰 Ingresos Cobrados',
      value: `S/ ${totalIngresosFiltrados.toFixed(2)}`,
      icon: 'bi-coin',
      color: 'success',
    },
    {
      label: '⏳ Pendientes de Cobro',
      value: `S/ ${totalPendientesCobro.toFixed(2)}`,
      icon: 'bi-hourglass-split',
      color: 'warning',
    },
    {
      label: '📊 Total en Citas',
      value: `S/ ${totalGeneralCitas.toFixed(2)}`,
      icon: 'bi-cash-stack',
      color: 'primary',
    },
  ];

  return (
    <div className="container-fluid px-0">
      {/* ─── FILTROS ─────────────────────────────────────────────── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">🔍 Filtros de consulta</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Periodo</label>
              <select
                className="form-select"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Este mes</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            {periodo === 'personalizado' && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Fecha inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="col-md-3">
              <label className="form-label">Doctor</label>
              <select
                className="form-select"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Todos</option>
                {doctores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} - {d.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MÉTRICAS ───────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-md-4 col-lg-2" key={stat.label}>
            <div className={`card bg-${stat.color} text-white shadow-sm h-100`}>
              <div className="card-body d-flex flex-column align-items-center text-center">
                <i className={`bi ${stat.icon} display-4 mb-2`}></i>
                <h6 className="card-title text-uppercase small opacity-75">{stat.label}</h6>
                <h4 className="fw-bold">{stat.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── GRÁFICO DE BARRAS ────────────────────────────────── */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-bar-chart-fill me-2"></i>Distribución de citas por mes
          </span>
          {loadingFiltros && <span className="spinner-border spinner-border-sm ms-2" />}
        </div>
        <div className="card-body">
          {citasPorMes.length === 0 ? (
            <div className="text-center text-muted py-3">No hay datos para el periodo seleccionado.</div>
          ) : (
            <div className="d-flex align-items-end gap-2" style={{ height: '200px' }}>
              {citasPorMes.map((item) => (
                <div key={item.numeroMes} className="d-flex flex-column align-items-center flex-grow-1">
                  <div
                    className="bg-primary rounded-top"
                    style={{
                      height: `${(item.total / (maxCitasMes || 1)) * 170}px`,
                      width: '100%',
                      minHeight: '4px',
                      transition: 'height 0.3s ease',
                    }}
                  ></div>
                  <span className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                    {item.mes.substring(0, 3)}
                  </span>
                  <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>
                    {item.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── TABLA DE CITAS ────────────────────────────────────── */}
      <div className="card shadow-sm">
        <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-list-ul me-2"></i>Citas del periodo
          </span>
          <span className="badge bg-primary">{totalCitasFiltradas} citas</span>
        </div>
        <div className="card-body">
          {loadingFiltros ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="alert alert-info">No hay citas en el periodo seleccionado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped table-sm">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.slice(0, 20).map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.pacienteNombre}</td>
                      <td>{cita.doctorNombre}</td>
                      <td>{new Date(cita.fecha).toLocaleDateString('es-PE')}</td>
                      <td>{cita.horaInicio}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            cita.estado === 'PENDIENTE'
                              ? 'warning'
                              : cita.estado === 'CONFIRMADA'
                              ? 'info'
                              : cita.estado === 'ATENDIDA'
                              ? 'success'
                              : cita.estado === 'CANCELADA'
                              ? 'danger'
                              : 'secondary'
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </td>
                      <td>S/ {cita.precioConsulta.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            cita.pagoEstado === 'PAGADO'
                              ? 'success'
                              : cita.pagoEstado === 'PENDIENTE'
                              ? 'warning'
                              : cita.pagoEstado === 'ANULADO'
                              ? 'danger'
                              : 'secondary'
                          }`}
                        >
                          {cita.pagoEstado || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {citasFiltradas.length > 20 && (
                <p className="text-muted small mt-2">Mostrando 20 de {citasFiltradas.length} citas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;