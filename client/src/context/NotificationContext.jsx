import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  const fetchNotifications = async () => {
    if (!user || !user.token) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(resData.data);
        setUnreadCount(resData.data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Connect to WebSocket Server
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Socket.io connected to server');
    });

    socket.on('new_notification', (notification) => {
      // Check if notification is general or target to this user
      if (!notification.user || notification.user === user._id) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Optional: Trigger system browser notification
        if (window.Notification && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '🌱',
          });
        }
      }
    });

    // Request browser notification permissions
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markNotificationAsRead = async (id) => {
    if (!user || !user.token) return;
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user || !user.token) return;
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
