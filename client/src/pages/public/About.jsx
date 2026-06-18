import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Cpu, ScanEye, CalendarClock, ShieldAlert, Award, Globe } from 'lucide-react';
import Card from '../../components/common/Card';

export const About = () => {
  const features = [
    {
      title: 'Automated CV Parser',
      description: 'Upload your resume in PDF or Word format. Our system extracts skills, contact details, and career history in seconds.',
      icon: ScanEye,
    },
    {
      title: 'Job Matcher Engine',
      description: 'Calculates a compatibility percentage ($60\\%$ skills, $25\\%$ experience, $15\\%$ education) dynamically on vacancy profile requirements.',
      icon: Cpu,
    },
    {
      title: 'Interview Scheduler',
      description: 'Allows employers to coordinate meetings with candidates, automatically sending email and panel alert links.',
      icon: CalendarClock,
    },
    {
      title: 'Role-Based Protections',
      description: 'Secure Candidate dashboard and Employer tools guarded by JWT authentication and middleware authorizations.',
      icon: ShieldAlert,
    },
    {
      title: 'Verified Employers',
      description: 'Admin audit checks for employer profiles before posting jobs prevents spam vacancies on the portal.',
      icon: Award,
    },
    {
      title: 'Global Analytics',
      description: 'Live charts detailing active candidate applications, featured jobs, and hiring milestones.',
      icon: Globe,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-12 py-4 text-left max-w-5xl mx-auto"
    >
      <Helmet>
        <title>About Us - JobPortal</title>
        <meta name="description" content="Learn about the mission, features, and technology stack powering our advanced job matching portal." />
      </Helmet>

      {/* Header section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Our Mission
        </h1>
        <p className="text-base text-slate-500 dark:text-dark-text-muted leading-relaxed">
          We aim to simplify the recruitment lifecycle. By combining instant resume text extraction with intelligent matching weights, we reduce friction and connect qualified candidates with top companies.
        </p>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Platform Capabilities</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
            Standardizing talent matching with these advanced engineering features.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <Card key={idx} className="p-6 border-slate-200">
              <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center dark:bg-primary-950/20 dark:text-primary-400 mb-4">
                <feat.icon size={22} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted leading-relaxed">
                {feat.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="p-8 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-dark-border dark:bg-slate-900/10 space-y-6">
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white text-center">Software Architecture</h3>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted text-center max-w-2xl mx-auto">
          The application is built using the robust MERN stack, delivering high security, pagination scaling, and reactive theme toggle structures.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-display font-semibold pt-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-dark-border">
            <p className="text-emerald-600 dark:text-emerald-400 text-lg">M</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">MongoDB Atlas</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-dark-border">
            <p className="text-slate-700 dark:text-slate-300 text-lg">E</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Express.js</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-dark-border">
            <p className="text-blue-500 dark:text-blue-400 text-lg">R</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">React 19 + Tailwind</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-dark-border">
            <p className="text-green-600 dark:text-green-400 text-lg">N</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Node.js 22</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
