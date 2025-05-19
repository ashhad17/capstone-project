import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './use-toast';

interface Notification {
  _id: string;
  title: string;
  description: string;
  type: 'booking' | 'system' | 'message';
  read: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.data.notifications) {
        setNotifications(response.data.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));

      toast({
        title: 'Success',
        description: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications(notifications.filter(notification => notification._id !== id));
      toast({
        title: 'Success',
        description: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
}; 