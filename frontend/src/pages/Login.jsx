import React from 'react';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Welcome Back</h1>
        <p className="text-slate-500 mb-6">Login is currently mocked for development purposes.</p>
        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Login as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
