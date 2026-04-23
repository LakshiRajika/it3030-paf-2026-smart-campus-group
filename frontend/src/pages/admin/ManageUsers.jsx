import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { User, Shield, Search, FileDown, Trash2, Power, Activity, History } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const roleConfig = {
    'ADMIN': { color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', shadow: 'shadow-rose-100' },
    'MANAGER': { color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', shadow: 'shadow-amber-100' },
    'TECHNICIAN': { color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', shadow: 'shadow-emerald-100' },
    'USER': { color: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', shadow: 'shadow-sky-100' }
  };

  const roles = Object.keys(roleConfig);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (userId, currentRoles, roleToSelect) => {
    let newRoles;
    if (currentRoles.includes(roleToSelect)) {
      newRoles = [];
    } else {
      newRoles = [roleToSelect];
    }

    try {
      setUpdating(userId);
      await userService.updateUserRoles(userId, newRoles);
      await fetchUsers();
    } catch (err) {
      alert('Failed to update roles: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.roles.some(role => role.toLowerCase().includes(searchLower))
    );
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('User Role Management Summary', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Users: ${filteredUsers.length}`, 14, 36);
    
    const tableColumn = ["User Information", "Email Address", "Assigned Roles"];
    const tableRows = [];

    filteredUsers.forEach(user => {
      const userData = [
        user.name || 'Anonymous',
        user.email,
        user.roles.join(', ') || 'None'
      ];
      tableRows.push(userData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { 
        fillColor: [79, 70, 229], // indigo-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50, halign: 'center' }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    });

    doc.save(`user-summary-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUpdating(userId);
      await userService.toggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || err.message);
      alert('Failed to toggle user status: ' + errorMsg);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName || 'this user'}"? This action cannot be undone.`)) {
      try {
        setUpdating(userId);
        await userService.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        const errorData = err.response?.data;
        const errorMsg = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || err.message);
        alert('Failed to delete user: ' + errorMsg);
      } finally {
        setUpdating(null);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Role Management</h1>
          <p className="text-slate-500 text-sm">Assign technician, manager, or admin roles to campus users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users or roles..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleDownloadPDF}
            title="Download PDF Summary"
            className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
          >
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Information</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Roles</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Activity</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Last Active</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group ${!user.enabled ? 'opacity-70 bg-slate-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {user.picture ? (
                        <img src={user.picture} alt="" className={`w-10 h-10 rounded-full border-2 border-white shadow-sm ${!user.enabled ? 'grayscale' : ''}`} />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${!user.enabled ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                          {user.name?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold block ${!user.enabled ? 'text-slate-500' : 'text-slate-900'}`}>{user.name || 'Anonymous'}</span>
                          {!user.enabled && (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-black uppercase rounded-full tracking-tighter">Deactivated</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {roles.map(role => {
                        const isActive = user.roles.includes(role);
                        const config = roleConfig[role];
                        return (
                          <button
                            key={role}
                            disabled={updating === user.id}
                            onClick={() => handleRoleSelect(user.id, user.roles, role)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 
                              ${isActive 
                                ? `${config.color} text-white shadow-lg ${config.shadow}` 
                                : `bg-white border ${config.border} ${config.text} hover:${config.color} hover:text-white`
                              } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''} hover:scale-105 active:scale-95`}
                          >
                            <Shield className={`w-3 h-3 ${isActive ? 'text-white' : ''}`} />
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full" title="Bookings">
                          <Activity className="w-3 h-3 text-emerald-500" /> {user.bookingCount || 0}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full" title="Tickets">
                          <History className="w-3 h-3 text-amber-500" /> {user.ticketCount || 0}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-medium text-slate-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={updating === user.id}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${user.enabled ? 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50' : 'text-rose-500 bg-rose-50 hover:bg-rose-100'}`}
                        title={user.enabled ? "Deactivate User" : "Activate User"}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={updating === user.id}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
