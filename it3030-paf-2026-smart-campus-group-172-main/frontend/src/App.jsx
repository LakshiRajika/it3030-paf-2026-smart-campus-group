import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import MyBookings from './pages/student/MyBookings';
import NewBooking from './pages/student/NewBooking';
import MyTickets from './pages/student/MyTickets';
import NewTicket from './pages/student/NewTicket';
import TicketDetail from './pages/student/TicketDetail';
import StudentProfile from './pages/student/StudentProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBookings from './pages/admin/ManageBookings';
import ManageFacilities from './pages/admin/ManageFacilities';
import ManageTickets from './pages/admin/ManageTickets';
import ManageUsers from './pages/admin/ManageUsers';
import AdminTicketDetail from './pages/admin/AdminTicketDetail';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Register />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="bookings/new" element={<NewBooking />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/new" element={<NewTicket />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="facilities" element={<ManageFacilities />} />
        <Route path="tickets" element={<ManageTickets />} />
        <Route path="tickets/:id" element={<AdminTicketDetail />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
