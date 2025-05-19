import React from 'react';
import { 
  Bell, 
  Car, 
  User, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/context/ThemeContext';

const AdminNotifications = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const { isDark } = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-5 w-5 text-blue-500" />;
      case "car":
        return <Car className="h-5 w-5 text-green-500" />;
      case "provider":
        return <Settings className="h-5 w-5 text-purple-500" />;
      case "security":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "review":
        return <CheckCircle className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case "booking":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <Badge className="bg-red-500">{notifications.filter(n => !n.read).length}</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          className={isDark ? 'border-gray-700 hover:bg-gray-800' : ''}
        >
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <TabsTrigger value="all" className={isDark ? 'data-[state=active]:bg-gray-700' : ''}>
            All <Badge className={`ml-2 ${isDark ? 'bg-gray-600' : 'bg-gray-500'}`}>{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className={isDark ? 'data-[state=active]:bg-gray-700' : ''}>
            Unread <Badge className="ml-2 bg-red-500">{notifications.filter(n => !n.read).length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
              <div 
                key={notification._id}
                className={`p-4 border rounded-lg ${
                  isDark 
                    ? `${notification.read ? 'bg-gray-800 border-gray-700' : 'bg-blue-900/30 border-blue-800'}`
                    : `${notification.read ? 'bg-white' : 'bg-blue-50'}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{notification.title}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notification.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                          className={isDark ? 'border-gray-700 hover:bg-gray-800' : ''}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNotification(notification._id)}
                        className={`${
                          isDark 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className="text-lg font-medium mb-1">No notifications</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  You don't have any notifications at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-6">
          <div className="space-y-4">
            {notifications.filter(n => !n.read).length > 0 ? (
              notifications.filter(n => !n.read).map((notification) => (
              <div 
                key={notification._id}
                className={`p-4 border rounded-lg ${
                  isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{notification.title}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notification.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification._id)}
                        className={isDark ? 'border-gray-700 hover:bg-gray-800' : ''}
                      >
                        Mark as read
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNotification(notification._id)}
                        className={`${
                          isDark 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className="text-lg font-medium mb-1">No unread notifications</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  You don't have any unread notifications.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotifications;
