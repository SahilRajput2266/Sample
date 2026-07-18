import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-xl font-bold text-blue-600">JobOrbit</div>
      </div>
      
      <div className="flex items-center gap-4">
        {user?.role === 'user' && <NotificationBell />}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline font-medium text-gray-700">{user?.fullName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
