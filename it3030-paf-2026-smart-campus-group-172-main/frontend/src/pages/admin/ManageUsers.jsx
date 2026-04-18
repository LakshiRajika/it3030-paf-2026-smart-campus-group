import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { message, Modal } from 'antd';
import { Users, Shield, ShieldOff, Trash2, Search } from 'lucide-react';
import dayjs from 'dayjs';

const roleColors = {
  ADMIN: 'bg-red-100 text-red-700', USER: 'bg-blue-100 text-blue-700',
  TECHNICIAN: 'bg-purple-100 text-purple-700', MANAGER: 'bg-orange-100 text-orange-700',
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await userAPI.getAll(); setUsers(res.data.data || []); }
    catch { message.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = (id, currentRole) => {
    let newRole = '';
    Modal.confirm({
      title: 'Change User Role',
      content: (
        <div className="mt-3">
          <select id="roleSelect" defaultValue={currentRole}
            className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm bg-white font-poppins"
            onChange={e => newRole = e.target.value}>
            {['USER', 'ADMIN', 'TECHNICIAN', 'MANAGER'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ),
      onOk: async () => {
        const role = newRole || document.getElementById('roleSelect')?.value;
        if (!role || role === currentRole) return;
        try { await userAPI.updateRole(id, role); message.success('Role updated'); fetchUsers(); }
        catch (err) { message.error(err.response?.data?.message || 'Failed to update role'); }
      }
    });
  };

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      await userAPI.toggleActive(id);
      message.success(currentlyActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { message.error('Failed to toggle user status'); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete User', content: 'This action cannot be undone.', okText: 'Delete', okButtonProps: { danger: true },
      onOk: async () => {
        try { await userAPI.delete(id); message.success('User deleted'); fetchUsers(); }
        catch { message.error('Failed to delete'); }
      }
    });
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.studentId || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Manage Users</h1>
        <span className="text-sm text-gray-500">{users.length} total users</span>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
          placeholder="Search by name, email, or student ID..." />
      </div>

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="card-glass">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-accent-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-800">{u.firstName} {u.lastName}</h3>
                  <span className={`badge-status ${roleColors[u.role]}`}>{u.role}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] text-gray-500 mt-0.5">
                  <span>{u.email}</span>
                  {u.studentId && <span>ID: {u.studentId}</span>}
                  {u.department && <span>{u.department}</span>}
                  <span>Joined: {dayjs(u.createdAt).format('MMM D, YYYY')}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleRoleChange(u.id, u.role)}
                  className="p-2 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors" title="Change Role">
                  <Shield size={16} className="text-primary-700" />
                </button>
                <button onClick={() => handleToggleActive(u.id, u.active)}
                  className={`p-2 rounded-lg transition-colors ${u.active ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-green-100 hover:bg-green-200'}`}
                  title={u.active ? 'Deactivate' : 'Activate'}>
                  <ShieldOff size={16} className={u.active ? 'text-yellow-700' : 'text-green-700'} />
                </button>
                <button onClick={() => handleDelete(u.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Delete">
                  <Trash2 size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
