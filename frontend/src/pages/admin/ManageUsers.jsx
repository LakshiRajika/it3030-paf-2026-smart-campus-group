import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { User, Shield, CheckCircle, XCircle } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const roles = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

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

  const handleToggleRole = async (userId, currentRoles, roleToToggle) => {
    let newRoles;
    if (currentRoles.includes(roleToToggle)) {
      newRoles = currentRoles.filter(r => r !== roleToToggle);
    } else {
      newRoles = [...currentRoles, roleToToggle];
    }

    try {
      setUpdating(userId);
      await userService.updateUserRoles(userId, newRoles);
      fetchUsers();
    } catch (err) {
      alert('Failed to update roles: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">User Role Management</h1>
        <p className="text-slate-500 text-sm">Assign technician, manager, or admin roles to campus users.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Information</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="3" className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : (
              users.map((user) => (
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
                            onClick={() => handleToggleRole(user.id, user.roles, role)}
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
