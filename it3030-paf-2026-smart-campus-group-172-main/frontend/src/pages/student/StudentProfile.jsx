import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { message } from 'antd';
import { User, Mail, Phone, Hash, Building2, BookOpen, Save } from 'lucide-react';

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', studentId: '', department: '', faculty: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userAPI.getMe();
        const u = res.data.data;
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '', studentId: u.studentId || '', department: u.department || '', faculty: u.faculty || '' });
      } catch { message.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) { message.warning('Name fields are required'); return; }
    setSaving(true);
    try {
      const res = await userAPI.updateMe(form);
      message.success(res.data.message || 'Profile updated successfully');
      const updated = res.data.data;
      const userData = { ...user, firstName: updated.firstName, lastName: updated.lastName };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) { message.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  const Field = ({ icon: Icon, label, name, type = 'text', placeholder, disabled }) => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type={type} value={form[name]} disabled={disabled}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder} />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title">My Profile</h1>

      <div className="card-glass">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-purple-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-orange flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-900">{form.firstName} {form.lastName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge-status bg-primary-100 text-primary-700 mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field icon={User} label="First Name" name="firstName" placeholder="John" />
            <Field icon={User} label="Last Name" name="lastName" placeholder="Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Phone} label="Phone" name="phone" placeholder="+94 77 123 4567" />
            <Field icon={Hash} label="Student ID" name="studentId" placeholder="IT20123456" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field icon={Building2} label="Department" name="department" placeholder="Computing" />
            <Field icon={BookOpen} label="Faculty" name="faculty" placeholder="Computing" />
          </div>

          <div className="flex justify-end pt-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
