import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🎉 Resume parsed: 12 skills identified successfully!', read: false, time: '2 hours ago' },
    { id: 2, text: '💼 Indeed: 4 new matches found for React Developer', read: false, time: '4 hours ago' },
    { id: 3, text: '📊 Market trend update: demand for spaCy has risen by 15%', read: true, time: 'Yesterday' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
