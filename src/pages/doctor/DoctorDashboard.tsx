import { useEffect, useState } from 'react';
import { doctorService } from '../../services/api';

function DoctorDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const data = await doctorService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* Bienvenida */}

      <div className="card bg-primary text-white border-0 shadow-sm mb-4">
        <div className="card-body">
          <h3 className="fw-bold mb-2">
            👨‍⚕️ Panel del Doctor
          </h3>

          <p className="mb-0">
            Consulta rápidamente el estado de tus citas y pacientes.
          </p>
        </div>
      </div>

      {/* Indicadores */}

      <div className="row g-3 mb-4">

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h1 className="text-primary">
                {dashboard.totalCitas}
              </h1>
              <p className="mb-0">Total de citas</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h1 className="text-success">
                {dashboard.citasHoy}
              </h1>
              <p className="mb-0">Citas de hoy</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h1 className="text-warning">
                {dashboard.citasPendientes}
              </h1>
              <p className="mb-0">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h1 className="text-info">
                {dashboard.pacientesAtendidos}
              </h1>
              <p className="mb-0">Pacientes atendidos</p>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-3 mb-4">

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h2 className="text-danger">
                {dashboard.canceladas}
              </h2>

              <p className="mb-0">
                Citas canceladas
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h2 className="text-secondary">
                {dashboard.noAsistieron}
              </h2>

              <p className="mb-0">
                No asistieron
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h2 className="text-success">
                S/. {dashboard.ingresos.toFixed(2)}
              </h2>

              <p className="mb-0">
                Ingresos generados
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Próximas citas */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">
          <h5 className="mb-0">
            📅 Próximas citas
          </h5>
        </div>

        <div className="card-body p-0">

          {dashboard.proximasCitas.length === 0 ? (

            <div className="text-center py-5">
              No tienes próximas citas.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>

                </thead>

                <tbody>

                  {dashboard.proximasCitas.map((cita: any) => (

                    <tr key={cita.id}>

                      <td>
                        {cita.pacienteNombre}
                      </td>

                      <td>
                        {cita.fecha}
                      </td>

                      <td>
                        {cita.horaInicio}
                      </td>

                      <td>
                        {cita.motivoConsulta || '-'}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            cita.estado === 'PENDIENTE'
                              ? 'bg-warning text-dark'
                              : cita.estado === 'CONFIRMADA'
                              ? 'bg-primary'
                              : cita.estado === 'ATENDIDA'
                              ? 'bg-success'
                              : cita.estado === 'CANCELADA'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {cita.estado}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default DoctorDashboard;