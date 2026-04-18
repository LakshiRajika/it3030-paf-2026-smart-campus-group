import { useState, useEffect } from 'react';
import { facilityAPI } from '../../services/api';
import { message, Modal } from 'antd';
import { Building2, Plus, Edit3, Trash2, Users, MapPin, X } from 'lucide-react';

const types = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'AUDITORIUM', 'SPORTS_FACILITY', 'LIBRARY', 'STUDY_ROOM', 'OTHER'];

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const emptyForm = { name: '', description: '', location: '', building: '', floor: 0, capacity: 1, type: 'LECTURE_HALL', amenities: [], contactPerson: '', contactEmail: '', operatingHours: '', available: true };
  const [form, setForm] = useState(emptyForm);
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => { fetchFacilities(); }, []);

  const fetchFacilities = async () => {
    try { const res = await facilityAPI.getAll(); setFacilities(res.data.data || []); }
    catch { message.error('Failed to load facilities'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name, description: f.description || '', location: f.location, building: f.building || '', floor: f.floor || 0, capacity: f.capacity, type: f.type, amenities: f.amenities || [], contactPerson: f.contactPerson || '', contactEmail: f.contactEmail || '', operatingHours: f.operatingHours || '', available: f.available });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.capacity < 1) e.capacity = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) { await facilityAPI.update(editing.id, form); message.success('Facility updated'); }
      else { await facilityAPI.create(form); message.success('Facility created'); }
      setShowModal(false);
      fetchFacilities();
    } catch (err) { message.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Facility', content: 'This cannot be undone.', okText: 'Delete', okButtonProps: { danger: true },
      onOk: async () => {
        try { await facilityAPI.delete(id); message.success('Facility deleted'); fetchFacilities(); }
        catch { message.error('Failed to delete'); }
      }
    });
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
      setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Manage Facilities</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={18} /> Add Facility</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map(f => (
          <div key={f.id} className="card-glass">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-primary-600" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors"><Edit3 size={15} className="text-primary-600" /></button>
                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={15} className="text-red-500" /></button>
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">{f.name}</h3>
            <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">{f.description}</p>
            <div className="space-y-1 text-[11px] text-gray-500">
              <p className="flex items-center gap-1"><MapPin size={12} /> {f.location}</p>
              <p className="flex items-center gap-1"><Users size={12} /> Capacity: {f.capacity}</p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100">
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{f.type?.replace('_', ' ')}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${f.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {f.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary-900">{editing ? 'Edit Facility' : 'Add Facility'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`}
                  placeholder="Facility name" />
                {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Location *</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.location ? 'border-red-400' : 'border-purple-200'} focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm`} />
                {errors.location && <p className="text-red-500 text-[11px]">{errors.location}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Building</label>
                  <input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Floor</label>
                  <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Capacity *</label>
                  <input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.capacity ? 'border-red-400' : 'border-purple-200'} text-sm`} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm bg-white">
                    {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Operating Hours</label>
                  <input value={form.operatingHours} onChange={e => setForm({ ...form, operatingHours: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm" placeholder="8AM - 6PM" /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Amenities</label>
                <div className="flex gap-2">
                  <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="flex-1 px-3 py-2 rounded-xl border border-purple-200 text-sm" placeholder="Add amenity" />
                  <button type="button" onClick={addAmenity} className="btn-secondary px-3 text-xs">Add</button>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {form.amenities.map(a => (
                    <span key={a} className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                      {a} <button onClick={() => setForm({ ...form, amenities: form.amenities.filter(x => x !== a) })}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600">Available:</label>
                <button onClick={() => setForm({ ...form, available: !form.available })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.available ? 'left-6' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-purple-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
