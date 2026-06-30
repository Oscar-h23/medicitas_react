import { useEffect, useState } from 'react';
import { doctorService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function DoctorMisCitas() {

  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {

      setLoading(true);

      const data = await doctorService.getMisCitas({
        estado: estado || undefined,
        fechaInicio: fecha || undefined,
        fechaFin: fecha || undefined
      });

      setCitas(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (
    id: number,
    nuevoEstado:
      | 'CONFIRMADA'
      | 'ATENDIDA'
      | 'CANCELADA'
      | 'NO_ASISTIO'
  ) => {

    if (!window.confirm('¿Desea actualizar el estado de la cita?'))
      return;

    try {

      await doctorService.actualizarEstadoCita(
        id,
        nuevoEstado
      );

      cargarCitas();

    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar.');
    }
  };

  const badge = (estado: string) => {

    switch (estado) {

      case 'PENDIENTE':
        return 'bg-warning';

      case 'CONFIRMADA':
        return 'bg-primary';

      case 'ATENDIDA':
        return 'bg-success';

      case 'CANCELADA':
        return 'bg-danger';

      case 'NO_ASISTIO':
        return 'bg-dark';

      default:
        return 'bg-secondary';

    }

  };

  return (

    <div className="container-fluid">

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="mb-1">
                📅 Mis Citas
              </h3>

              <small className="text-muted">
                Gestiona todas tus citas médicas
              </small>

            </div>

            <button
              className="btn btn-primary"
              onClick={cargarCitas}
            >
              Actualizar
            </button>

          </div>

        </div>

      </div>

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row">

            <div className="col-md-4">

              <label className="form-label">
                Estado
              </label>

              <select
                className="form-select"
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value)
                }
              >

                <option value="">
                  Todos
                </option>

                <option value="PENDIENTE">
                  Pendiente
                </option>

                <option value="CONFIRMADA">
                  Confirmada
                </option>

                <option value="ATENDIDA">
                  Atendida
                </option>

                <option value="CANCELADA">
                  Cancelada
                </option>

                <option value="NO_ASISTIO">
                  No asistió
                </option>

              </select>

            </div>

            <div className="col-md-4">

              <label className="form-label">
                Fecha
              </label>

              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
              />

            </div>

            <div className="col-md-4 d-flex align-items-end">

              <button
                className="btn btn-success w-100"
                onClick={cargarCitas}
              >
                Buscar
              </button>

            </div>

          </div>

        </div>

      </div>

      <div className="card shadow-sm">

        <div className="card-body">

          {loading ? (

            <div className="text-center py-5">

              <div className="spinner-border text-primary"/>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th style={{ width: 350 }}>
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {citas.map(cita => (

                    <tr key={cita.id}>

                      <td>

                        <strong>
                          {cita.pacienteNombre}
                        </strong>

                      </td>

                      <td>
                        {cita.fecha}
                      </td>

                      <td>

                        {cita.horaInicio}

                        {' - '}

                        {cita.horaFin}

                      </td>

                      <td>

                        {cita.motivoConsulta || '-'}

                      </td>

                      <td>

                        S/ {cita.precioConsulta}

                      </td>

                      <td>

                        <span
                          className={`badge ${badge(cita.estado)}`}
                        >
                          {cita.estado}
                        </span>

                      </td>

                      <td>

                        {cita.estado === 'PENDIENTE' && (

                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() =>
                              cambiarEstado(
                                cita.id,
                                'CONFIRMADA'
                              )
                            }
                          >
                            Confirmar
                          </button>

                        )}

                        {cita.estado === 'CONFIRMADA' && (

                          <>
                            <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() =>
                                        navigate(`/doctor/consultas/${cita.id}`)
                                    }
                                    >
                                    Atender
                                    </button>

                            <button
                              className="btn btn-dark btn-sm me-2"
                              onClick={() =>
                                cambiarEstado(
                                  cita.id,
                                  'NO_ASISTIO'
                                )
                              }
                            >
                              No asistió
                            </button>

                          </>

                        )}

                        {cita.estado !== 'CANCELADA' &&
                          cita.estado !== 'ATENDIDA' && (

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                cambiarEstado(
                                  cita.id,
                                  'CANCELADA'
                                )
                              }
                            >
                              Cancelar
                            </button>

                        )}

                      </td>

                    </tr>

                  ))}

                  {citas.length === 0 && (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >
                        No existen citas.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default DoctorMisCitas;