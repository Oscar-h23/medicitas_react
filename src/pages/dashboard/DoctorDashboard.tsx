import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardService } from '../../services/api';

interface Cita {
  id: number;
  fecha: string;
  horaInicio: string;
  estado: string;
  motivoConsulta: string;
}

interface DoctorData {
  totalCitas: number;
  citasHoy: number;
  citasPendientes: number;
  pacientesAtendidos: number;
  proximasCitas: Cita[];
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: '#d69e2e',
  CONFIRMADA: '#3182ce',
  ATENDIDA: '#38a169',
  CANCELADA: '#e53e3e',
};

export default function DoctorDashboard() {
  const [data, setData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.doctor()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Mi Panel Médico">
      {loading ? (
        <div className="dash-loading"><div className="spinner" /></div>
      ) : data ? (
        <div className="dash-grid">
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#38a16918' }}>📋</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#38a169' }}>{data.totalCitas}</span>
              <span className="stat-label">Total Citas</span>
            </div>
          </div>
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#3182ce18' }}>📅</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#3182ce' }}>{data.citasHoy}</span>
              <span className="stat-label">Citas Hoy</span>
            </div>
          </div>
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#d69e2e18' }}>⏳</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#d69e2e' }}>{data.citasPendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#805ad518' }}>✅</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#805ad5' }}>{data.pacientesAtendidos}</span>
              <span className="stat-label">Pacientes Atendidos</span>
            </div>
          </div>

          <div className="dash-card wide">
            <h3 className="card-title">Próximas Citas</h3>
            {data.proximasCitas.length === 0 ? (
              <p className="dash-empty-small">No hay citas próximas programadas.</p>
            ) : (
              <div className="citas-list">
                {data.proximasCitas.map((cita) => (
                  <div key={cita.id} className="cita-row">
                    <div className="cita-info">
                      <span className="cita-fecha">{cita.fecha}</span>
                      <span className="cita-hora">{cita.horaInicio}</span>
                    </div>
                    <span className="cita-motivo">{cita.motivoConsulta || 'Sin motivo especificado'}</span>
                    <span
                      className="cita-estado"
                      style={{ color: ESTADO_COLOR[cita.estado] || '#666', background: (ESTADO_COLOR[cita.estado] || '#666') + '18' }}
                    >
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="dash-empty">No se pudo cargar la información.</p>
      )}
    </DashboardLayout>
  );
}
