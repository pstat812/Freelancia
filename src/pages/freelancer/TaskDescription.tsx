import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, Tag, User, CheckCircle, XCircle, Send } from 'lucide-react';
import { getTaskById } from '../../data/mockData';

const TaskDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const task = getTaskById(id || '');
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);

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

  const simulateAIAgentDecision = async () => {
    // Simulate AI assessment and decision
    await new Promise(resolve => setTimeout(resolve, 1200));
    const approved = Math.random() > 0.4;
    if (approved) setShowApprovedModal(true);
    else setShowRejectedModal(true);
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

              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                  <span>Applicants</span>
                  <span className="text-white font-semibold">{task.applications.length}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={simulateAIAgentDecision}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Apply for Task</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Decision Modals */}
      <AnimatePresence>
        {showApprovedModal && (
          <>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApprovedModal(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white mb-2">You're approved!</h3>
                <p className="text-gray-300 mb-6">You are a great fit for this task. You can now proceed to work and submit your result.</p>
                <button onClick={() => setShowApprovedModal(false)} className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Start</button>
              </div>
            </motion.div>
          </>
        )}
        {showRejectedModal && (
          <>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectedModal(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white mb-2">Sorry, not a match</h3>
                <p className="text-gray-300 mb-6">Your experience does not match the requirements for this task. Please browse other tasks.</p>
                <button onClick={() => setShowRejectedModal(false)} className="bg-gray-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskDescription;

