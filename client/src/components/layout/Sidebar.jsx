import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User as UserIcon,
  Briefcase,
  Bookmark,
  Building,
  PlusCircle,
  Users,
  FileText,
  AlertTriangle,
  Grid,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  // Retrieve configuration lists based on role type
  const getSidebarLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Employer Approvals', path: '/admin/employers', icon: FileText },
          { name: 'Jobs Moderation', path: '/admin/jobs', icon: Briefcase },
          { name: 'Report Tickets', path: '/admin/reports', icon: AlertTriangle },
          { name: 'Categories', path: '/admin/categories', icon: Grid },
          { name: 'Skills List', path: '/admin/skills', icon: Award },
          { name: 'System Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'employer':
        return [
          { name: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
          { name: 'Company Profile', path: '/employer/company', icon: Building },
          { name: 'Post Job', path: '/employer/jobs/new', icon: PlusCircle },
          { name: 'My Jobs', path: '/employer/jobs', icon: Briefcase },
          { name: 'Settings', path: '/employer/settings', icon: Settings },
        ];
      case 'candidate':
      default:
        return [
          { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
          { name: 'My Profile', path: '/candidate/profile', icon: UserIcon },
          { name: 'My Applications', path: '/candidate/applications', icon: Briefcase },
          { name: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
          { name: 'Settings', path: '/candidate/settings', icon: Settings },
        ];
    }
  };

  const links = getSidebarLinks();

  const sidebarVariants = {
    expanded: { width: '260px' },
    collapsed: { width: '80px' },
  };

  return (
    <motion.aside
      initial={isCollapsed ? 'collapsed' : 'expanded'}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-[calc(100vh-64px)] border-r border-slate-200 bg-white sticky top-16 left-0 z-30 dark:border-dark-border dark:bg-slate-900"
    >
      {/* Navigation Links Area */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-dark-text-muted dark:hover:bg-dark-card dark:hover:text-white'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="truncate transition-opacity duration-200">{link.name}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100 transition-all duration-100 shadow-md whitespace-nowrap z-50 dark:bg-slate-800">
                  {link.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Drawer Toggle Bar */}
      <div className="p-3 border-t border-slate-100 flex justify-end dark:border-dark-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all focus:outline-none dark:border-dark-border dark:bg-slate-800 dark:text-dark-text-muted dark:hover:text-white dark:hover:bg-slate-700"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
