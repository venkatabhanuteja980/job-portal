import React from 'react';
import Card from '../common/Card';

export const StatsCard = ({ title, value, icon: Icon, trend = null, trendType = 'neutral', color = 'primary' }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'primary': return 'text-primary-600 bg-primary-50 dark:bg-primary-950/20 dark:text-primary-400';
      case 'success': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'warning': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400';
      case 'danger': return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400';
      case 'info': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getTrendClasses = (type) => {
    switch (type) {
      case 'up': return 'text-emerald-600 dark:text-emerald-500';
      case 'down': return 'text-rose-600 dark:text-rose-500';
      default: return 'text-slate-450 dark:text-dark-text-muted';
    }
  };

  return (
    <Card className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 flex items-center justify-between text-left">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <h3 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white leading-none">
          {value}
        </h3>
        {trend && (
          <p className={`text-[11px] font-semibold flex items-center gap-0.5 ${getTrendClasses(trendType)}`}>
            {trend}
          </p>
        )}
      </div>
      
      <div className={`p-4 rounded-xl shrink-0 ${getColorClasses(color)}`}>
        {Icon && <Icon size={24} />}
      </div>
    </Card>
  );
};

export default StatsCard;
