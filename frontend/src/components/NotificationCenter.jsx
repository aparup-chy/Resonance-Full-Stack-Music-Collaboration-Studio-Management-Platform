import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Fetch notifications every 10 seconds for real-time updates
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all/read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative text-white hover:text-gray-300 transition-colors px-4 py-2"
        aria-label="Notifications"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="notification-panel fixed right-4 top-16 w-96 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 z-40 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-black/95 backdrop-blur-md p-4 border-b border-white/30 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-white/20">
            {loading ? (
              <div className="p-4 text-center text-white/60">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-white/60">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    notification.read
                      ? 'bg-black/50 hover:bg-black/70'
                      : 'bg-blue-500/10 hover:bg-blue-500/20'
                  }`}
                >
                  <p className="text-white text-sm leading-relaxed">
                    <span className="font-semibold text-blue-400">{notification.actor?.name}</span>
                    {' '}
                    {notification.message}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close panel */}
      {showPanel && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
