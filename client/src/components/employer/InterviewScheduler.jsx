import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';

export const InterviewScheduler = ({
  isOpen,
  onClose,
  onSubmit,
  application = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    type: 'video',
    meetingLink: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        scheduledDate: '',
        scheduledTime: '',
        type: 'video',
        meetingLink: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required';
    if (!formData.type) newErrors.type = 'Format type is required';

    if (formData.scheduledDate) {
      const selected = new Date(`${formData.scheduledDate}T${formData.scheduledTime || '00:00'}`);
      if (selected < new Date()) {
        newErrors.scheduledDate = 'Interview time cannot be in the past';
      }
    }

    if (formData.type === 'video' && formData.meetingLink) {
      // Basic URL verification if provided
      if (formData.meetingLink.length > 0 && !formData.meetingLink.includes('.') ) {
        newErrors.meetingLink = 'Please provide a valid meeting URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(application._id, formData);
  };

  const types = [
    { value: 'video', label: 'Video Call (e.g. Google Meet, Zoom)' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'onsite', label: 'In-person / Onsite Interview' },
  ];

  const candidateName = application?.candidate
    ? `${application.candidate.firstName || ''} ${application.candidate.lastName || ''}`.trim()
    : 'Candidate';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview for ${candidateName}`}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Interview Date *"
            name="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={handleChange}
            error={errors.scheduledDate}
            icon={<Calendar size={16} />}
            required
          />

          <Input
            label="Interview Time *"
            name="scheduledTime"
            type="time"
            value={formData.scheduledTime}
            onChange={handleChange}
            error={errors.scheduledTime}
            icon={<Clock size={16} />}
            required
          />
        </div>

        <Select
          label="Interview Format *"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={types}
          required
        />

        {formData.type === 'video' && (
          <Input
            label="Meeting Link (e.g. Zoom, Meet URL)"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            error={errors.meetingLink}
            placeholder="e.g. https://meet.google.com/abc-defg-hij"
            icon={<Video size={16} />}
          />
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Special Instructions / Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Provide directions, requirements, or preparational instructions for the candidate..."
            rows={4}
            className="w-full p-2.5 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Schedule Interview
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewScheduler;
