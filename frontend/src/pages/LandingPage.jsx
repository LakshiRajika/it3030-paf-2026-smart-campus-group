import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Wrench, Shield, ArrowRight, Zap, Globe, Users } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-indigo-500" />,
      title: 'Facility Management',
      description: 'Book and manage campus facilities seamlessly. Real-time availability and instant confirmations.'
    },
    {
      icon: <Wrench className="w-6 h-6 text-fuchsia-500" />,
      title: 'Maintenance Tracking',
      description: 'Report issues and track maintenance requests. Smart routing to available technicians.'
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: 'Access Control',
      description: 'Secure digital check-ins and QR-code based verifications for all booked resources.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards providing insights into campus resource utilization.'
    }
  ];

  const stats = [
    { value: '50+', label: 'Facilities Available' },
    { value: '99.9%', label: 'System Uptime' },
    { value: '24/7', label: 'Support & Maintenance' },
    { value: '10k+', label: 'Active Users' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              SmartCampus
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-sm font-medium text-white hover:text-indigo-300 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="px-6 py-2.5 text-sm font-medium bg-white text-slate-900 rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-4 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Welcome to the future of campus management
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 leading-tight">
            Elevate Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400">
              Campus Experience
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for seamless facility booking, intelligent maintenance tracking, and real-time campus resource optimization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-full font-semibold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-white">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold">Intelligent Core Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to manage a modern educational or corporate campus, completely streamlined.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white/90">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 pt-16 pb-8 mt-32">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Building2 className="w-5 h-5" />
            <span className="font-bold tracking-tight">SmartCampus</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Users className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
