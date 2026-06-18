import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

export const ProfileCompletionBar = ({
  percentage = 0,
  profile = null,
}) => {
  // Items checklist and their weights matching backend profileCompletion calculation
  const getChecklist = () => {
    if (!profile) return [];
    
    return [
      { name: 'Full Name', completed: true, weight: 10 }, // Handled during user registration
      { name: 'Phone number', completed: !!profile.phone, weight: 5 },
      { name: 'Headline summary', completed: !!profile.headline, weight: 10 },
      { name: 'Skills tag list', completed: (profile.skills?.length > 0 || profile.customSkills?.length > 0), weight: 15 },
      { name: 'Work Experience', completed: profile.experience?.length > 0, weight: 20 },
      { name: 'Education history', completed: profile.education?.length > 0, weight: 15 },
      { name: 'Resume uploaded', completed: !!profile.resumeUrl, weight: 15 },
    ];
  };

  const checklist = getChecklist();

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Strength</span>
        <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
        />
      </div>

      {/* Checklist recommendations */}
      {percentage < 100 && (
        <div className="pt-2 space-y-2.5">
          <p className="text-xs text-slate-500 dark:text-dark-text-muted">
            Complete these items to strengthen your profile visibility:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {checklist.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-2 ${
                  item.completed
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-350'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={14} className="text-slate-300 dark:text-dark-border shrink-0" />
                )}
                <span>
                  {item.name} <span className="text-[10px] text-slate-400 font-semibold">(+{item.weight}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
