import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const STATUS_DOT = {
    PENDING: 'bg-amber-400',
    APPROVED: 'bg-emerald-500',
    REJECTED: 'bg-red-400',
    CANCELLED: 'bg-slate-300',
};

const STATUS_TAG = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * CalendarView
 * Props:
 *   bookings     – array of BookingResponse objects
 *   onSelectDay  – (date: string, bookingsOnDay: array) => void
 */
const CalendarView = ({ bookings = [], onSelectDay }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Build a map: "YYYY-MM-DD" → [booking, ...]
    const bookingMap = {};
    bookings.forEach(b => {
        if (!b.date) return;
        const key = b.date.substring(0, 10); // "YYYY-MM-DD"
        if (!bookingMap[key]) bookingMap[key] = [];
        bookingMap[key].push(b);
    });

    // Days in month + leading blanks
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

    const handleDayClick = (day) => {
        if (!day) return;
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDay(key);
        onSelectDay && onSelectDay(key, bookingMap[key] || []);
    };

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const selectedBookings = selectedDay ? (bookingMap[selectedDay] || []) : [];

    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m}${hour < 12 ? 'am' : 'pm'}`;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                        {MONTHS[month]} {year}
                    </h2>
                    <button
                        onClick={goToday}
                        className="text-xs px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100 transition-colors"
                    >
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={18} className="text-slate-500" />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronRight size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
                {DAYS.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                    const key = day
                        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        : null;
                    const dayBookings = key ? (bookingMap[key] || []) : [];
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDay;
                    const isPast = key && key < todayKey;

                    // Count by status for dot display
                    const statusCounts = {};
                    dayBookings.forEach(b => {
                        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
                    });

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[72px] p-2 border-b border-r border-slate-50 transition-all
                ${day ? 'cursor-pointer hover:bg-indigo-50/50' : ''}
                ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : ''}
                ${isPast && !isSelected ? 'bg-slate-50/50' : ''}
              `}
                        >
                            {day && (
                                <>
                                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1
                    ${isToday ? 'bg-indigo-600 text-white' : isSelected ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700'}
                    ${isPast && !isToday ? 'text-slate-400' : ''}
                  `}>
                                        {day}
                                    </div>

                                    {/* Status dots */}
                                    {dayBookings.length > 0 && (
                                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                                            {Object.entries(statusCounts).map(([status, count]) => (
                                                <div key={status} className="flex items-center gap-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-slate-400'}`} />
                                                    {count > 1 && (
                                                        <span className="text-[9px] text-slate-500 font-bold">{count}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Compact booking label (for larger screens) */}
                                    {dayBookings.slice(0, 1).map(b => (
                                        <div
                                            key={b.id}
                                            className={`hidden sm:block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded truncate
                        ${STATUS_TAG[b.status] || 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {b.resourceName || 'Booking'}
                                        </div>
                                    ))}
                                    {dayBookings.length > 1 && (
                                        <div className="hidden sm:block text-[10px] text-slate-400 font-medium mt-0.5 pl-1">
                                            +{dayBookings.length - 1} more
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 font-semibold">Legend:</span>
                {Object.entries(STATUS_DOT).map(([status, dotClass]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="text-xs text-slate-500">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                    </div>
                ))}
            </div>

            {/* Selected Day Detail Panel */}
            {selectedDay && (
                <div className="border-t border-slate-200">
                    <div className="px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">
                            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                            {selectedBookings.length === 0 && (
                                <span className="ml-2 text-slate-400 font-normal">— No bookings</span>
                            )}
                        </h3>

                        {selectedBookings.length > 0 && (
                            <div className="space-y-2">
                                {selectedBookings.map(b => (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors"
                                    >
                                        <div className={`w-2 h-10 rounded-full shrink-0 ${STATUS_DOT[b.status]}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{b.resourceName}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock size={11} />
                                                {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{b.purpose}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_TAG[b.status]}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;