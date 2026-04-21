import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText, MapPin, CheckCircle, XCircle, AlertCircle, Loader, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import bookingService from '../../services/bookingService';

const STATUS_COLORS = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

const BookingDetail = ({ booking: initialBooking, isAdmin, onClose, onUpdated }) => {
    const [booking, setBooking] = useState(initialBooking);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [showQR, setShowQR] = useState(false);

    // Refresh data on mount to ensure we have the secret token and latest status
    useEffect(() => {
        const refreshData = async () => {
            setRefreshing(true);
            try {
                const latest = await bookingService.getBookingById(initialBooking.id);
                setBooking(latest);
                if (onUpdated) onUpdated(latest);
            } catch (err) {
                console.error("Failed to sync booking data:", err);
            } finally {
                setRefreshing(false);
            }
        };
        refreshData();
    }, [initialBooking.id]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }) : '—';

    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
    };

    const handleAdminAction = async (status) => {
        if (status === 'REJECTED' && !rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const updated = await bookingService.updateBookingStatus(
                booking.id,
                status,
                status === 'REJECTED' ? rejectionReason : null
            );
            onUpdated(updated);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        setError('');
        try {
            const updated = await bookingService.cancelBooking(booking.id);
            onUpdated(updated);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Cancel failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Booking Details</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">#{booking.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status]}`}>
                            {booking.status}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Resource info */}
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Resource</p>
                        <p className="font-bold text-indigo-900 text-base">{booking.resourceName}</p>
                        <p className="text-sm text-indigo-600">{booking.resourceType}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-indigo-500">
                            <MapPin size={12} />
                            {booking.resourceLocation}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 gap-3">
                        <DetailRow icon={Calendar} label="Date" value={formatDate(booking.date)} />
                        <DetailRow icon={Clock} label="Time"
                            value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
                        {booking.expectedAttendees && (
                            <DetailRow icon={Users} label="Attendees" value={`${booking.expectedAttendees} people`} />
                        )}
                        <DetailRow icon={FileText} label="Purpose" value={booking.purpose} multiline />
                    </div>

                    {/* Requester info (admin view) */}
                    {isAdmin && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requested By</p>
                            <p className="font-semibold text-slate-800">{booking.userName}</p>
                            <p className="text-sm text-slate-500">{booking.userEmail}</p>
                        </div>
                    )}

                    {/* Admin reason */}
                    {booking.adminReason && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Admin Note</p>
                            <p className="text-sm text-amber-900">{booking.adminReason}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '—'}</span>
                        <span>Updated: {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : '—'}</span>
                    </div>

                    {/* Check-in Info */}
                    {booking.checkedIn && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-600" />
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Checked In</p>
                                <p className="text-sm text-emerald-900 font-medium">Verified at {new Date(booking.checkedInAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {/* QR Code Section */}
                    {booking.status === 'APPROVED' && !booking.checkedIn && (
                        <div className="pt-4 border-t border-slate-100">
                            {!showQR ? (
                                <button
                                    onClick={() => setShowQR(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200 shadow-sm"
                                >
                                    <QrCode size={18} />
                                    View Check-in QR Code
                                </button>
                            ) : (
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in duration-300">
                                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 border border-slate-200">
                                        {booking.checkInToken ? (
                                            <QRCodeCanvas
                                                value={`${window.location.protocol}//192.168.8.142:3000/verify-checkin/${booking.id}?token=${booking.checkInToken}`}
                                                size={180}
                                                level={"H"}
                                                includeMargin={true}
                                            />
                                        ) : (
                                            <div className="w-[180px] h-[180px] flex flex-col items-center justify-center gap-2">
                                                <Loader className="animate-spin text-indigo-400" size={32} />
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Generating QR...</p>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-800">Check-in QR Code</h3>
                                    <p className="text-xs text-slate-500 mt-1 px-4 leading-relaxed">
                                        Present this code at the facility entrance for verification by staff.
                                    </p>
                                    
                                    {/* Simulation Link for Desktop Testing */}
                                    <a 
                                        href={`/verify-checkin/${booking.id}?token=${booking.checkInToken}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline uppercase tracking-widest"
                                    >
                                        Testing on Desktop? Click to simulate scan
                                    </a>

                                    <button
                                        onClick={() => setShowQR(false)}
                                        className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        Hide QR Code
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && booking.status === 'PENDING' && (
                        <div className="pt-2 border-t border-slate-100 space-y-3">
                            <p className="text-sm font-semibold text-slate-700">Admin Actions</p>

                            {!showRejectInput ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAdminAction('APPROVED')}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={e => { setRejectionReason(e.target.value); setError(''); }}
                                        placeholder="Provide a reason for rejection (required)..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => handleAdminAction('REJECTED')}
                                            disabled={loading || !rejectionReason.trim()}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? <Loader size={14} className="animate-spin" /> : null}
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Cancel Approved booking */}
                    {isAdmin && booking.status === 'APPROVED' && (
                        <div className="pt-2 border-t border-slate-100">
                            <button
                                onClick={() => handleAdminAction('CANCELLED')}
                                disabled={loading}
                                className="w-full px-4 py-2.5 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader size={16} className="animate-spin" /> : null}
                                Cancel Booking
                            </button>
                        </div>
                    )}

                    {/* User Cancel */}
                    {!isAdmin && ['PENDING', 'APPROVED'].includes(booking.status) && (
                        <div className="pt-2 border-t border-slate-100">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="w-full px-4 py-2.5 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader size={16} className="animate-spin" /> : null}
                                Cancel My Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, multiline }) => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-indigo-500" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className={`text-sm text-slate-800 font-semibold mt-0.5 ${multiline ? '' : 'truncate'}`}>{value || '—'}</p>
        </div>
    </div>
);

export default BookingDetail;