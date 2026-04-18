import React, { useState } from 'react';
import { X, Calendar, Clock, Users, FileText, MapPin, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import bookingService from '../../services/bookingService';

const STATUS_COLORS = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

const BookingDetail = ({ booking, isAdmin, onClose, onUpdated }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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