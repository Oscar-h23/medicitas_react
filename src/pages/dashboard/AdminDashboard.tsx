import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardService } from '../../services/api';

interface AdminData {
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
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.admin()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Panel Administrativo">
      {loading ? (
        <div className="dash-loading"><div className="spinner" /></div>
      ) : data ? (
        <div className="dash-grid">
          <StatCard label="Total Pacientes" value={data.totalPacientes} icon="👥" color="#3182ce" />
          <StatCard label="Total Doctores" value={data.totalDoctores} icon="🩺" color="#38a169" />
          <StatCard label="Citas Hoy" value={data.citasHoy} icon="📅" color="#d69e2e" />
          <StatCard
            label="Ingresos Totales"
            value={`S/ ${data.ingresosTotales.toFixed(2)}`}
            icon="💰"
            color="#805ad5"
          />

          <div className="dash-card wide">
            <h3 className="card-title">Citas por Estado</h3>
            <div className="status-grid">
              <StatusBadge label="Pendientes" count={data.citasPorEstado.PENDIENTE} color="#d69e2e" />
              <StatusBadge label="Confirmadas" count={data.citasPorEstado.CONFIRMADA} color="#3182ce" />
              <StatusBadge label="Atendidas" count={data.citasPorEstado.ATENDIDA} color="#38a169" />
              <StatusBadge label="Canceladas" count={data.citasPorEstado.CANCELADA} color="#e53e3e" />
            </div>
          </div>
        </div>
      ) : (
        <p className="dash-empty">No se pudo cargar la información.</p>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="dash-card stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>{icon}</div>
      <div className="stat-body">
        <span className="stat-value" style={{ color }}>{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="status-badge" style={{ borderColor: color + '44' }}>
      <span className="status-count" style={{ color }}>{count}</span>
      <span className="status-label">{label}</span>
    </div>
  );
}
