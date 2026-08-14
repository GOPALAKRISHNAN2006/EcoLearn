import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, Award, BookOpen, Users, Mail, Globe, Camera, Gamepad2, Brain, LogOut, Trophy, User, Upload, Shield, BarChart3, AlertTriangle, School, Settings, FileCheck, ClipboardCheck, Target, Gift } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navigation = ({ userType = null, onLogout = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in based on current route
  const isLoggedIn = location.pathname.includes('dashboard') || userType;
  const currentUserType = userType || (location.pathname.includes('student') ? 'student' : location.pathname.includes('teacher') ? 'teacher' : location.pathname.includes('admin') ? 'admin' : null);

  // Default navigation items (for non-logged in users)
  const defaultNavItems = [
    { name: "Home", path: "/", icon: Leaf },
    { name: "Features", path: "/features", icon: Award },
    { name: "About", path: "/about", icon: BookOpen },
    { name: "Contact", path: "/contact", icon: Mail },
    { name: "Explore Nature", path: "/explore-nature", icon: Camera },
  ];

  // Student navigation items - organized in groups
  const studentNavItems = [
    { name: "Dashboard", path: "/student-dashboard", icon: Leaf, group: "main" },
    { name: "Games", path: "/student/games", icon: Gamepad2, group: "learning" },
    { name: "Lessons", path: "/student/lessons", icon: BookOpen, group: "learning" },
    { name: "Upload", path: "/student/upload-assignment", icon: Upload, group: "learning" },
    { name: "AI", path: "/student/ai", icon: Brain, group: "explore" },
    { name: "Profile", path: "/student/profile", icon: User, group: "account" },
    { name: "Leaderboard", path: "/student/leaderboard", icon: Trophy, group: "account" },
    { name: "Achievements", path: "/student/achievements", icon: Target, group: "account" },
  ];

  // Teacher navigation items
  const teacherNavItems = [
    { name: "Dashboard", path: "/teacher-dashboard", icon: Leaf, group: "main" },
    { name: "Classes", path: "/teacher/classes", icon: Users, group: "management" },
    { name: "Students", path: "/teacher/students", icon: User, group: "management" },
    { name: "Assignments", path: "/teacher/assignments", icon: BookOpen, group: "content" },
    { name: "Analytics", path: "/teacher/analytics", icon: Award, group: "insights" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: "Users", path: "/admin/users", icon: Users, group: "management" },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3, group: "insights" },
    { name: "Moderation", path: "/admin/moderation", icon: AlertTriangle, group: "management" },
    { name: "Settings", path: "/admin/settings", icon: Settings, group: "system" },
  ];

  // Choose navigation items based on user type
  const getNavItems = () => {
    if (currentUserType === 'student') return studentNavItems;
    if (currentUserType === 'teacher') return teacherNavItems;
    if (currentUserType === 'admin') return adminNavItems;
    return defaultNavItems;
  };

  const navItems = getNavItems();

  // Helper function to get display name
  const getDisplayName = (item, isMobile = false) => {
    if (item.name === 'Upload') {
      return isMobile ? 'Upload Assignment' : item.name;
    }
    return item.name;
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior - navigate to home
      navigate('/');
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}
      
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md border-b border-gray-800 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Fixed width to prevent shifting */}
          <div className="flex-shrink-0">
            <NavLink 
              to={
                currentUserType === 'student' ? '/student-dashboard' :
                currentUserType === 'teacher' ? '/teacher-dashboard' :
                currentUserType === 'admin' ? '/admin/users' :
                '/'
              } 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-105">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                EcoLearn
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation - Centered and responsive */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-2 lg:mx-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-xs lg:text-sm whitespace-nowrap flex-shrink-0 ${
                      isActive 
                        ? "text-emerald-400 font-medium bg-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                        : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.name.slice(0, 4)}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side - Language Switcher & Auth button */}
          <div className="flex-shrink-0 flex items-center space-x-2 lg:space-x-3">
            {/* Language Switcher - Desktop */}
            <div className="hidden lg:block">
              <LanguageSwitcher variant="minimal" />
            </div>
            
            {/* Desktop Auth Button */}
            <div className="hidden lg:block">
              {isLoggedIn ? (
                <Button 
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/30" 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  <span className="hidden lg:inline">Get Started</span>
                  <span className="lg:hidden text-xs">Login</span>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="hover:bg-gray-800 text-gray-400 h-9 w-9"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-16 bg-slate-900 border-b border-gray-800 shadow-2xl max-w-full overflow-x-hidden z-40">
            <div className="px-3 sm:px-4 py-3 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin">
              {currentUserType === 'student' ? (
                // Grouped navigation for students
                <>
                  {/* Main */}
                  {navItems.filter(item => item.group === 'main').map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? "text-emerald-400 font-medium bg-emerald-500/20" 
                            : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{getDisplayName(item, true)}</span>
                    </NavLink>
                  ))}
                  
                  {/* Learning Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Learning
                    </div>
                    {navItems.filter(item => item.group === 'learning').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* Explore Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Explore
                    </div>
                    {navItems.filter(item => item.group === 'explore').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* Account Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account
                    </div>
                    {navItems.filter(item => item.group === 'account').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : currentUserType === 'teacher' ? (
                // Grouped navigation for teachers
                <>
                  {/* Main */}
                  {navItems.filter(item => item.group === 'main').map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? "text-emerald-400 font-medium bg-emerald-500/20" 
                            : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{getDisplayName(item, true)}</span>
                    </NavLink>
                  ))}
                  
                  {/* Management Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Management
                    </div>
                    {navItems.filter(item => item.group === 'management').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* Content Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Content
                    </div>
                    {navItems.filter(item => item.group === 'content').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* Insights Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Insights
                    </div>
                    {navItems.filter(item => item.group === 'insights').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : currentUserType === 'admin' ? (
                // Grouped navigation for admins
                <>
                  {/* Management Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Management
                    </div>
                    {navItems.filter(item => item.group === 'management').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* Insights Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Insights
                    </div>
                    {navItems.filter(item => item.group === 'insights').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>

                  {/* System Section */}
                  <div className="pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      System
                    </div>
                    {navItems.filter(item => item.group === 'system').map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? "text-emerald-400 font-medium bg-emerald-500/20" 
                              : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{getDisplayName(item, true)}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                // Regular navigation for other user types
                navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "text-emerald-400 font-medium bg-emerald-500/20" 
                          : "text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{getDisplayName(item, true)}</span>
                  </NavLink>
                ))
              )}
              
              {/* Mobile Auth Button */}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                {/* Language Switcher - Mobile */}
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-gray-400 text-sm">Language</span>
                  <LanguageSwitcher variant="minimal" />
                </div>
                
                {isLoggedIn ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white justify-start shadow-lg shadow-red-500/30" 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white justify-start shadow-lg shadow-emerald-500/30" 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navigation;