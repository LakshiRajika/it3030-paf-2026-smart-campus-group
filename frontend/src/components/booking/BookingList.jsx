import React, { useState } from 'react';
import {
    CheckCircle, XCircle, Clock3, Ban,
    ChevronUp, ChevronDown, Eye, Calendar, Clock
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock3 },
    APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200', icon: Ban },
};

/**
 * BookingList – table view of bookings
 * Props:
 *   bookings      – array of BookingResponse
 *   isAdmin       – boolean
 *   onViewDetail  – (booking) => void
 *   onCancel      – (bookingId) => void  (user only)
 */
const BookingList = ({ bookings = [], isAdmin, onViewDetail, onCancel }) => {
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sorted = [...bookings].sort((a, b) => {
        let va = a[sortField] ?? '';
        let vb = b[sortField] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronUp size={12} className="text-slate-300" />;
        return sortDir === 'asc'
            ? <ChevronUp size={12} className="text-indigo-500" />
            : <ChevronDown size={12} className="text-indigo-500" />;
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m}${hour < 12 ? 'am' : 'pm'}`;
    };

    const ThCell = ({ field, children }) => (
        <th
            onClick={() => handleSort(field)}
            className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
        >
            <span className="flex items-center gap-1">
                {children}
                <SortIcon field={field} />
            </span>
        </th>
    );

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <p className="text-sm">No bookings to display</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <ThCell field="facilityName">Facility</ThCell>
                            {isAdmin && <ThCell field="userName">Requested By</ThCell>}
                            <ThCell field="date">Date</ThCell>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                Time
                            </th>
                            <ThCell field="expectedAttendees">Attendees</ThCell>
                            <ThCell field="status">Status</ThCell>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sorted.map(booking => {
                            const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                            const StatusIcon = config.icon;
                            const canCancel = ['PENDING', 'APPROVED'].includes(booking.status);

                            return (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                    {/* Facility */}
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-800">{booking.facilityName}</p>
                                        <p className="text-xs text-slate-400">{booking.facilityLocation}</p>
                                    </td>

                                    {/* Requested by (admin) */}
                                    {isAdmin && (
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-700">{booking.userName || '—'}</p>
                                            <p className="text-xs text-slate-400">{booking.userEmail || ''}</p>
                                        </td>
                                    )}

                                    {/* Date */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                            <Calendar size={13} className="text-indigo-400 shrink-0" />
                                            {formatDate(booking.date)}
                                        </div>
                                    </td>

                                    {/* Time */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                            <Clock size={13} className="text-indigo-400 shrink-0" />
                                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                        </div>
                                    </td>

                                    {/* Attendees */}
                                    <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                        {booking.expectedAttendees ?? '—'}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
                                            <StatusIcon size={11} />
                                            {config.label}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onViewDetail && onViewDetail(booking)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>
                                            {canCancel && !isAdmin && (
                                                <button
                                                    onClick={() => onCancel && onCancel(booking.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
                </p>
                <p className="text-xs text-slate-400">
                    Sorted by {sortField} ({sortDir === 'asc' ? '↑' : '↓'})
                </p>
            </div>
        </div>
    );
};

export default BookingList;