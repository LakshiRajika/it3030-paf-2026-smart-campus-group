import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import { LayoutDashboard, CalendarDays, Wrench, PlusCircle, User, LogOut, GraduationCap } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/bookings', icon: CalendarDays, label: 'My Bookings' },
  { to: '/dashboard/bookings/new', icon: PlusCircle, label: 'New Booking' },
  { to: '/dashboard/tickets', icon: Wrench, label: 'My Tickets' },
  { to: '/dashboard/tickets/new', icon: PlusCircle, label: 'New Ticket' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-surface-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900 shadow-sidebar flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">SmartCampus</h1>
            <p className="text-white/50 text-[10px] uppercase tracking-widest">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-accent-orange flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-white/50 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/20">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-purple-100 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">Welcome back, {user?.firstName}!</h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
