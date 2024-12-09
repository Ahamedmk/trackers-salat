// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrayersPage from './pages/PrayersPage';
import InvocationsPage from './pages/InvocationsPage';
import StatisticsPage from './pages/StatisticsPage';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/prayers"
            element={
              <PrivateRoute>
                <PrayersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/invocations"
            element={
              <PrivateRoute>
                <InvocationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <PrivateRoute>
                <StatisticsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
