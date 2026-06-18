import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 py-12 dark:bg-slate-900 dark:border-dark-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-display font-extrabold text-lg">
                J
              </span>
              <span className="text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white">
                Job<span className="text-primary-600">Portal</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-dark-text-muted">
              Connecting qualified talent with world-class employers through automated profile-matching and direct interview workflows.
            </p>
          </div>

          {/* Links: Candidates */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 dark:text-white">For Candidates</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Register Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Candidate Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Employers */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 dark:text-white">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Post a Vacancy
                </Link>
              </li>
              <li>
                <Link to="/companies/list" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Talent Search
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Employer Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 dark:text-white">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-500 dark:text-dark-text-muted">
                <span className="font-medium">Support:</span> support@jobportal.com
              </li>
              <li>
                <Link to="/" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-500 hover:text-primary-600 dark:text-dark-text-muted dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between dark:border-dark-border">
          <p className="text-xs text-slate-400 dark:text-dark-text-muted">
            &copy; {currentYear} JobPortal System. All rights reserved. Built with MERN Stack.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
