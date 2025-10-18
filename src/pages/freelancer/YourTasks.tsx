import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { mockTasks, type ApplicationStatus } from '../../data/mockData';

const YourTasks: React.FC = () => {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  
  // Mock: Get tasks this freelancer has applied to
  // In real app, this would filter by current user's freelancerId
  const appliedTasks = mockTasks.filter(task => task.applications.length > 0);

  const filteredTasks = filter === 'all'
    ? appliedTasks
    : appliedTasks.filter(task => 
        task.applications.some(app => app.status === filter)
      );

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'pending': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Tasks</h1>
          <p className="text-gray-400">Track your applications and manage active tasks</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as ApplicationStatus | 'all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all'
                  ? "You haven't applied to any tasks yet. Start browsing available tasks!"
                  : `No tasks with status "${filter}"`}
              </p>
              {filter === 'all' && (
                <Link to="/freelancer/browse">
                  <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
                    Browse Tasks
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredTasks.map((task, index) => {
              // Get the application status for this task (mock - first application)
              const application = task.applications[0];
              const isApproved = application.status === 'approved';
              const hasSubmission = task.submissions.length > 0;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center space-x-1 text-orange-500">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{task.budget} PYUSD</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-gray-500">
                          Applied: {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {/* AI Assessment */}
                      {application.aiAssessment && (
                        <div className={`mt-4 border rounded-lg p-3 ${
                          application.aiAssessment.eligible
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-red-900/20 border-red-500/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">AI Assessment</h4>
                            <span className={`text-sm font-semibold ${
                              application.aiAssessment.eligible ? 'text-green-400' : 'text-red-400'
                            }`}>
                              Score: {application.aiAssessment.score}/100
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{application.aiAssessment.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <Link to={`/freelancer/task/${task.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full lg:w-auto bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </motion.button>
                      </Link>
                      {isApproved && !hasSubmission && (
                        <Link to={`/freelancer/submit/${task.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full lg:w-auto bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
                          >
                            <Send className="w-4 h-4" />
                            <span>Submit Work</span>
                          </motion.button>
                        </Link>
                      )}
                      {hasSubmission && (
                        <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-md border border-green-400/20">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YourTasks;

