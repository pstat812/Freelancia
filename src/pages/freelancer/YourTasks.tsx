import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, CheckCircle, Send } from 'lucide-react';
import { mockTasks } from '../../data/mockData';

const YourTasks: React.FC = () => {
  // Show only approved tasks here (simplified mock: tasks with any application)
  const approvedTasks = mockTasks.filter(task => task.applications.length > 0);

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
          <p className="text-gray-400">Manage active tasks you've been approved for</p>
        </motion.div>

        {/* Filters removed; all tasks listed are approved */}

        {/* Tasks List */}
        {approvedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-gray-400 mb-6">
                You have no approved tasks yet. Start browsing available tasks!
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
            {approvedTasks.map((task, index) => {
              const hasSubmission = task.submissions.length > 0;

              return (
                <Link key={task.id} to={`/freelancer/task/${task.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer"
                  >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-white mb-3">{task.title}</h3>

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
                        {/* Applied date removed */}
                      </div>

                      {/* AI Assessment removed */}
                    </div>

                      <div className="flex flex-col space-y-2 lg:ml-6">
                      {hasSubmission && (
                        <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-md border border-green-400/20">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YourTasks;

