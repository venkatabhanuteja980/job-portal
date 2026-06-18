import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { logoutSuccess } from '../../store/authSlice';
import authApi from '../../api/authApi';
import ThemeToggle from '../common/ThemeToggle';
import Avatar from '../common/Avatar';
import NotificationBell from '../common/NotificationBell';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // BUG-001 Fix: Call server logout first to invalidate the refresh token cookie
  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* best-effort — clear client state regardless */ }
    dispatch(logoutSuccess());
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'employer') return '/employer';
    return '/candidate';
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Find Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies/list' }, // Will resolve to list
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-dark-border dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-md shadow-primary-600/20">
                J
              </span>
              <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                Job<span className="text-primary-600">Portal</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-950/20 dark:text-primary-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-dark-text-muted dark:hover:text-white dark:hover:bg-dark-card'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <ThemeToggle />

            {isAuthenticated ? (
              /* User Authenticated Dropdown */
              <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <Avatar name={user.fullName} url={user.avatar?.url} size="sm" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-md focus:outline-none dark:border-dark-border dark:bg-slate-800">
                    <div className="px-3 py-2 text-xs border-b border-slate-100 dark:border-dark-border">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-slate-500 dark:text-dark-text-muted truncate capitalize">{user.role}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-all dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-950/20"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md shadow-primary-600/10 hover:shadow-primary-600/20 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none dark:text-dark-text-muted dark:hover:text-white dark:hover:bg-dark-card"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white py-2 px-4 space-y-1 shadow-inner dark:border-dark-border dark:bg-slate-900">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                isActive(link.path)
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-dark-text-muted dark:hover:text-white dark:hover:bg-dark-card'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-2 pb-1 dark:border-dark-border">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center gap-3">
                  <Avatar name={user.fullName} url={user.avatar?.url} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted capitalize">{user.role}</p>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md dark:text-dark-text-muted dark:hover:text-white dark:hover:bg-dark-card"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-950/10"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center px-4 py-2 text-center text-sm font-semibold text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center px-4 py-2 text-center text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
