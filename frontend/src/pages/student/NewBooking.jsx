import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI, bookingAPI } from '../../services/api';
import { message } from 'antd';
import { Building2, CalendarDays, Users, FileText, Clock, MapPin, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function NewBooking() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    facilityId: '', purpose: '', description: '', expectedAttendees: 1,
    startTime: '', endTime: '', recurring: false, recurrencePattern: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await facilityAPI.getAvailable();
        setFacilities(res.data.data || []);
      } catch { message.error('Failed to load facilities'); } finally { setLoading(false); }
    };
    load();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.facilityId) e.facilityId = 'Please select a facility';
    if (!form.purpose.trim()) e.purpose = 'Purpose is required';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime))
      e.endTime = 'End time must be after start time';
    if (form.startTime && new Date(form.startTime) < new Date())
      e.startTime = 'Cannot book for past dates';
    if (form.expectedAttendees < 1) e.expectedAttendees = 'At least 1 attendee';
    if (selectedFacility && form.expectedAttendees > selectedFacility.capacity)
      e.expectedAttendees = `Exceeds capacity (${selectedFacility.capacity})`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { message.warning('Please fix validation errors'); return; }
    setSubmitting(true);
    try {
      await bookingAPI.create({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
      message.success('Booking request submitted successfully!');
      navigate('/dashboard/bookings');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create booking');
    } finally { setSubmitting(false); }
  };

  const selectFacility = (f) => {
    setSelectedFacility(f);
    setForm({ ...form, facilityId: f.id });
    setErrors({ ...errors, facilityId: undefined });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="page-title">New Booking</h1>

      {/* Facility Selection */}
      <div className="card-glass">
        <h3 className="font-semibold text-primary-900 mb-3">Select Facility</h3>
        {errors.facilityId && <p className="text-red-500 text-xs mb-2">{errors.facilityId}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
          {facilities.map(f => (
            <button key={f.id} onClick={() => selectFacility(f)}
              className={`p-4 rounded-xl text-left transition-all border-2 ${selectedFacility?.id === f.id
                ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-purple-100 hover:border-primary-300 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <Building2 size={18} className={selectedFacility?.id === f.id ? 'text-primary-600' : 'text-gray-400'} />
                {selectedFacility?.id === f.id && <CheckCircle size={18} className="text-primary-600" />}
              </div>
              <h4 className="text-sm font-semibold text-gray-800">{f.name}</h4>
              <p className="text-[11px] text-gray-500">{f.location}</p>
              <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                <span><Users size={10} className="inline" /> {f.capacity}</span>
                <span>{f.type?.replace('_', ' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="card-glass space-y-4">
        <h3 className="font-semibold text-primary-900 mb-1">Booking Details</h3>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Purpose <span className="text-red-400">*</span></label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.purpose ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`}
              placeholder="e.g., Workshop, Lecture, Meeting" />
          </div>
          {errors.purpose && <p className="text-red-500 text-[11px] mt-0.5">{errors.purpose}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm resize-none"
            placeholder="Additional details about the booking..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Expected Attendees <span className="text-red-400">*</span></label>
            <div className="relative">
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" min={1} value={form.expectedAttendees}
                onChange={e => setForm({ ...form, expectedAttendees: parseInt(e.target.value) || 1 })}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.expectedAttendees ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`} />
            </div>
            {errors.expectedAttendees && <p className="text-red-500 text-[11px] mt-0.5">{errors.expectedAttendees}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Start Time <span className="text-red-400">*</span></label>
            <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.startTime ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`} />
            {errors.startTime && <p className="text-red-500 text-[11px] mt-0.5">{errors.startTime}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">End Time <span className="text-red-400">*</span></label>
            <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.endTime ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`} />
            {errors.endTime && <p className="text-red-500 text-[11px] mt-0.5">{errors.endTime}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button type="button" onClick={() => navigate('/dashboard/bookings')} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
