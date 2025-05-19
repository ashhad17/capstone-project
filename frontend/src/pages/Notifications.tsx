import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Car, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "booking":
        return <Car className="h-5 w-5 text-green-600" />;
      case "system":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getNotificationBackground = (type: string, read: boolean) => {
    if (read) return isDark ? "bg-gray-800" : "bg-gray-50";
    
    switch (type) {
      case "message":
        return isDark ? "bg-blue-900/20" : "bg-blue-50";
      case "booking":
        return isDark ? "bg-green-900/20" : "bg-green-50";
      case "system":
        return isDark ? "bg-purple-900/20" : "bg-purple-50";
      default:
        return isDark ? "bg-gray-800" : "bg-gray-50";
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
  
  if (!isAuthenticated) {
    return null; // Will be redirected
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-white' : 'border-primary'}`}></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notifications | WheelsTrust</title>
      </Helmet>
      
      <Navbar />
      
      <main className={`pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bell className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-primary'}`} />
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={notifications.length === 0}
              >
                Mark All as Read
              </Button>
            </div>
            
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    className={`p-4 flex gap-4 items-start ${getNotificationBackground(notification.type, notification.read)}`}
                  >
                    <div className={`rounded-full p-2 ${
                      notification.read 
                        ? isDark ? 'bg-gray-700' : 'bg-gray-100'
                        : notification.type === 'message' 
                          ? isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                          : notification.type === 'booking' 
                            ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                            : isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notification.title}</h4>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(notification.createdAt)}</span>
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsRead(notification._id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className={`${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                          onClick={() => deleteNotification(notification._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Bell className={`h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
                  <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No notifications</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>You don't have any notifications at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Notifications;
