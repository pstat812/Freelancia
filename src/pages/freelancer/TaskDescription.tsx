import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, Tag, User, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { getTaskById } from '../../data/mockData';

const TaskDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const task = getTaskById(id || '');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [experience, setExperience] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsApplying(false);
    setHasApplied(true);
    setShowApplyModal(false);
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
                {task.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                )}
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

              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                  <span>Applicants</span>
                  <span className="text-white font-semibold">{task.applications.length}</span>
                </div>
              </div>

              {hasApplied ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">Application Submitted</p>
                  <p className="text-sm text-gray-400 mt-1">You'll be notified once the AI reviews your application</p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Apply for Task</span>
                </motion.button>
              )}

              <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    Your application will be reviewed by an AI agent to assess your eligibility for this task
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Apply for Task</h2>
                <p className="text-gray-400 mb-6">
                  Tell us about your experience and why you're a good fit for this task. The AI agent will review your application.
                </p>

                <div className="mb-6">
                  <label htmlFor="experience" className="block text-sm font-semibold text-white mb-2">
                    Your Experience & Qualifications *
                  </label>
                  <textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={8}
                    placeholder="Describe your relevant experience, skills, and why you're qualified for this task..."
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">AI Assessment</h3>
                  <p className="text-sm text-gray-300">
                    After submission, an AI agent will analyze your experience, verify your qualifications, and determine your eligibility for this task. You'll receive feedback within minutes.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    disabled={isApplying}
                    className="px-6 py-3 rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: isApplying ? 1 : 1.02 }}
                    whileTap={{ scale: isApplying ? 1 : 0.98 }}
                    onClick={handleApply}
                    disabled={isApplying || experience.trim().length < 20}
                    className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskDescription;

