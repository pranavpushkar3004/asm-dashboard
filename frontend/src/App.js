import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Domains from './pages/Domains';
import DNS from './pages/DNS';
import Certificates from './pages/Certificates';
import Services from './pages/Services';
import Vulnerabilities from './pages/Vulnerabilities';
import Changes from './pages/Changes';
import Alerts from './pages/Alerts';
import Scans from './pages/Scans';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/dns" element={<DNS />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/services" element={<Services />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/changes" element={<Changes />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
