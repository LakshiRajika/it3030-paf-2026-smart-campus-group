import React from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, Clock3, Ban, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock3 },
    APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Ban },
};

const BookingCard = ({ booking, onCancel, onViewDetail, isAdmin }) => {
    const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = config.icon;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
    };

    const canCancel = ['PENDING', 'APPROVED'].includes(booking.status);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            {/* Status stripe */}
            <div className={`h-1 ${booking.status === 'APPROVED' ? 'bg-emerald-500' :
                booking.status === 'PENDING' ? 'bg-amber-400' :
                    booking.status === 'REJECTED' ? 'bg-red-400' : 'bg-slate-300'}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate pr-2">
                            {booking.resourceName || 'Unknown Resource'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{booking.resourceType} · {booking.resourceLocation}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color} shrink-0`}>
                        <StatusIcon size={12} />
                        {config.label}
                    </span>
                </div>

                {/* Details grid */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} className="text-indigo-400 shrink-0" />
                        <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={14} className="text-indigo-400 shrink-0" />
                        <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                    </div>
                    {booking.expectedAttendees && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users size={14} className="text-indigo-400 shrink-0" />
                            <span>{booking.expectedAttendees} attendees</span>
                        </div>
                    )}
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{booking.purpose}</span>
                    </div>
                </div>

                {/* Admin reason */}
                {booking.adminReason && booking.status !== 'CANCELLED' && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Admin note:</p>
                        <p className="text-xs text-slate-700 mt-0.5">{booking.adminReason}</p>
                    </div>
                )}

                {/* Admin user info */}
                {isAdmin && booking.userName && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {booking.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-500">{booking.userName} · {booking.userEmail}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => onViewDetail && onViewDetail(booking)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600"
                    >
                        View Details
                        <ChevronRight size={14} />
                    </button>
                    {canCancel && !isAdmin && (
                        <button
                            onClick={() => onCancel && onCancel(booking.id)}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingCard;