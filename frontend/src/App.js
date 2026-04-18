import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Analytics from './pages/Analytics';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ResourceCatalogue from './pages/ResourceCatalogue';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Bookings from './pages/Bookings';
import ManageBookings from './pages/admin/ManageBookings';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/oauth2/redirect';

  if (isLoginPage) return children;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight uppercase">SmartCampus</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/dashboard" className={({ isActive }) => `font-semibold transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500 hover:text-indigo-600'}`}>Dashboard</NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `font-semibold transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500 hover:text-indigo-600'}`}>Tickets</NavLink>
            <NavLink to="/facilities" className={({ isActive }) => `font-semibold transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500 hover:text-indigo-600'}`}>Facilities</NavLink>
            <NavLink to="/bookings" className={({ isActive }) => `font-semibold transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500 hover:text-indigo-600'}`}>Bookings</NavLink>
            {user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ADMIN')) && (
              <NavLink to="/admin/bookings" className={({ isActive }) => `font-semibold transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-500 hover:text-indigo-600'}`}>Manage Bookings</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">{user.email?.split('@')[0]}</p>
                  <button
                    onClick={logout}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider transition-all"
                  >
                    Logout Session
                  </button>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={logout}>
                  <img src={`https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} alt="User" />
                </div>
              </div>
            ) : (
              <button onClick={() => window.location.href = '/login'} className="text-sm font-bold text-indigo-600">Login</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2024 Smart Campus Operations Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/tickets" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />

            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />

            <Route path="/admin/bookings" element={
              <ProtectedRoute roles={['ADMIN']}>
                <ManageBookings />
              </ProtectedRoute>
            } />

            <Route path="/admin/analytics" element={
              <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                <Analytics />
              </ProtectedRoute>
            } />

            <Route path="/facilities" element={
              <ProtectedRoute>
                <ResourceCatalogue />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
