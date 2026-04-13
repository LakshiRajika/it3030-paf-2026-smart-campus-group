import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, RefreshCw, Calendar, LayoutList,
    CheckCircle, XCircle, Clock3, Ban, BookOpen, Loader
} from 'lucide-react';
import BookingCard from '../components/booking/BookingCard';
import BookingList from '../components/booking/BookingList';
import CalendarView from '../components/booking/CalendarView';
import BookingForm from '../components/booking/BookingForm';
import BookingDetail from '../components/booking/BookingDetail';
import bookingService from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';

const STATUS_FILTERS = [
    { value: '', label: 'All', icon: BookOpen },
    { value: 'PENDING', label: 'Pending', icon: Clock3 },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle },
    { value: 'CANCELLED', label: 'Cancelled', icon: Ban },
];

const VIEW_MODES = [
    { id: 'cards', icon: BookOpen, label: 'Cards' },
    { id: 'list', icon: LayoutList, label: 'List' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
];

const Bookings = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list' | 'calendar'
    const [showForm, setShowForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = isAdmin
                ? await bookingService.getAllBookings(statusFilter || null)
                : await bookingService.getMyBookings(statusFilter || null);
            setBookings(data);
        } catch {
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, statusFilter]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const filtered = bookings.filter(b => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return (
            (b.facilityName || '').toLowerCase().includes(t) ||
            (b.purpose || '').toLowerCase().includes(t) ||
            (b.facilityLocation || '').toLowerCase().includes(t) ||
            (b.userName || '').toLowerCase().includes(t)
        );
    });

    const handleCreated = (nb) => { setBookings(p => [nb, ...p]); setShowForm(false); };
    const handleUpdated = (ub) => setBookings(p => p.map(b => b.id === ub.id ? ub : b));

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            const updated = await bookingService.cancelBooking(id);
            handleUpdated(updated);
        } catch (err) {
            alert(err?.response?.data?.message || 'Cancel failed.');
        }
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        approved: bookings.filter(b => b.status === 'APPROVED').length,
        rejected: bookings.filter(b => b.status === 'REJECTED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? 'All Bookings' : 'My Bookings'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isAdmin
                            ? 'Review and manage all resource booking requests'
                            : 'Manage your facility and resource booking requests'}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    New Booking
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} bg="bg-indigo-50" text="text-indigo-700" />
                <StatCard label="Pending" value={stats.pending} bg="bg-amber-50" text="text-amber-700" />
                <StatCard label="Approved" value={stats.approved} bg="bg-emerald-50" text="text-emerald-700" />
                <StatCard label="Rejected" value={stats.rejected} bg="bg-red-50" text="text-red-700" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search facility, purpose, location..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>

                {/* View Mode Toggle */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
                    {VIEW_MODES.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setViewMode(id)}
                            title={label}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors
                ${viewMode === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Icon size={15} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Refresh */}
                <button
                    onClick={fetchBookings}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {STATUS_FILTERS.map(({ value, label, icon: Icon }) => {
                    const count = value
                        ? (value === 'PENDING' ? stats.pending
                            : value === 'APPROVED' ? stats.approved
                                : value === 'REJECTED' ? stats.rejected
                                    : stats.cancelled)
                        : stats.total;
                    return (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                ${statusFilter === value
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                        >
                            <Icon size={14} />
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold
                ${statusFilter === value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                    <XCircle size={18} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                        <Loader size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
                        <p className="text-slate-500">Loading bookings...</p>
                    </div>
                </div>
            ) : viewMode === 'calendar' ? (
                <CalendarView
                    bookings={bookings}
                    onSelectDay={(date, dayBookings) => {
                        // If exactly one booking on that day, open its detail
                        if (dayBookings.length === 1) setSelectedBooking(dayBookings[0]);
                    }}
                />
            ) : filtered.length === 0 ? (
                <EmptyState hasFilters={!!(searchTerm || statusFilter)} onNew={() => setShowForm(true)} />
            ) : viewMode === 'list' ? (
                <BookingList
                    bookings={filtered}
                    isAdmin={isAdmin}
                    onViewDetail={setSelectedBooking}
                    onCancel={handleCancel}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(b => (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            isAdmin={isAdmin}
                            onCancel={handleCancel}
                            onViewDetail={setSelectedBooking}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showForm && (
                <BookingForm onClose={() => setShowForm(false)} onSuccess={handleCreated} />
            )}
            {selectedBooking && (
                <BookingDetail
                    booking={selectedBooking}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedBooking(null)}
                    onUpdated={(u) => { handleUpdated(u); setSelectedBooking(u); }}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, bg, text }) => (
    <div className={`rounded-2xl p-4 ${bg} ${text}`}>
        <span className="text-3xl font-black">{value}</span>
        <p className="text-sm font-semibold mt-1 opacity-75">{label}</p>
    </div>
);

const EmptyState = ({ hasFilters, onNew }) => (
    <div className="text-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Calendar size={36} className="text-indigo-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">
            {hasFilters ? 'No matching bookings' : 'No bookings yet'}
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            {hasFilters ? 'Try adjusting your search or filter criteria' : 'Create your first booking to get started'}
        </p>
        {!hasFilters && (
            <button
                onClick={onNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
                <Plus size={18} />
                New Booking
            </button>
        )}
    </div>
);

export default Bookings;