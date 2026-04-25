import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Calendar, MapPin, User, Clock, ArrowLeft, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';

const CheckInVerification = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [pin, setPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleConfirmCheckIn = async (e) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        try {
            const data = await bookingService.checkInPublic(bookingId, token, pin);
            setResult(data);
            toast.success('Check-in verified successfully!');
        } catch (err) {
            console.error('Check-in error:', err);
            const msg = err.response?.data?.message || 'Verification failed. Please check the PIN and ensure the QR is valid.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
    };

    // ─── Phase 1: PIN Entry Form ──────────────────────────────────────────
    if (!result && !error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <div className="bg-indigo-600 p-8 text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                            <QrCode size={40} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Staff Verification</h1>
                        <p className="text-indigo-100 text-sm font-medium mt-1">Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleConfirmCheckIn} className="p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                Enter Staff Security PIN
                            </label>
                            <input 
                                type="password" 
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl font-black tracking-[1em] text-indigo-600 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                required
                                autoFocus
                                maxLength={6}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isVerifying || pin.length < 1}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {isVerifying ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Verify & Check-in
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase leading-relaxed">
                            Entering your PIN marks the student as present and records the entry timestamp
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    // ─── Phase 2: Error Screen ────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-xl shadow-red-200/50">
                    <XCircle size={48} className="text-red-600" />
                </div>
                <h1 className="text-3xl font-black text-red-900 mb-2 tracking-tight">Access Denied</h1>
                <p className="text-red-700 font-medium max-w-sm mb-8">{error}</p>
                <button 
                    onClick={() => { setError(null); setPin(''); }}
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                    <ArrowLeft size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    // ─── Phase 3: Success Screen ──────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200/50">
                <CheckCircle size={48} className="text-emerald-600" />
            </div>
            
            <h1 className="text-3xl font-black text-emerald-900 mb-2 tracking-tight">Check-in Approved!</h1>
            <p className="text-emerald-700 font-medium mb-8 text-center px-4">Student has been verified and registered for this resource.</p>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 overflow-hidden border border-emerald-100">
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Verified Entry</span>
                    <span className="text-xs font-mono font-bold bg-white/20 px-2 py-1 rounded">#{result.id?.slice(-8)}</span>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <MapPin className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility</p>
                            <p className="font-bold text-slate-900">{result.resourceName}</p>
                            <p className="text-xs font-semibold text-slate-500">{result.resourceLocation}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <Calendar className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                                <p className="text-sm font-bold text-slate-900">{result.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Clock className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                                <p className="text-sm font-bold text-slate-900">{formatTime(result.startTime)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                            <User className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student</p>
                            <p className="font-bold text-slate-900">{result.userName}</p>
                            <p className="text-xs font-semibold text-slate-500">{result.userEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={() => navigate('/admin/bookings')}
                        className="w-full py-3 text-slate-600 font-bold text-sm hover:text-indigo-600 transition-colors"
                    >
                        Close & Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckInVerification;
