import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { GraduationCap, Mail, Lock, User, Phone, Hash, Building2, Eye, EyeOff } from 'lucide-react';

const Field = ({ icon: Icon, label, name, type = 'text', placeholder, required, form, setForm, errors, showPw, setShowPw }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}{required && <span className="text-red-400">*</span>}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type === 'password' ? (showPw ? 'text' : 'password') : type}
        value={form[name] ?? ''}
        onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-400 bg-red-50' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all`}
        placeholder={placeholder}
      />
      {type === 'password' && (
        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {errors[name] && <p className="text-red-500 text-[11px] mt-0.5">{errors[name]}</p>}
  </div>
);

export default function Register() {
  const { register, googleLogin } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', studentId: '', department: '', faculty: ''
  });
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.phone && !/^[0-9+\-\s()]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await register(form); } catch { } finally { setLoading(false); }
  };

  // Field moved below (outside Register) to avoid remounts on every render

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-orange/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-pink/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900">Create Account</h2>
          <p className="text-gray-500 text-sm">Join Smart Campus today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field icon={User} label="First Name" name="firstName" placeholder="John" required form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
            <Field icon={User} label="Last Name" name="lastName" placeholder="Doe" required form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
          </div>
          <Field icon={Mail} label="Email" name="email" type="email" placeholder="john@university.edu" required form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
          <Field icon={Lock} label="Password" name="password" type="password" placeholder="Min 6 characters" required form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Phone} label="Phone" name="phone" placeholder="+94 77 123 4567" form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
            <Field icon={Hash} label="Student ID" name="studentId" placeholder="IT20123456" form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Building2} label="Department" name="department" placeholder="Computing" form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
            <Field icon={Building2} label="Faculty" name="faculty" placeholder="Computing" form={form} setForm={setForm} errors={errors} showPw={showPw} setShowPw={setShowPw} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 text-center font-semibold disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-purple-200"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-purple-200"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={googleLogin} onError={() => message.error('Google sign-in failed')} shape="pill" size="large" text="signup_with" />
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
