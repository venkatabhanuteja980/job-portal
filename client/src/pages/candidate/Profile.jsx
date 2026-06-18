import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Briefcase,
  Link2,
  Globe,
  Plus,
  Trash2,
  Edit2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  Check
} from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ProfileCompletionBar from '../../components/candidate/ProfileCompletionBar';
import ResumeUploader from '../../components/candidate/ResumeUploader';
import SkillsSelector from '../../components/candidate/SkillsSelector';
import ExperienceForm from '../../components/candidate/ExperienceForm';
import EducationForm from '../../components/candidate/EducationForm';
import { updateUser } from '../../store/authSlice';

export const Profile = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [activeExpIdx, setActiveExpIdx] = useState(null); // null = add new, number = edit index
  const [isEduOpen, setIsEduOpen] = useState(false);
  const [activeEduIdx, setActiveEduIdx] = useState(null); // null = add new, number = edit index

  // Main Form fields state
  const [formState, setFormState] = useState({
    phone: '',
    headline: '',
    summary: '',
    skills: [],
    customSkills: [],
    experience: [],
    education: [],
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    searchable: true,
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
  });

  // Keep a reference of original state to check if dirty
  const [originalState, setOriginalState] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Avatar upload / preview states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Draft banner state
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Load profile data
  const fetchProfile = async (restoreDraftData = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateApi.getProfile();
      const prof = response.data.profile || {};
      setProfile(prof);

      const mappedState = {
        phone: prof.phone || '',
        headline: prof.headline || '',
        summary: prof.summary || '',
        skills: prof.skills || [],
        customSkills: prof.customSkills || [],
        experience: prof.experience || [],
        education: prof.education || [],
        linkedinUrl: prof.linkedinUrl || '',
        portfolioUrl: prof.portfolioUrl || '',
        githubUrl: prof.githubUrl || '',
        searchable: prof.searchable !== false,
        address: {
          street: prof.address?.street || '',
          city: prof.address?.city || '',
          state: prof.address?.state || '',
          country: prof.address?.country || '',
          zipCode: prof.address?.zipCode || '',
        },
      };

      setOriginalState(JSON.stringify(mappedState));

      if (restoreDraftData) {
        setFormState(restoreDraftData);
        setIsDirty(true);
      } else {
        setFormState(mappedState);
        setIsDirty(false);
        // Check if there is an existing draft in localStorage
        const savedDraft = localStorage.getItem('candidate_profile_draft');
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          // Only show banner if draft differs from current backend state
          if (JSON.stringify(parsedDraft) !== JSON.stringify(mappedState)) {
            setShowDraftBanner(true);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle auto-save draft functionality
  useEffect(() => {
    if (!originalState || loading) return;

    const currentStr = JSON.stringify(formState);
    const dirty = currentStr !== originalState;
    setIsDirty(dirty);

    if (dirty) {
      // Auto-save draft to local storage
      localStorage.setItem('candidate_profile_draft', currentStr);
    } else {
      localStorage.removeItem('candidate_profile_draft');
    }
  }, [formState, originalState, loading]);

  // Unsaved changes warning: beforeunload listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        const msg = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('candidate_profile_draft');
    if (savedDraft) {
      setFormState(JSON.parse(savedDraft));
      setIsDirty(true);
    }
    setShowDraftBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem('candidate_profile_draft');
    setShowDraftBanner(false);
    if (originalState) {
      setFormState(JSON.parse(originalState));
      setIsDirty(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSkillsChange = (skills, customSkills) => {
    setFormState((prev) => ({
      ...prev,
      skills,
      customSkills,
    }));
  };

  // Resume parse callback
  const handleParseConfirm = (updates) => {
    setFormState((prev) => {
      const nextState = { ...prev };
      if (updates.phone) nextState.phone = updates.phone;
      if (updates.parsedSkills) {
        // Find match in dbSkills or add as customSkills
        // In this simple check, we will merge the parsed skills to customSkills
        const mergedCustom = [...new Set([...prev.customSkills, ...updates.parsedSkills])];
        nextState.customSkills = mergedCustom;
      }
      return nextState;
    });

    setSuccessMsg('Resume parsed data successfully applied to your form. Click Save below to persist updates!');
    setTimeout(() => setSuccessMsg(''), 5000);
    // Trigger profiles reload to update progress percentage and resume reference url
    fetchProfile();
  };

  // Avatar methods
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar image size must be under 2MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await candidateApi.uploadAvatar(formData);
      
      setSuccessMsg('Avatar image uploaded successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
      // Reload profile
      fetchProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Experience array manipulation
  const handleAddExperience = (newExp) => {
    setFormState((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const handleEditExperience = (updatedExp) => {
    setFormState((prev) => {
      const list = [...prev.experience];
      list[activeExpIdx] = updatedExp;
      return { ...prev, experience: list };
    });
  };

  const handleDeleteExperience = (idx) => {
    if (window.confirm('Remove this work experience?')) {
      setFormState((prev) => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== idx),
      }));
    }
  };

  // Education array manipulation
  const handleAddEducation = (newEdu) => {
    setFormState((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const handleEditEducation = (updatedEdu) => {
    setFormState((prev) => {
      const list = [...prev.education];
      list[activeEduIdx] = updatedEdu;
      return { ...prev, education: list };
    });
  };

  const handleDeleteEducation = (idx) => {
    if (window.confirm('Remove this education record?')) {
      setFormState((prev) => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== idx),
      }));
    }
  };

  // Save changes to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    // Prepare payload (convert skills to string array or ObjectId array)
    const skillsIds = formState.skills.map((s) => typeof s === 'object' ? s._id : s);
    const payload = {
      ...formState,
      skills: skillsIds,
    };

    try {
      await candidateApi.updateProfile(payload);
      setSuccessMsg('Professional profile saved successfully!');
      localStorage.removeItem('candidate_profile_draft');
      setIsDirty(false);
      // Reload profile
      await fetchProfile();
      // BUG-002 Fix: Sync auth store so Navbar reflects updated name/avatar
      const refreshed = await candidateApi.getProfile();
      const u = refreshed?.data?.profile?.userId || {};
      if (u.firstName) dispatch(updateUser({ firstName: u.firstName, lastName: u.lastName, avatar: u.avatar }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update candidate profile.');
    } finally {
      setSaving(false);
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  const user = profile?.userId || {};
  const initials = user.firstName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'ME';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 text-left max-w-5xl mx-auto"
    >
      <Helmet>
        <title>My Profile | Candidate Portal</title>
        <meta name="description" content="Manage your professional summary, work history, and skills list." />
      </Helmet>

      {/* Unsaved changes top draft warning banner */}
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/40 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs sm:text-sm font-semibold">
              <AlertTriangle size={18} className="shrink-0" />
              <span>We found unsaved profile changes from your previous session.</span>
            </div>
            <div className="flex gap-2">
              <Button size="xs" variant="primary" onClick={restoreDraft} className="bg-amber-600 hover:bg-amber-700">
                Restore
              </Button>
              <Button size="xs" variant="outline" onClick={discardDraft} className="border-amber-300 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-400">
                Discard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback messaging */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* Profile Header info card & Avatar editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Avatar + Strength + Resume Uploader */}
        <div className="space-y-6">
          {/* Avatar Preview & Upload */}
          <Card className="p-6 text-center border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
            <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden border border-slate-200 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : user.avatar?.url ? (
                <img src={user.avatar.url} alt={user.firstName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold font-display text-slate-400">{initials}</span>
              )}
              
              {/* Overlay edit button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-xs font-bold"
              >
                Change Photo
              </button>
            </div>
            
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-none">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-dark-text-muted mt-1.5">{user.email}</p>

            {/* Avatar Preview Actions */}
            {avatarPreview && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-dark-border/40">
                <Button size="xs" variant="primary" loading={uploadingAvatar} onClick={uploadAvatar}>
                  Save Photo
                </Button>
                <Button size="xs" variant="outline" onClick={cancelAvatarPreview}>
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Profile completion bar */}
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display mb-4">Profile Strength</h3>
            <ProfileCompletionBar percentage={profile?.profileCompletion || 0} profile={profile} />
          </Card>

          {/* Resume Upload parsing tool */}
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display mb-4">Resume Parsing Engine</h3>
            {profile?.resumeUrl && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg dark:bg-slate-950/20 dark:border-dark-border/40 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-primary-500 shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate leading-none">
                    {profile.resumeOriginalName || 'Uploaded Resume'}
                  </p>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block"
                  >
                    View Current Resume
                  </a>
                </div>
              </div>
            )}
            <ResumeUploader onParseConfirm={handleParseConfirm} currentProfile={profile} />
          </Card>
        </div>

        {/* Right Pane: Main Editing Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Professional Summary */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display border-b border-slate-100 dark:border-dark-border/40 pb-2">
                Headline Summary
              </h2>

              <Input
                label="Professional Headline"
                name="headline"
                value={formState.headline}
                onChange={handleInputChange}
                placeholder="e.g. Senior Frontend Developer | React Specialist"
                icon={<Briefcase size={16} />}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
                  Professional Bio / Summary
                </label>
                <textarea
                  name="summary"
                  value={formState.summary}
                  onChange={handleInputChange}
                  placeholder="Describe your skillset, accomplishments, and career goals..."
                  rows={4}
                  className="w-full p-2.5 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
            </Card>

            {/* Work History Experience array */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Work Experience
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setActiveExpIdx(null);
                    setIsExpOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Plus size={12} /> Add Experience
                </Button>
              </div>

              {formState.experience.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  No work history added yet. Click Add Experience.
                </div>
              ) : (
                <div className="space-y-4">
                  {formState.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 dark:border-dark-border/40 dark:bg-slate-950/10 flex justify-between items-start gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                          {exp.title}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted mt-0.5">
                          {exp.company} {exp.location ? `• ${exp.location}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDateLabel(exp.startDate)} — {exp.current ? 'Present' : formatDateLabel(exp.endDate)}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100/50 dark:border-dark-border/30">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExpIdx(idx);
                            setIsExpOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-md text-slate-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Education History array */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Education Background
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setActiveEduIdx(null);
                    setIsEduOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Plus size={12} /> Add Education
                </Button>
              </div>

              {formState.education.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  No education history added yet. Click Add Education.
                </div>
              ) : (
                <div className="space-y-4">
                  {formState.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 dark:border-dark-border/40 dark:bg-slate-950/10 flex justify-between items-start gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted mt-0.5">
                          {edu.institution} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDateLabel(edu.startDate)} — {formatDateLabel(edu.endDate)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEduIdx(idx);
                            setIsEduOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(idx)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-md text-slate-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Skills Selector */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-4">
                Core Skill Tags
              </h2>
              <SkillsSelector
                selectedSkills={formState.skills}
                customSkills={formState.customSkills}
                onChange={handleSkillsChange}
              />
            </Card>

            {/* Additional Contact and Profile Visibility settings */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display border-b border-slate-100 dark:border-dark-border/40 pb-2">
                Additional Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  icon={<Phone size={16} />}
                />

                <Input
                  label="LinkedIn URL"
                  name="linkedinUrl"
                  value={formState.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  icon={<Link2 size={16} />}
                />

                <Input
                  label="Portfolio URL"
                  name="portfolioUrl"
                  value={formState.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://myportfolio.com"
                  icon={<Globe size={16} />}
                />

                <Input
                  label="GitHub Profile URL"
                  name="githubUrl"
                  value={formState.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  icon={<Link2 size={16} />}
                />
              </div>

              {/* Address details */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <Input
                      label="Street Address"
                      name="street"
                      value={formState.address.street}
                      onChange={handleAddressChange}
                      placeholder="Flat, building, road name"
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    value={formState.address.city}
                    onChange={handleAddressChange}
                    placeholder="e.g. Bangalore"
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formState.address.state}
                    onChange={handleAddressChange}
                    placeholder="e.g. Karnataka"
                  />
                  <Input
                    label="Zip Code"
                    name="zipCode"
                    value={formState.address.zipCode}
                    onChange={handleAddressChange}
                    placeholder="e.g. 560001"
                  />
                </div>
              </div>

              {/* Profile Visibility Checkbox */}
              <div className="pt-4 border-t border-slate-100 dark:border-dark-border/40 mt-4 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="profile_searchable"
                  name="searchable"
                  checked={formState.searchable}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-350 dark:border-dark-border text-primary-600 focus:ring-primary-500 cursor-pointer mt-0.5"
                />
                <div className="text-left select-none">
                  <label htmlFor="profile_searchable" className="text-sm font-bold text-slate-800 dark:text-white cursor-pointer">
                    Appear in employer search results
                  </label>
                  <p className="text-xs text-slate-400 dark:text-dark-text-muted">
                    When checked, verified recruiting managers will be able to search and view your profile when browsing candidate directories.
                  </p>
                </div>
              </div>
            </Card>

            {/* Unsaved warning message & Submit */}
            <div className="p-4 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900">
              <div className="text-left">
                {isDirty ? (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                    <AlertTriangle size={14} /> You have unsaved changes.
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                    <Check size={14} /> All data is synchronized.
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 shrink-0">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Discard unsaved draft modifications?')) {
                        discardDraft();
                      }
                    }}
                  >
                    Discard Changes
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  className="flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Profile
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Experience Form modal */}
      <ExperienceForm
        isOpen={isExpOpen}
        onClose={() => {
          setIsExpOpen(false);
          setActiveExpIdx(null);
        }}
        onSubmit={(data) => {
          if (activeExpIdx !== null) {
            handleEditExperience(data);
          } else {
            handleAddExperience(data);
          }
        }}
        initialData={activeExpIdx !== null ? formState.experience[activeExpIdx] : null}
      />

      {/* Education Form modal */}
      <EducationForm
        isOpen={isEduOpen}
        onClose={() => {
          setIsEduOpen(false);
          setActiveEduIdx(null);
        }}
        onSubmit={(data) => {
          if (activeEduIdx !== null) {
            handleEditEducation(data);
          } else {
            handleAddEducation(data);
          }
        }}
        initialData={activeEduIdx !== null ? formState.education[activeEduIdx] : null}
      />
    </motion.div>
  );
};

export default Profile;
