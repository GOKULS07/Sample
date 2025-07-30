import React from 'react'; // Just pulling in React
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Our routing setup for different pages

// Importing all our page components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from '././pages/RegisterPage'; // Oops, looks like a tiny typo here (././) - should be ./pages/RegisterPage
import RoomListPage from './pages/RoomListPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

// Our special authentication tools
import { AuthProvider } from './contexts/AuthContext'; // This wraps our whole app to manage who's logged in
import ProtectedRoute from './components/ProtectedRoute'; // Our custom component to guard pages that need a login

// Importing all the pages specifically for house owners
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddRoomPage from './pages/owner/AddRoomPage';
import ManageRoomsPage from './pages/owner/ManageRoomsPage';
import EditRoomPage from './pages/owner/EditRoomPage';
import BookingManagementPage from './pages/owner/BookingManagementPage';
import OwnerProfilePage from './pages/owner/ProfilePage'; // The owner's profile page

// Importing all the pages specifically for customers
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingPage from './pages/customer/BookingPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import CustomerProfilePage from './pages/customer/ProfilePage'; // The customer's profile page

// This is our main application component!
// It sets up all the different paths (routes) people can visit in our app.
function App() {
  return (
    // The Router helps us navigate between pages without full reloads
    <Router>
      {/* AuthProvider wraps everything so any part of our app knows who's logged in */}
      <AuthProvider>
        <Navbar /> {/* Our navigation bar, always visible */}
        <Routes> {/* This is where we define all our different web pages */}
          
          {/* Public Pages: Anyone can visit these, no login needed */}
          <Route path="/" element={<HomePage />} /> {/* The main landing page */}
          <Route path="/login" element={<LoginPage />} /> {/* Where users log in */}
          <Route path="/register" element={<RegisterPage />} /> {/* Where new users sign up */}
          <Route path="/rooms" element={<RoomListPage />} /> {/* Shows all available rooms */}
          <Route path="/rooms/:id" element={<RoomDetailsPage />} /> {/* Shows details for one specific room */}

          {/* House Owner Pages: Only owners can see these! */}
          {/* We use ProtectedRoute here to make sure only a 'house_owner' can access them */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['house_owner']}> {/* Guards this route for owners */}
              <OwnerDashboard /> {/* Owner's main hub */}
            </ProtectedRoute>
          } />
          <Route path="/owner/add-room" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <AddRoomPage /> {/* Page to add a new room listing */}
            </ProtectedRoute>
          } />
          <Route path="/owner/manage-rooms" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <ManageRoomsPage /> {/* Page to view and manage all owner's rooms */}
            </ProtectedRoute>
          } />
          <Route path="/owner/edit-room/:id" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <EditRoomPage /> {/* Page to change details of a specific room */}
            </ProtectedRoute>
          } />
          <Route path="/owner/bookings" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <BookingManagementPage /> {/* Page for owners to see and manage bookings for their rooms */}
            </ProtectedRoute>
          } />
          <Route path="/owner/profile" element={
            <ProtectedRoute allowedRoles={['house_owner']}>
              <OwnerProfilePage /> {/* Owner's profile settings */}
            </ProtectedRoute>
          } />

          {/* Customer Pages: Only customers can see these! */}
          {/* Again, ProtectedRoute makes sure only a 'customer' can get in */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}> {/* Guards this route for customers */}
              <CustomerDashboard /> {/* Customer's main hub */}
            </ProtectedRoute>
          } />
          <Route path="/customer/book/:id" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingPage /> {/* Where customers confirm their room booking */}
            </ProtectedRoute>
          } />
          <Route path="/customer/bookings" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingHistoryPage /> {/* Customers can see their past and upcoming bookings here */}
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfilePage /> {/* Customer's profile settings */}
            </ProtectedRoute>
          } />

          {/* Catch-all Route: If someone types a wrong address, they land here */}
          <Route path="*" element={<NotFoundPage />} /> {/* Our custom 404 page */}
        </Routes>
      </AuthProvider> {/* AuthProvider ends here */}
    </Router> // Router ends here
  );
}

export default App; // Make our App component available to be used
