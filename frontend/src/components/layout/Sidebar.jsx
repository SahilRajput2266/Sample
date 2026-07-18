import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, X, UserRound, Sparkles, BriefcaseBusiness, GraduationCap, Award, Languages, FileText, Search, SlidersHorizontal, Bookmark, ClipboardList, Columns3, BarChart3, BrainCircuit, Bot, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const links = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', show: true },
    { to: '/jobs', icon: <Search className="w-5 h-5" />, label: 'Find Jobs', show: user?.role === 'user' },
    { to: '/saved-jobs', icon: <Bookmark className="w-5 h-5" />, label: 'Saved Jobs', show: user?.role === 'user' },
    { to: '/job-preferences', icon: <SlidersHorizontal className="w-5 h-5" />, label: 'Job Preferences', show: user?.role === 'user' },
    { to: '/applications', icon: <ClipboardList className="w-5 h-5" />, label: 'Applications', show: user?.role === 'user' },
    { to: '/applications/kanban', icon: <Columns3 className="w-5 h-5" />, label: 'Application Board', show: user?.role === 'user' },
    { to: '/applications/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'ATS Analytics', show: user?.role === 'user' },
    { to: '/ai', icon: <BrainCircuit className="w-5 h-5" />, label: 'AI Tools', show: user?.role === 'user' },
    { to: '/automation', icon: <Bot className="w-5 h-5" />, label: 'Safe Auto-Apply', show: user?.role === 'user' },
    { to: '/profile', icon: <UserRound className="w-5 h-5" />, label: 'Profile', show: user?.role === 'user' },
    { to: '/profile/skills', icon: <Sparkles className="w-5 h-5" />, label: 'Skills', show: user?.role === 'user' },
    { to: '/profile/experience', icon: <BriefcaseBusiness className="w-5 h-5" />, label: 'Experience', show: user?.role === 'user' },
    { to: '/profile/education', icon: <GraduationCap className="w-5 h-5" />, label: 'Education', show: user?.role === 'user' },
    { to: '/profile/certifications', icon: <Award className="w-5 h-5" />, label: 'Certifications', show: user?.role === 'user' },
    { to: '/profile/languages', icon: <Languages className="w-5 h-5" />, label: 'Languages', show: user?.role === 'user' },
    { to: '/profile/resume', icon: <FileText className="w-5 h-5" />, label: 'Resumes', show: user?.role === 'user' },
    { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', show: user?.role === 'user' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', show: user?.role === 'user' },
    { to: '/admin', icon: <Settings className="w-5 h-5" />, label: 'Admin Dashboard', show: user?.role === 'admin' },
    { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Manage Users', show: user?.role === 'admin' },
    { to: '/admin/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notification Monitor', show: user?.role === 'admin' },
    { to: '/admin/scheduler', icon: <Bell className="w-5 h-5" />, label: 'Scheduler Monitor', show: user?.role === 'admin' },
    { to: '/admin/automation', icon: <Bot className="w-5 h-5" />, label: 'Automation Monitor', show: user?.role === 'admin' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex justify-between items-center md:hidden border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">Menu</span>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.filter(link => link.show).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { if (isOpen) toggleSidebar(); }}
              end={link.to === '/admin'} // Exact match for admin root
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
