// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';

import AdminDashboard from './pages/dashboard/AdminDashboard';

import { RecepcionistaDashboard } from './pages/dashboard/OtherDashboards';

import PacienteLayout from './components/PacienteLayout';
import PacienteDashboard from './pages/paciente/PacienteDashboard';
import Doctores from './pages/paciente/Doctores';
import DoctorPerfilPaciente from './pages/paciente/Doctores';
import MiHistorial from './pages/paciente/MiHistorial';
import MiPerfil from './pages/paciente/MiPerfil';
import AgendarCita from './pages/paciente/AgendarCita';
import MisCitas from './pages/paciente/MisCitas';

import DoctorLayout from './components/DoctorLayout';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorCitas from './pages/doctor/DoctorCitas';
import DoctorConsultas from './pages/doctor/DoctorConsultas';
import DoctorHistoriales from './pages/doctor/DoctorHistoriales';
import DoctorPerfil from './pages/doctor/DoctorPerfil';

import type { Rol } from './types';

/* =========================================================
   REDIRECCIÓN SEGÚN ROL
========================================================= */

const ROLE_REDIRECT: Record<Rol, string> = {
  ADMIN: '/dashboard/admin',
  DOCTOR: '/dashboard/doctor',
  RECEPCIONISTA: '/dashboard/recepcionista',
  PACIENTE: '/dashboard/paciente',
};

function DashboardRedirect() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_REDIRECT[usuario.rol]} replace />;
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* LOGIN */}
          <Route path="/login" element={<LoginPage />} />

          {/* REDIRECCIÓN AUTOMÁTICA */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* DOCTOR */}
          <Route
  path="/dashboard/doctor"
  element={
    <ProtectedRoute roles={['DOCTOR']}>
      <DoctorLayout />
    </ProtectedRoute>
  }
      >
        <Route index element={<DoctorDashboard />} />

        <Route path="citas" element={<DoctorCitas />} />

        <Route path="consultas" element={<DoctorConsultas />} />

        <Route path="historiales" element={<DoctorHistoriales />} />

        <Route path="mi-perfil" element={<DoctorPerfil />} />
      </Route>

          {/* RECEPCIONISTA */}
          <Route
            path="/dashboard/recepcionista"
            element={
              <ProtectedRoute roles={['RECEPCIONISTA']}>
                <RecepcionistaDashboard />
              </ProtectedRoute>
            }
          />

          {/* PACIENTE — layout con sidebar */}
          <Route
            path="/dashboard/paciente"
            element={
              <ProtectedRoute roles={['PACIENTE']}>
                <PacienteLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PacienteDashboard />} />
            <Route path="doctores" element={<Doctores />} />
            {/* ← RUTA NUEVA */}
            <Route path="doctor-perfil/:doctorId" element={<DoctorPerfilPaciente />} />
            <Route path="mi-historial" element={<MiHistorial />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="mis-citas" element={<MisCitas />} />
            <Route path="agendar-cita/:doctorId" element={<AgendarCita />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}