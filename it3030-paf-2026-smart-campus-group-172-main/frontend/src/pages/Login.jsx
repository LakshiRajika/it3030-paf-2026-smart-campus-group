import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent-orange/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-pink/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent-yellow/10 rounded-full blur-2xl"></div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={44} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Smart Campus</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Your all-in-one platform for campus facility bookings, maintenance requests, and notifications.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {['Bookings', 'Maintenance', 'Notifications'].map((t, i) => (
              <div key={t} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-white font-semibold text-sm">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="lg:hidden w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={30} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm transition-all`}
                  placeholder="Enter your email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-400 bg-red-50' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm transition-all`}
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-center font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-purple-200"></div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-purple-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={googleLogin}
              onError={() => message.error('Google sign-in failed')}
              shape="pill"
              size="large"
              text="signin_with"
              width="100%"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-800">Sign Up</Link>
          </p>

          <div className="mt-4 p-3 bg-primary-50 rounded-xl">
            <p className="text-[11px] text-primary-700 text-center">
              <span className="font-semibold">Demo Admin:</span> admin@smartcampus.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
