import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';
import DoctorRegistration from './pages/DoctorRegistration';
import AppointmentBook from './pages/AppointmentBook';

import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <PrivateRoute>
                <DoctorSearch />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/:id"
            element={
              <PrivateRoute>
                <DoctorProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor-register"
            element={
              <PrivateRoute>
                <DoctorRegistration />
              </PrivateRoute>
            }
          />

          <Route
            path="/book-appointment/:doctorId"
            element={
              <PrivateRoute>
                <AppointmentBook />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;