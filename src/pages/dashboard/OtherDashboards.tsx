import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardService } from '../../services/api';

interface RecepData {
  citasHoy: number;
  citasPendientesHoy: number;
  totalPacientes: number;
  citasSemana: number;
}

export function RecepcionistaDashboard() {
  const [data, setData] = useState<RecepData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.recepcionista()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Panel de Recepción">
      {loading ? (
        <div className="dash-loading"><div className="spinner" /></div>
      ) : data ? (
        <div className="dash-grid">
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
              <span className="stat-value" style={{ color: '#d69e2e' }}>{data.citasPendientesHoy}</span>
              <span className="stat-label">Pendientes Hoy</span>
            </div>
          </div>
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#38a16918' }}>👥</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#38a169' }}>{data.totalPacientes}</span>
              <span className="stat-label">Total Pacientes</span>
            </div>
          </div>
          <div className="dash-card stat-card">
            <div className="stat-icon" style={{ background: '#805ad518' }}>📊</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#805ad5' }}>{data.citasSemana}</span>
              <span className="stat-label">Citas esta Semana</span>
            </div>
          </div>

          <div className="dash-card wide">
            <h3 className="card-title">Acciones Rápidas</h3>
            <div className="quick-actions">
              <button className="action-btn">
                <span>➕</span> Nueva Cita
              </button>
              <button className="action-btn">
                <span>🔍</span> Buscar Paciente
              </button>
              <button className="action-btn">
                <span>💳</span> Registrar Pago
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="dash-empty">No se pudo cargar la información.</p>
      )}
    </DashboardLayout>
  );
}

export function PacienteDashboard() {
  return (
    <DashboardLayout title="Mi Área de Salud">
      <div className="dash-grid">
        <div className="dash-card wide welcome-card">
          <div className="welcome-icon">🏥</div>
          <h2>Bienvenido a MediCitas</h2>
          <p>Desde aquí puedes gestionar tus citas médicas y revisar tu historial clínico.</p>
          <div className="quick-actions" style={{ marginTop: '1.5rem' }}>
            <button className="action-btn">📅 Agendar Cita</button>
            <button className="action-btn">📋 Mi Historial</button>
            <button className="action-btn">👨‍⚕️ Ver Doctores</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
