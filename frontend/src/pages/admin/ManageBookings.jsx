import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, RefreshCw, CheckCircle, XCircle, Clock3,
    Ban, BookOpen, Loader, Filter, Users, Building2
} from 'lucide-react';
import BookingCard from '../../components/booking/BookingCard';
import BookingDetail from '../../components/booking/BookingDetail';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';

const STATUS_FILTERS = [
    { value: '', label: 'All', icon: BookOpen },
    { value: 'PENDING', label: 'Pending', icon: Clock3 },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle },
    { value: 'CANCELLED', label: 'Cancelled', icon: Ban },
];

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await bookingService.getAllBookings(
                statusFilter || null,
                resourceFilter || null
            );
            setBookings(data);
        } catch {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, resourceFilter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        resourceService.getAll().then(setResources).catch(() => { });
    }, []);

    const filtered = bookings.filter(b => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return (
            (b.resourceName || '').toLowerCase().includes(t) ||
            (b.userName || '').toLowerCase().includes(t) ||
            (b.userEmail || '').toLowerCase().includes(t) ||
            (b.purpose || '').toLowerCase().includes(t)
        );
    });

    const handleUpdated = (updated) => {
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    };

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Bookings</h1>
                    {pendingCount > 0 && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full border border-amber-200">
                            {pendingCount} pending review
                        </span>
                    )}
                </div>
                <p className="text-slate-500">Review, approve, or reject all resource booking requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                {STATUS_FILTERS.map(({ value, label, icon: Icon }) => {
                    const count = value ? bookings.filter(b => b.status === value).length : bookings.length;
                    return (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`p-4 rounded-2xl text-left transition-all border
                ${statusFilter === value
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                    : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                        >
                            <Icon size={18} className={statusFilter === value ? 'text-white/70' : 'text-slate-400'} />
                            <p className={`text-2xl font-black mt-2 ${statusFilter === value ? 'text-white' : 'text-slate-900'}`}>
                                {count}
                            </p>
                            <p className={`text-xs font-semibold mt-0.5 ${statusFilter === value ? 'text-white/70' : 'text-slate-500'}`}>
                                {label}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by user, resource, or purpose..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>

                <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={resourceFilter}
                        onChange={e => setResourceFilter(e.target.value)}
                        className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
                    >
                        <option value="">All Resources</option>
                        {resources.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={fetchBookings}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                    <XCircle size={18} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Bookings */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                        <Loader size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
                        <p className="text-slate-500">Loading bookings...</p>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={36} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No bookings found</h3>
                    <p className="text-slate-400">Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-slate-500 mb-4 font-medium">
                        Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                isAdmin={true}
                                onViewDetail={setSelectedBooking}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedBooking && (
                <BookingDetail
                    booking={selectedBooking}
                    isAdmin={true}
                    onClose={() => setSelectedBooking(null)}
                    onUpdated={(updated) => {
                        handleUpdated(updated);
                        setSelectedBooking(updated);
                    }}
                />
            )}
        </div>
    );
};

export default ManageBookings;