import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomListPage from './pages/RoomListPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import NotFoundPage from './pages/NotFoundPage';


import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddRoomPage from './pages/owner/AddRoomPage';
import ManageRoomsPage from './pages/owner/ManageRoomsPage';
import EditRoomPage from './pages/owner/EditRoomPage';
import BookingManagementPage from './pages/owner/BookingManagementPage';
import OwnerProfilePage from './pages/owner/ProfilePage';


import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingPage from './pages/customer/BookingPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import CustomerProfilePage from './pages/customer/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Navbar />
        <Routes>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/:id" element={<RoomDetailsPage />} />

        
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner/add-room" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <AddRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/manage-rooms" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <ManageRoomsPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/edit-room/:id" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <EditRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/bookings" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <BookingManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/profile" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <OwnerProfilePage />
            </ProtectedRoute>
          } />

          
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/book/:id" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/bookings" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfilePage />
            </ProtectedRoute>
          } />

       
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;