import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../../services/notificationService';

import NotificationPreferencesModal from './NotificationPreferencesModal';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPrefsOpen, setIsPrefsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col" style={{maxHeight: '400px'}}>
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    </div>
                    
                    <div className="overflow-y-auto grow">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-3 text-sm transition-colors ${!notification.read ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-slate-700 leading-snug">{notification.message}</p>
                                            {!notification.read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="shrink-0 text-indigo-600 hover:text-indigo-800"
                                                    title="Mark as read"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-slate-100 bg-white rounded-b-xl shrink-0 text-center">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                setIsPrefsOpen(true);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors w-full p-2"
                        >
                            Notification Settings
                        </button>
                    </div>
                </div>
            )}
            
            <NotificationPreferencesModal 
                isOpen={isPrefsOpen} 
                onClose={() => setIsPrefsOpen(false)} 
            />
        </div>
    );
};

export default NotificationDropdown;
