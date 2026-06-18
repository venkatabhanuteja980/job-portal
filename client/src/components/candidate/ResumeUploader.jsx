import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, RefreshCw, Check } from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import Button from '../common/Button';
import Modal from '../common/Modal';

export const ResumeUploader = ({
  onParseConfirm,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Flow states: 'idle' | 'uploading' | 'parsing' | 'review'
  const [status, setStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Extracted fields states
  const [parsedData, setParsedData] = useState(null);
  const [acceptedFields, setAcceptedFields] = useState({
    name: true,
    email: true,
    phone: true,
    skills: true,
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    // Validate type and size (PDF or DOCX, max 5MB)
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.doc')) {
      setError('Please select a valid PDF or DOCX file.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setError('');
    uploadAndParse(selectedFile);
  };

  const uploadAndParse = async (selectedFile) => {
    setStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      // Axios request with progress tracking
      const response = await candidateApi.uploadResume(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
        if (percent >= 100) {
          setStatus('parsing');
        }
      });

      const parsedFields = response.data.parsedResume || {};
      setParsedData({
        name: parsedFields.extractedName || '',
        email: parsedFields.extractedEmail || '',
        phone: parsedFields.extractedPhone || '',
        skills: parsedFields.extractedSkills || [],
        resumeUrl: response.data.resumeUrl,
        resumeOriginalName: response.data.resumeOriginalName,
      });
      setStatus('review');
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'File upload or parsing failed.');
    }
  };

  const handleAcceptFieldToggle = (field) => {
    setAcceptedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveConfirmed = () => {
    // Construct updates based on accepted choices
    const updates = {};
    if (acceptedFields.name && parsedData.name) {
      const parts = parsedData.name.split(/\s+/);
      updates.firstName = parts[0] || '';
      updates.lastName = parts.slice(1).join(' ') || '';
    }
    if (acceptedFields.email && parsedData.email) {
      updates.email = parsedData.email;
    }
    if (acceptedFields.phone && parsedData.phone) {
      updates.phone = parsedData.phone;
    }
    if (acceptedFields.skills && parsedData.skills?.length > 0) {
      updates.parsedSkills = parsedData.skills;
    }
    
    // Save URL/metadata references
    updates.resumeUrl = parsedData.resumeUrl;
    updates.resumeOriginalName = parsedData.resumeOriginalName;

    if (onParseConfirm) {
      onParseConfirm(updates);
    }
    
    setStatus('idle');
  };

  return (
    <div className="w-full text-left">
      {/* Action Zone Area */}
      {status === 'idle' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            dragActive
              ? 'border-primary-600 bg-primary-50/50 dark:border-primary-400 dark:bg-primary-950/20'
              : 'border-slate-300 dark:border-dark-border hover:border-slate-400'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center dark:bg-slate-800 dark:text-slate-400 mb-4">
            <Upload size={24} />
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Drag & drop your resume file here
          </p>
          <p className="text-xs text-slate-400 dark:text-dark-text-muted mb-4">
            Accepts PDF, DOCX (Max 5MB)
          </p>

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
            Select File
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {error && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      )}

      {/* Upload progress state */}
      {status === 'uploading' && (
        <div className="p-6 border border-slate-200 bg-white rounded-xl dark:border-dark-border dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-350">Uploading Resume...</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-slate-800">
            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Parsing progress state */}
      {status === 'parsing' && (
        <div className="p-8 border border-slate-200 bg-white rounded-xl dark:border-dark-border dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw size={28} className="text-primary-600 animate-spin" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Parsing CV profile...</h4>
          <p className="text-xs text-slate-400 max-w-xs dark:text-dark-text-muted">
            Our resume matching engine is extracting skills, experience, and contact coordinates. Please wait a moment.
          </p>
        </div>
      )}

      {/* Review Modal Extracted Fields */}
      <Modal
        isOpen={status === 'review'}
        onClose={() => setStatus('idle')}
        title="Review Extracted Resume Data"
        size="lg"
      >
        {parsedData && (
          <div className="space-y-6 text-left">
            <p className="text-xs text-slate-500 dark:text-dark-text-muted">
              Check the fields extracted from your CV. Uncheck any box to keep your previous values.
            </p>

            <div className="space-y-4">
              {/* Field: Name */}
              <div className="p-4 rounded-lg border border-slate-200 dark:border-dark-border flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extracted Name</span>
                  <p className={`text-sm font-semibold ${!parsedData.name ? 'text-red-500 italic' : 'text-slate-900 dark:text-white'}`}>
                    {parsedData.name || 'Not detected'}
                  </p>
                </div>
                {parsedData.name ? (
                  <button
                    onClick={() => handleAcceptFieldToggle('name')}
                    className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                      acceptedFields.name
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-dark-border text-slate-400'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={14} /> Missing</span>
                )}
              </div>

              {/* Field: Email */}
              <div className="p-4 rounded-lg border border-slate-200 dark:border-dark-border flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extracted Email</span>
                  <p className={`text-sm font-semibold ${!parsedData.email ? 'text-red-500 italic' : 'text-slate-900 dark:text-white'}`}>
                    {parsedData.email || 'Not detected'}
                  </p>
                </div>
                {parsedData.email ? (
                  <button
                    onClick={() => handleAcceptFieldToggle('email')}
                    className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                      acceptedFields.email
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-dark-border text-slate-400'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={14} /> Missing</span>
                )}
              </div>

              {/* Field: Phone */}
              <div className="p-4 rounded-lg border border-slate-200 dark:border-dark-border flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extracted Phone</span>
                  <p className={`text-sm font-semibold ${!parsedData.phone ? 'text-red-500 italic' : 'text-slate-900 dark:text-white'}`}>
                    {parsedData.phone || 'Not detected'}
                  </p>
                </div>
                {parsedData.phone ? (
                  <button
                    onClick={() => handleAcceptFieldToggle('phone')}
                    className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                      acceptedFields.phone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-dark-border text-slate-400'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={14} /> Missing</span>
                )}
              </div>

              {/* Field: Skills */}
              <div className="p-4 rounded-lg border border-slate-200 dark:border-dark-border flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extracted Skills</span>
                  {parsedData.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {parsedData.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-sm text-xs font-medium dark:bg-primary-950/20 dark:text-primary-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 italic">No skills matched from db collection.</p>
                  )}
                </div>
                {parsedData.skills?.length > 0 ? (
                  <button
                    onClick={() => handleAcceptFieldToggle('skills')}
                    className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                      acceptedFields.skills
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-dark-border text-slate-400'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={14} /> Missing</span>
                )}
              </div>
            </div>

            {/* Confirm Save Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
              <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveConfirmed}>
                Save Selected Fields
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResumeUploader;
