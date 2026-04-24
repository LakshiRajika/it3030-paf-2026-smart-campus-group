import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { User, Shield, Trash2, Search, Filter, Users, UserCog, Wrench, Crown, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const roles = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    // Search filter
    if (searchQuery) {
      result = result.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (activeFilter !== 'ALL') {
      result = result.filter(u => u.roles.includes(activeFilter));
    }

    setFilteredUsers(result);
  }, [searchQuery, activeFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (userId, newRole) => {
    // We send the new role as the only element in the array
    const newRoles = [newRole];

    try {
      setUpdating(userId);
      await userService.updateUserRoles(userId, newRoles);
      fetchUsers();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setUpdating(userId);
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Title & Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Smart Campus User Summary', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${timestamp}`, 14, 30);

    // Stats Section
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('Overview Stats', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Count']],
      body: [
        ['Total Registered Users', stats.total.toString()],
        ['System Administrators', stats.admins.toString()],
        ['Facility Managers', stats.managers.toString()],
        ['Technical Staff', stats.techs.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Users List Section
    doc.text('Full User Directory', 14, (doc).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc).lastAutoTable.finalY + 20,
      head: [['ID', 'Name', 'Email', 'Role']],
      body: users.map(u => [
        u.id.substring(0, 8) + '...',
        u.name || 'N/A',
        u.email,
        u.roles.join(', ')
      ]),
      headStyles: { fillColor: [71, 85, 105] }, // Slate-600
    });

    doc.save(`smart-campus-users-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes('ADMIN')).length,
    managers: users.filter(u => u.roles.includes('MANAGER')).length,
    techs: users.filter(u => u.roles.includes('TECHNICIAN')).length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admins</p>
            <p className="text-2xl font-black text-slate-900">{stats.admins}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managers</p>
            <p className="text-2xl font-black text-slate-900">{stats.managers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technicians</p>
            <p className="text-2xl font-black text-slate-900">{stats.techs}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Role Management</h1>
          <p className="text-slate-500 text-sm">Assign roles and manage campus staff accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <FileDown className="w-4 h-4" />
            Export Summary PDF
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['ALL', 'USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all
                  ${activeFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Information</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Roles</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Filter className="w-12 h-12 opacity-20" />
                    <p className="font-bold">No users found matching your criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {user.name?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{user.name || 'Anonymous'}</span>
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
                        return (
                          <button
                            key={role}
                            disabled={updating === user.id}
                            onClick={() => handleSetRole(user.id, role)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 
                              ${isActive 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Shield className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                        disabled={updating === user.id}
                        className={`p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
