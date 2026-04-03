import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TruckList from './pages/TruckList';
import TruckDetail from './pages/TruckDetail';
import AddTruck from './pages/AddTruck';
import AddAlignment from './pages/AddAlignment';
import Reports from './pages/Reports';
import OverdueAlignments from './pages/OverdueAlignments';
import DueSoonTrucks from './pages/DueSoonTrucks';
import Billing from './pages/Billing';
import PendingBills from './pages/PendingBills';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="trucks" element={<TruckList />} />
            <Route path="trucks/new" element={<AddTruck />} />
            <Route path="trucks/:id" element={<TruckDetail />} />
            <Route path="alignments/new" element={<AddAlignment />} />
            <Route path="alignments/overdue" element={<OverdueAlignments />} />
            <Route path="alignments/due-soon" element={<DueSoonTrucks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="billing" element={<Billing />} />
            <Route path="pending-bills" element={<PendingBills />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
