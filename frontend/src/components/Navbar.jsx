import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <span className="text-xl font-bold text-brand-600 tracking-tight">TeamFlow</span>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive ? 'border-brand-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`
                }
              >
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </NavLink>
              <NavLink 
                to="/projects" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive ? 'border-brand-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`
                }
              >
                <FolderKanban className="w-4 h-4 mr-2" /> Projects
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-slate-500">Welcome, </span>
                <span className="font-semibold text-slate-900">{user.name}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
