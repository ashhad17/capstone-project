import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useScrollPosition, useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X, Bell, User, LogOut, Settings, Car, Sun, Moon, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";

const Navbar = () => {
  const scrolled = useScrollPosition(50);
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to check if a route is active (exact match or sub-route)
  const isRouteActive = (route: string) => {
    if (route === "/cars/buy") {
      return pathname === "/cars/buy" || pathname.startsWith("/cars/details");
    }
    if (route === "/cars/sell") {
      return pathname === "/cars/sell";
    }
    return pathname === route;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background border-b shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary mr-2">
                Wheels<span className="text-secondary">Trust</span>
              </span>
            </Link>

            <nav className="ml-8 hidden md:flex space-x-6">
              <Link
                to="/cars/buy"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/cars/buy") ? "text-primary" : "text-foreground"
                }`}
              >
                Buy Cars
              </Link>
              <Link
                to="/cars/sell"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/cars/sell") ? "text-primary" : "text-foreground"
                }`}
              >
                Sell Car
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/services") ? "text-primary" : "text-foreground"
                }`}
              >
                Services
              </Link>
              <Link
                to="/service-providers"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/service-providers") ? "text-primary" : "text-foreground"
                }`}
              >
                Service Providers
              </Link>
              <Link
                to="/find-your-car"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/find-your-car") ? "text-primary" : "text-foreground"
                }`}
              >
                Find Your Car
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/about") ? "text-primary" : "text-foreground"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isRouteActive("/contact") ? "text-primary" : "text-foreground"
                }`}
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Mobile Menu Button - Now using Sheet component for sidebar */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 p-2"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[350px]">
                <SheetHeader className="mb-5">
                  <SheetTitle className="text-left">
                    <Link to="/" className="flex items-center">
                      <span className="text-xl font-bold text-primary">
                        Wheels<span className="text-secondary">Trust</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3">
                  <SheetClose asChild>
                    <Link
                      to="/cars/buy"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Buy Cars
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/cars/sell"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Sell Car
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/services"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Services
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/service-providers"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Service Providers
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/find-your-car"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Find Your Car
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/about"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      About
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/contact"
                      className="text-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      Contact Us
                    </Link>
                  </SheetClose>
                  
                  <div className="border-t pt-4 mt-4">
                    {isAuthenticated ? (
                      <>
                        <SheetClose asChild>
                          <Link 
                            to="/profile" 
                            className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link 
                            to="/notifications" 
                            className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                          </Link>
                        </SheetClose>
                        {user?.role === 'admin' && (
                          <SheetClose asChild>
                            <Link 
                              to="/admin-dashboard" 
                              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          </SheetClose>
                        )}
                        {user?.role === 'service_provider' && (
                          <SheetClose asChild>
                            <Link 
                              to="/service-provider-dashboard" 
                              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Provider Dashboard
                            </Link>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </SheetClose>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Button 
                            onClick={handleLogin}
                            variant="outline"
                            className="w-full"
                          >
                            Login
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button 
                            onClick={handleSignUp}
                            className="w-full"
                          >
                            Sign Up
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full glow-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated && (
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.avatar || ""}
                          alt={user?.name || "User avatar"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    
                    {user?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role === 'service_provider' && (
                      <DropdownMenuItem onClick={() => navigate('/service-provider-dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Provider Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="transition-colors hover-scale"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignUp}
                  variant="glow"
                  className="hover-scale"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
