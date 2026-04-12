import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Simple Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight uppercase">SmartCampus</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => window.location.href='/dashboard'} className="text-slate-500 font-semibold hover:text-indigo-600 transition-colors">Dashboard</button>
              <button onClick={() => window.location.href='/tickets'} className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1">Tickets</button>
              <button onClick={() => window.location.href='/facilities'} className="text-slate-500 font-semibold hover:text-indigo-600 transition-colors">Facilities</button>
              <button onClick={() => window.location.href='/bookings'} className="text-slate-500 font-semibold hover:text-indigo-600 transition-colors">Bookings</button>
            </nav>

            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">Campus Staff</p>
                  <p className="text-[10px] text-slate-400">staff@smartcampus.edu</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Campus+Staff&background=6366f1&color=fff" alt="User" />
               </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </main>

        {/* Simple Footer */}
        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">© 2024 Smart Campus Operations Hub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
