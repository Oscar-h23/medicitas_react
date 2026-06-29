// src/pages/paciente/MiPerfil.tsx
import { useEffect, useState } from 'react';
import { pacienteService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ======================================================
   TIPOS
   ====================================================== */

interface PerfilBackend {
  id: number;
  email: string;
  rol: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
}

// Campos que el backend NO persiste aún → se guardan en localStorage
interface PerfilExtra {
  dni: string;
  sexo: string;
  direccion: string;
  distrito: string;
  grupoSanguineo: string;
  alergias: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
}

type PerfilData = PerfilBackend & PerfilExtra;

const DEFAULT_EXTRA: PerfilExtra = {
  dni: '', sexo: '', direccion: '', distrito: '',
  grupoSanguineo: '', alergias: '', contactoEmergencia: '', telefonoEmergencia: '',
};

/* ======================================================
   HELPERS localStorage (solo para campos extendidos)
   ====================================================== */

const cacheKey = (id: number) => `perfil_extra_${id}`;

const leerExtra = (id: number): PerfilExtra => {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    return raw ? { ...DEFAULT_EXTRA, ...JSON.parse(raw) } : { ...DEFAULT_EXTRA };
  } catch { return { ...DEFAULT_EXTRA }; }
};

const guardarExtra = (id: number, data: PerfilExtra) => {
  localStorage.setItem(cacheKey(id), JSON.stringify(data));
};

/* ======================================================
   COMPONENTE
   ====================================================== */

function MiPerfil() {
  const { usuario } = useAuth();

  const [perfil,    setPerfil]    = useState<PerfilData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [editando,  setEditando]  = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData,  setFormData]  = useState<PerfilData | null>(null);

  useEffect(() => { cargarPerfil(); }, [usuario]);

  /* ────────────────────────────────────────────────────
     1. CARGAR: backend (fuente de verdad) + localStorage
     ──────────────────────────────────────────────────── */
  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      // Siempre pide al backend — nunca leas userData de localStorage como fuente principal
      const backend: PerfilBackend = await pacienteService.getPerfil();
      const extra   = leerExtra(backend.id);

      const completo: PerfilData = { ...backend, ...extra };
      setPerfil(completo);
      setFormData(completo);
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError('No se pudo cargar el perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────
     2. GUARDAR
     - Campos backend: se enviarían con PUT /auth/perfil
       (el backend aún no tiene ese endpoint, pero la
        lógica ya está lista para activarlo)
     - Campos extra: se guardan en localStorage
     ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!perfil || !formData) return;

  setGuardando(true);

  try {
    const extra: PerfilExtra = {
      dni: formData.dni,
      sexo: formData.sexo,
      direccion: formData.direccion,
      distrito: formData.distrito,
      grupoSanguineo: formData.grupoSanguineo,
      alergias: formData.alergias,
      contactoEmergencia: formData.contactoEmergencia,
      telefonoEmergencia: formData.telefonoEmergencia,
    };

    guardarExtra(formData.id, extra);

    const respuesta = await pacienteService.actualizarPerfil({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      telefono: formData.telefono,
      fechaNacimiento: formData.fechaNacimiento,
    });

    const perfilActualizado: PerfilData = {
      ...respuesta.usuario,
      ...extra,
    };

    setPerfil(perfilActualizado);
    setFormData(perfilActualizado);

    setEditando(false);

    alert('✅ Perfil actualizado correctamente.');
  } catch (err) {
    console.error(err);
    alert('❌ Error al guardar.');
  } finally {
    setGuardando(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setFormData(perfil);
  };

  /* ────────────────────────────────────────────────────
     3. EXPORTAR PDF
     ──────────────────────────────────────────────────── */
  const descargarDatos = async () => {
    if (!perfil) return;
    try {
      const [citas, historial] = await Promise.all([
        pacienteService.getMisCitas().catch(() => []),
        pacienteService.getMiHistorial().catch(() => ({ consultas: [] })),
      ]);

      const doc = new jsPDF();
      doc.setFontSize(20); doc.text('MEDICITAS', 14, 20);
      doc.setFontSize(14); doc.text('Resumen del Paciente', 14, 30);
      doc.setFontSize(12); doc.text('Información Personal', 14, 45);

      autoTable(doc, {
        startY: 50,
        body: [
          ['Nombres',              perfil.nombres              || '-'],
          ['Apellidos',            perfil.apellidos             || '-'],
          ['Email',                perfil.email                 || '-'],
          ['Teléfono',             perfil.telefono              || '-'],
          ['Fecha de nacimiento',  perfil.fechaNacimiento       || '-'],
          ['DNI',                  perfil.dni                   || '-'],
          ['Sexo',                 perfil.sexo                  || '-'],
          ['Dirección',            perfil.direccion             || '-'],
          ['Distrito',             perfil.distrito              || '-'],
          ['Grupo sanguíneo',      perfil.grupoSanguineo        || '-'],
          ['Alergias',             perfil.alergias              || '-'],
          ['Contacto emergencia',  perfil.contactoEmergencia    || '-'],
          ['Teléfono emergencia',  perfil.telefonoEmergencia    || '-'],
        ],
        theme: 'grid',
      });

      const citasY = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Historial de Citas', 14, citasY);
      autoTable(doc, {
        startY: citasY + 5,
        head:  [['Fecha', 'Hora', 'Doctor', 'Estado']],
        body:  (citas || []).map((c: any) => [c.fecha || '-', c.horaInicio || '-', c.doctorNombre || '-', c.estado || '-']),
        theme: 'striped',
      });

      const histY = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Historial Médico', 14, histY);
      autoTable(doc, {
        startY: histY + 5,
        head:  [['Fecha', 'Doctor', 'Diagnóstico']],
        body:  ((historial as any).consultas || []).map((c: any) => [c.fecha || '-', c.doctor || '-', c.diagnostico || '-']),
        theme: 'striped',
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, finalY);
      doc.save(`MediCitas_${perfil.nombres || 'paciente'}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('❌ Error al generar el PDF.');
    }
  };

  /* ────────────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────────────── */

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">Cargando perfil...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger d-flex align-items-center gap-2">
      <span>⚠️ {error}</span>
      <button className="btn btn-sm btn-outline-danger ms-auto" onClick={cargarPerfil}>
        Reintentar
      </button>
    </div>
  );

  if (!perfil || !formData) return null;

  const camposVista = [
    { label: 'Nombres',              value: perfil.nombres },
    { label: 'Apellidos',            value: perfil.apellidos },
    { label: 'Email',                value: perfil.email },
    { label: 'Rol',                  value: perfil.rol },
    { label: 'Teléfono',             value: perfil.telefono              || 'No registrado' },
    { label: 'Fecha de nacimiento',  value: perfil.fechaNacimiento       || 'No registrada' },
    { label: 'DNI',                  value: perfil.dni                   || 'No registrado' },
    { label: 'Sexo',                 value: perfil.sexo === 'M' ? 'Masculino' : perfil.sexo === 'F' ? 'Femenino' : 'No registrado' },
    { label: 'Dirección',            value: perfil.direccion             || 'No registrada' },
    { label: 'Distrito',             value: perfil.distrito              || 'No registrado' },
    { label: 'Grupo sanguíneo',      value: perfil.grupoSanguineo        || 'No registrado' },
    { label: 'Alergias',             value: perfil.alergias              || 'Ninguna' },
    { label: 'Contacto emergencia',  value: perfil.contactoEmergencia    || 'No registrado' },
    { label: 'Teléfono emergencia',  value: perfil.telefonoEmergencia    || 'No registrado' },
  ];

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">

        {/* ── Tarjeta principal ─────────────────────── */}
        <div className="card shadow border-0 mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">👤 Mi perfil</h5>
            {!editando && (
              <button className="btn btn-light btn-sm" onClick={() => setEditando(true)}>
                ✏️ Editar
              </button>
            )}
          </div>

          <div className="card-body">

            {editando ? (
              /* ── Formulario de edición ─────────────── */
              <form onSubmit={handleSubmit}>
                <div className="row g-3">

                  {/* Sección: datos del backend */}
                  <div className="col-12">
                    <span className="badge bg-primary-subtle text-primary-emphasis">
                      📡 Datos del servidor
                    </span>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nombres *</label>
                    <input type="text" className="form-control" name="nombres"
                      value={formData.nombres} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellidos *</label>
                    <input type="text" className="form-control" name="apellidos"
                      value={formData.apellidos} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} disabled />
                    <div className="form-text text-muted">El email no se puede modificar.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-control" name="telefono"
                      value={formData.telefono} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha de nacimiento</label>
                    <input type="date" className="form-control" name="fechaNacimiento"
                      value={formData.fechaNacimiento} onChange={handleChange} />
                  </div>

                  {/* Sección: datos extra (localStorage) */}
                  <div className="col-12 mt-2">
                    <hr className="mb-2" />
                    <span className="badge bg-secondary-subtle text-secondary-emphasis">
                      💾 Información adicional (guardada localmente)
                    </span>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">DNI</label>
                    <input type="text" className="form-control" name="dni"
                      value={formData.dni} onChange={handleChange} maxLength={8} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sexo</label>
                    <select className="form-select" name="sexo"
                      value={formData.sexo} onChange={handleChange}>
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Dirección</label>
                    <input type="text" className="form-control" name="direccion"
                      value={formData.direccion} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Distrito</label>
                    <input type="text" className="form-control" name="distrito"
                      value={formData.distrito} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grupo sanguíneo</label>
                    <select className="form-select" name="grupoSanguineo"
                      value={formData.grupoSanguineo} onChange={handleChange}>
                      <option value="">Seleccionar</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Alergias</label>
                    <input type="text" className="form-control" name="alergias"
                      value={formData.alergias} onChange={handleChange}
                      placeholder="Ej: Penicilina, Polen..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contacto de emergencia</label>
                    <input type="text" className="form-control" name="contactoEmergencia"
                      value={formData.contactoEmergencia} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono de emergencia</label>
                    <input type="tel" className="form-control" name="telefonoEmergencia"
                      value={formData.telefonoEmergencia} onChange={handleChange} />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={guardando}>
                    {guardando
                      ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                      : '💾 Guardar cambios'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                </div>
              </form>

            ) : (
              /* ── Vista de solo lectura ─────────────── */
              <div className="row g-3">
                {camposVista.map(({ label, value }) => (
                  <div className="col-md-6" key={label}>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Exportar PDF ──────────────────────────── */}
        <div className="card shadow-sm border-0">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 className="mb-0">
                <i className="bi bi-file-earmark-pdf me-2 text-danger" />
                Exportar mis datos
              </h6>
              <p className="text-muted small mb-0">
                Descarga tu información médica en formato PDF.
              </p>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={descargarDatos}>
              Descargar datos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MiPerfil;