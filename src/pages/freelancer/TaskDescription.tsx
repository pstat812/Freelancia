import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, User, CheckCircle, Upload, FileCode } from 'lucide-react';
import { getTaskById } from '../../data/mockData';

const TaskDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const task = getTaskById(id || '');
  // Submission state (multi-entry)
  type EntryType = 'image' | 'text' | 'code' | 'pdf';
  interface SubmissionEntry {
    id: string;
    type: EntryType;
    text?: string; // for text/code
    file?: File; // for image/pdf
    preview?: string; // data URL or filename
  }
  const [entries, setEntries] = useState<SubmissionEntry[]>([
    { id: crypto.randomUUID(), type: 'text', text: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  if (!task) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Task Not Found</h2>
          <Link to="/freelancer/browse" className="text-orange-500 hover:text-orange-400">
            Return to Browse Tasks
          </Link>
        </div>
      </div>
    );
  }

  // Difficulty removed per requirements

  const addEntry = () => {
    setEntries(prev => [...prev, { id: crypto.randomUUID(), type: 'text', text: '' }]);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntryType = (id: string, type: EntryType) => {
    setEntries(prev => prev.map(e => e.id === id ? { id, type, text: type === 'text' || type === 'code' ? (e.text || '') : undefined, file: undefined, preview: undefined } : e));
  };

  const handleFileChange = (id: string, file?: File) => {
    if (!file) return;
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const entry = { ...e, file } as SubmissionEntry;
      if (e.type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEntries(curr => curr.map(x => x.id === id ? { ...entry, preview: reader.result as string } : x));
        };
        reader.readAsDataURL(file);
      } else if (e.type === 'pdf') {
        entry.preview = file.name;
      } else if (e.type === 'code' || e.type === 'text') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEntries(curr => curr.map(x => x.id === id ? { ...entry, text: (reader.result as string) || '' } : x));
        };
        reader.readAsText(file);
      }
      return entry;
    }));
  };

  const handleTextChange = (id: string, text: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, text } : e));
  };

  const submitAll = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const daysUntilDeadline = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/freelancer/browse">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Browse</span>
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {task.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{task.title}</h1>

              <div className="flex items-center space-x-2 text-gray-400 text-sm mb-6">
                <User className="w-4 h-4" />
                <span>Posted by {task.publisherName}</span>
                <span className="text-gray-600">•</span>
                <span>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">{task.description}</p>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {task.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sticky top-24"
            >
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-2">Budget</div>
                <div className="flex items-center space-x-1 text-orange-500">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-3xl font-bold">{task.budget}</span>
                  <span className="text-sm text-gray-400">PYUSD</span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">Deadline</span>
                  <div className="flex items-center space-x-1 text-white">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time Left</span>
                  <span className={`font-semibold ${daysUntilDeadline < 7 ? 'text-red-400' : 'text-white'}`}>
                    {daysUntilDeadline} days
                  </span>
                </div>
              </div>

              {/* Apply removed; this page includes submission section below */}
            </motion.div>
          </div>
        </div>
      
        {/* Submission Section (multi-entry) */}
        <div className="max-w-5xl mx-auto mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Submit Your Work</h2>
              <button onClick={addEntry} className="text-orange-500 hover:text-orange-400 text-sm font-medium">+ Add Item</button>
            </div>

            <div className="space-y-6">
              {entries.map((entry, index) => (
                <div key={entry.id} className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-400">Item {index + 1}</div>
                    {entries.length > 1 && (
                      <button onClick={() => removeEntry(entry.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Type</label>
                      <select
                        value={entry.type}
                        onChange={(e) => updateEntryType(entry.id, e.target.value as EntryType)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="text">Text</option>
                        <option value="code">Code</option>
                        <option value="image">Image</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                    <div className="lg:col-span-3">
                      {(entry.type === 'text' || entry.type === 'code') && (
                        <textarea
                          value={entry.text || ''}
                          onChange={(e) => handleTextChange(entry.id, e.target.value)}
                          rows={entry.type === 'code' ? 8 : 5}
                          placeholder={entry.type === 'code' ? 'Paste your code here...' : 'Write your description here...'}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      )}
                      {(entry.type === 'image' || entry.type === 'pdf') && (
                        <div>
                          <div
                            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                            onClick={() => {
                              const input = fileInputsRef.current[entry.id];
                              if (input) input.click();
                            }}
                          >
                            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <div className="text-sm text-gray-300">Click to upload {entry.type.toUpperCase()}</div>
                          </div>
                          <input
                            ref={(el) => { fileInputsRef.current[entry.id] = el; }}
                            type="file"
                            accept={entry.type === 'image' ? '.jpg,.jpeg,.png,.gif' : '.pdf'}
                            onChange={(e) => handleFileChange(entry.id, e.target.files?.[0])}
                            className="hidden"
                          />
                          {entry.type === 'image' && entry.preview && (
                            <img src={entry.preview} alt="Preview" className="mt-3 max-w-full rounded-lg border border-gray-700" />
                          )}
                          {entry.type === 'pdf' && entry.preview && (
                            <div className="mt-3 text-sm text-gray-400 flex items-center space-x-2">
                              <FileCode className="w-4 h-4" />
                              <span>{entry.preview}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end mt-6">
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={submitAll}
                disabled={isSubmitting || entries.length === 0}
                className="bg-orange-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Work'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-green-400 text-sm">
                  <CheckCircle className="inline w-4 h-4 mr-1" /> Submission received!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskDescription;

