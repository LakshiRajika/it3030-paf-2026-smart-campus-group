import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { message } from 'antd';
import { notificationAPI } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const typeColors = {
  BOOKING_APPROVED: 'bg-green-100 text-green-700',
  BOOKING_REJECTED: 'bg-red-100 text-red-700',
  TICKET_CREATED: 'bg-blue-100 text-blue-700',
  TICKET_UPDATED: 'bg-yellow-100 text-yellow-700',
  TICKET_ASSIGNED: 'bg-purple-100 text-purple-700',
  TICKET_RESOLVED: 'bg-green-100 text-green-700',
  NEW_COMMENT: 'bg-indigo-100 text-indigo-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef();
  const panelRef = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data.data?.count || 0);
    } catch { }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.data?.count || 0);
    } catch { }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch { }
  };

  const deleteNotif = async (id) => {
    try {
      await notificationAPI.delete(id);
      const n = notifications.find(x => x.id === id);
      setNotifications(prev => prev.filter(x => x.id !== id));
      if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  };

  return (
    <div className="relative z-[9999]" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl hover:bg-primary-100 transition-colors">
        <Bell size={22} className="text-primary-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed right-6 top-20 w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-purple-100 z-[10050] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-purple-100 bg-primary-50">
            <h3 className="font-semibold text-primary-900 text-sm">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div key={n.id} className={`px-5 py-3 border-b border-purple-50 flex gap-3 items-start group hover:bg-purple-50/50 transition-colors ${n.read ? '' : 'bg-primary-50/60'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge-status text-[10px] ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>
                        {n.type?.replaceAll('_', ' ')}
                      </span>
                      {!n.read && <span className="w-2 h-2 bg-accent-orange rounded-full"></span>}
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{dayjs(n.createdAt).fromNow()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} className="p-1 rounded hover:bg-green-100"><Check size={14} className="text-green-600" /></button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
