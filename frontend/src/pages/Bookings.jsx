import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Filter, RefreshCw, Calendar,
    CheckCircle, XCircle, Clock3, Ban, BookOpen, Loader
} from 'lucide-react';
import BookingCard from '../components/booking/BookingCard';
import BookingForm from '../components/booking/BookingForm';
import BookingDetail from '../components/booking/BookingDetail';
import bookingService from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';

const STATUS_FILTERS = [
    { value: '', label: 'All', icon: BookOpen, color: 'text-slate-600' },
    { value: 'PENDING', label: 'Pending', icon: Clock3, color: 'text-amber-600' },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle, color: 'text-emerald-600' },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'text-red-600' },
    { value: 'CANCELLED', label: 'Cancelled', icon: Ban, color: 'text-slate-400' },
];

const Bookings = () => {
    const { user } = useAuth(); // { id, name, email, role }
    const isAdmin = user?.role === 'ADMIN';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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
        } catch (err) {
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, statusFilter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Client-side search
    const filteredBookings = bookings.filter(b => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (b.facilityName || '').toLowerCase().includes(term) ||
            (b.purpose || '').toLowerCase().includes(term) ||
            (b.facilityLocation || '').toLowerCase().includes(term) ||
            (b.userName || '').toLowerCase().includes(term)
        );
    });

    const handleBookingCreated = (newBooking) => {
        setBookings(prev => [newBooking, ...prev]);
        setShowForm(false);
    };

    const handleBookingUpdated = (updatedBooking) => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const updated = await bookingService.cancelBooking(bookingId);
            handleBookingUpdated(updated);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to cancel booking.');
        }
    };

    // Stats summary
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

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} color="bg-indigo-50 text-indigo-700" />
                <StatCard label="Pending" value={stats.pending} color="bg-amber-50 text-amber-700" />
                <StatCard label="Approved" value={stats.approved} color="bg-emerald-50 text-emerald-700" />
                <StatCard label="Rejected" value={stats.rejected} color="bg-red-50 text-red-700" />
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by facility, purpose, or location..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>
                <button
                    onClick={fetchBookings}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {STATUS_FILTERS.map(({ value, label, icon: Icon, color }) => (
                    <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              ${statusFilter === value
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : `bg-white border border-slate-200 ${color} hover:border-indigo-300`}`}
                    >
                        <Icon size={14} />
                        {label}
                        {value !== '' && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold
                ${statusFilter === value ? 'bg-white/20' : 'bg-slate-100'}`}>
                                {value === 'PENDING' ? stats.pending :
                                    value === 'APPROVED' ? stats.approved :
                                        value === 'REJECTED' ? stats.rejected : stats.cancelled}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                    <XCircle size={18} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Bookings Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                        <Loader size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
                        <p className="text-slate-500">Loading bookings...</p>
                    </div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                        <Calendar size={36} className="text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">
                        {searchTerm || statusFilter ? 'No matching bookings' : 'No bookings yet'}
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                        {searchTerm || statusFilter
                            ? 'Try adjusting your search or filter criteria'
                            : 'Create your first booking request to get started'}
                    </p>
                    {!searchTerm && !statusFilter && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={18} />
                            New Booking
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredBookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            isAdmin={isAdmin}
                            onCancel={handleCancelBooking}
                            onViewDetail={setSelectedBooking}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showForm && (
                <BookingForm
                    onClose={() => setShowForm(false)}
                    onSuccess={handleBookingCreated}
                />
            )}

            {selectedBooking && (
                <BookingDetail
                    booking={selectedBooking}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedBooking(null)}
                    onUpdated={(updated) => {
                        handleBookingUpdated(updated);
                        setSelectedBooking(updated);
                    }}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className={`rounded-2xl p-4 ${color} flex flex-col`}>
        <span className="text-3xl font-black">{value}</span>
        <span className="text-sm font-semibold mt-1 opacity-75">{label}</span>
    </div>
);

export default Bookings;