import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Video,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCog,
  Leaf,
  BookOpen,
  Sparkles,
  Gamepad2,
  Upload,
} from "lucide-react";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Students", path: "/admin/students", icon: GraduationCap },
    { name: "Teachers", path: "/admin/teachers", icon: UserCog },
    { name: "Upload Video", path: "/admin/upload-video", icon: Upload },
    { name: "AI Videos", path: "/admin/ai-videos", icon: Video },
    {
      name: "Syllabus to Video",
      path: "/admin/syllabus-video",
      icon: Sparkles,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <NavLink
                to="/admin/dashboard"
                className="flex items-center space-x-2 group"
              >
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                  EcoLearn
                </span>
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive(item.path)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Right Side - User & Logout */}
            <div className="hidden md:flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {admin.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-gray-500 whitespace-nowrap">
                    {admin.schoolName || "EcoLearn"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="font-medium text-gray-700">
                    {admin.name || "Admin"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {admin.schoolName || "EcoLearn"}
                  </p>
                </div>
              </div>

              {/* Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}

              {/* Logout Mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 mt-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default AdminNavbar;
