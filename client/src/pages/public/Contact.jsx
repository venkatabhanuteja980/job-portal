import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    
    // Simulate API delivery
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-12 py-4 text-left max-w-6xl mx-auto"
    >
      <Helmet>
        <title>Contact Us - JobPortal</title>
        <meta name="description" content="Send us a message if you have questions or feedback about the portal." />
      </Helmet>

      {/* Header */}
      <section className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Get In Touch
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted">
          Have questions or platform feedback? Reach out and we will respond within 24 hours.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="space-y-4 md:col-span-1">
          {[
            { label: 'Email Us', info: 'support@jobportal.com', desc: 'Queries or platform feedback', icon: Mail },
            { label: 'Call Us', info: '+91 (080) 1234-5678', desc: 'Monday - Friday, 9am - 6pm IST', icon: Phone },
            { label: 'Office HQ', info: 'Bangalore, Karnataka, India', desc: 'Tech Park, Whitefield Area', icon: MapPin },
          ].map((item, idx) => (
            <Card key={idx} className="p-5 border-slate-200">
              <div className="flex gap-4">
                <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center dark:bg-primary-950/20 dark:text-primary-400 shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-300 font-semibold mt-1">{item.info}</p>
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Message Form Card */}
        <div className="md:col-span-2">
          <Card title="Send a Message" className="border-slate-200">
            {success ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-3"
              >
                <CheckCircle2 size={48} className="text-emerald-600" />
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Message Delivered</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm dark:text-dark-text-muted">
                  Thank you! Your message was sent successfully. We will get back to you shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSuccess(false)} className="mt-2">
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="John Smith"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="john.smith@example.com"
                  />
                </div>
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  placeholder="Feature request or bug report"
                />
                
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">
                    Message Body
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 transition-colors focus:outline-none ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-slate-300 dark:border-dark-border focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
                    }`}
                    placeholder="Type details of your request here..."
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.message}</p>
                  )}
                </div>

                <div className="pt-2 text-right">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    icon={Send}
                    className="w-full sm:w-auto"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
