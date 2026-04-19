import React, { useState, useEffect } from 'react';
import { updatePreferences } from '../../services/notificationService';
import api from '../../services/api';

const NotificationPreferencesModal = ({ isOpen, onClose }) => {
    const [preferences, setPreferences] = useState({
        bookingNotifications: true,
        ticketStatusNotifications: true,
        commentNotifications: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch current user details to get preferences
            // Normally this could come from AuthContext user object if updated
            api.get('/users/me').then(res => {
                if (res.data.notificationPreferences) {
                    setPreferences(res.data.notificationPreferences);
                }
            }).catch(console.error);
        }
    }, [isOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updatePreferences(preferences);
            onClose();
        } catch (error) {
            console.error('Failed to update preferences', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden ring-1 ring-slate-200">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Notification Preferences</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Booking Status</span>
                            <span className="block text-xs text-slate-500">Receive alerts when bookings are approved or rejected</span>
                        </div>
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-indigo-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={preferences.bookingNotifications}
                            onChange={(e) => setPreferences({ ...preferences, bookingNotifications: e.target.checked })}
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Ticket Status</span>
                            <span className="block text-xs text-slate-500">Receive alerts when ticket status changes</span>
                        </div>
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-indigo-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={preferences.ticketStatusNotifications}
                            onChange={(e) => setPreferences({ ...preferences, ticketStatusNotifications: e.target.checked })}
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Ticket Comments</span>
                            <span className="block text-xs text-slate-500">Receive alerts when new comments are added to your ticket</span>
                        </div>
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-indigo-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={preferences.commentNotifications}
                            onChange={(e) => setPreferences({ ...preferences, commentNotifications: e.target.checked })}
                        />
                    </label>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferencesModal;
