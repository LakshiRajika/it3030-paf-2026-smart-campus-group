import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';

const BookingForm = ({ onClose, onSuccess, existingBooking = null }) => {
    const isEditMode = !!existingBooking;
    const [resources, setResources] = useState([]);
    const [form, setForm] = useState({
        resourceId: existingBooking?.resourceId || '',
        date: existingBooking?.date || '',
        startTime: existingBooking?.startTime ? existingBooking.startTime.slice(0, 5) : '',
        endTime: existingBooking?.endTime ? existingBooking.endTime.slice(0, 5) : '',
        purpose: existingBooking?.purpose || '',
        expectedAttendees: existingBooking?.expectedAttendees || '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [conflictCheck, setConflictCheck] = useState(null); // null | 'checking' | 'available' | 'conflict'
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        resourceService.getAll().then(setResources).catch(() => { });
    }, []);

    // Auto-check conflict when time/resource/date fields are all filled
    useEffect(() => {
        const { resourceId, date, startTime, endTime } = form;
        if (!resourceId || !date || !startTime || !endTime) {
            setConflictCheck(null);
            return;
        }
        if (endTime <= startTime) {
            setConflictCheck(null);
            return;
        }
        setConflictCheck('checking');
        const timer = setTimeout(async () => {
            try {
                const result = await bookingService.checkConflict(
                    resourceId, 
                    date, 
                    startTime, 
                    endTime, 
                    existingBooking?.id
                );
                setConflictCheck(result.hasConflict ? 'conflict' : 'available');
            } catch {
                setConflictCheck(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [form]);

    const validate = () => {
        const e = {};
        const now = new Date();
        const localToday = now.toLocaleDateString('en-CA'); // yyyy-mm-dd format

        if (!form.resourceId) e.resourceId = 'Please select a resource';
        
        if (!form.date) {
            e.date = 'Date is required';
        } else if (form.date < localToday) {
            e.date = 'Date cannot be in the past';
        }

        if (!form.startTime) {
            e.startTime = 'Start time is required';
        } else if (form.date === localToday) {
            // Allow 30 mins grace period in frontend too to avoid frustration
            const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
            // If the grace period pushed us to yesterday, the minimum time for today is 00:00
            const graceTime = thirtyMinsAgo.toLocaleDateString('en-CA') === localToday 
                ? thirtyMinsAgo.toTimeString().slice(0, 5) 
                : '00:00';
            
            if (form.startTime < graceTime) {
                e.startTime = 'Start time is too far in the past';
            }
        }

        if (!form.endTime) {
            e.endTime = 'End time is required';
        } else if (form.endTime <= form.startTime) {
            e.endTime = 'End time must be after start time';
        }

        if (!form.purpose.trim()) {
            e.purpose = 'Purpose is required';
        } else if (form.purpose.trim().length < 5) {
            e.purpose = 'Purpose must be at least 5 characters';
        }

        if (form.expectedAttendees && form.expectedAttendees < 1) {
            e.expectedAttendees = 'Must be at least 1';
        }

        if (conflictCheck === 'conflict') {
            e.time = 'This time slot is already booked';
        }
        
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitting(true);
        setApiError('');
        try {
            const payload = {
                resourceId: form.resourceId,
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                purpose: form.purpose,
                expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
            };
            let result;
            if (isEditMode) {
                result = await bookingService.updateBooking(existingBooking.id, payload);
            } else {
                result = await bookingService.createBooking(payload);
            }
            onSuccess(result);
        } catch (err) {
            console.error('Booking failed:', err);
            const msg = err?.response?.data?.message || err?.message || 'Failed to create booking. Please try again.';
            setApiError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedResource = resources.find(r => r.id === form.resourceId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEditMode ? 'Edit Booking' : 'New Booking Request'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isEditMode ? 'Update your pending booking details' : 'Fill in the details to request a resource'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* API Error */}
                    {apiError && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{apiError}</p>
                        </div>
                    )}

                    {/* Resource Select */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Facility / Resource <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="resourceId"
                            value={form.resourceId}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                ${errors.resourceId ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        >
                            <option value="">Select a resource...</option>
                            {resources.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name} — {r.location} {r.capacity ? `(Cap: ${r.capacity})` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.resourceId && <p className="text-red-500 text-xs mt-1">{errors.resourceId}</p>}
                        {selectedResource && (
                            <p className="text-xs text-indigo-600 mt-1">
                                Type: {selectedResource.type} · Status: {selectedResource.status}
                            </p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <Calendar size={14} className="inline mr-1.5" />
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            min={new Date().toLocaleDateString('en-CA')}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                ${errors.date ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                <Clock size={14} className="inline mr-1.5" />
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                  ${errors.startTime ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            />
                            {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                <Clock size={14} className="inline mr-1.5" />
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                  ${errors.endTime ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            />
                            {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                        </div>
                    </div>

                    {/* Conflict Check Banner */}
                    {conflictCheck === 'checking' && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Loader size={14} className="animate-spin" />
                            Checking availability...
                        </div>
                    )}
                    {conflictCheck === 'available' && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                            <CheckCircle size={16} />
                            Time slot is available!
                        </div>
                    )}
                    {conflictCheck === 'conflict' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                            <AlertCircle size={16} />
                            This time slot is already booked. Please choose a different time.
                        </div>
                    )}
                    {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}

                    {/* Expected Attendees */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <Users size={14} className="inline mr-1.5" />
                            Expected Attendees
                        </label>
                        <input
                            type="number"
                            name="expectedAttendees"
                            value={form.expectedAttendees}
                            onChange={handleChange}
                            min="1"
                            placeholder="Number of attendees"
                            className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                ${errors.expectedAttendees ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        {errors.expectedAttendees && (
                            <p className="text-red-500 text-xs mt-1">{errors.expectedAttendees}</p>
                        )}
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <FileText size={14} className="inline mr-1.5" />
                            Purpose <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="purpose"
                            value={form.purpose}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe the purpose of this booking..."
                            className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none
                ${errors.purpose ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || conflictCheck === 'conflict'}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    {isEditMode ? 'Saving...' : 'Submitting...'}
                                </>
                            ) : (
                                isEditMode ? 'Save Changes' : 'Submit Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;