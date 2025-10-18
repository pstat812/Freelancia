import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Clock, DollarSign, Users, CheckCircle } from 'lucide-react';
import { getTasksByPublisher, currentUser, type TaskStatus } from '../../data/mockData';

const YourTasks: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'completed' | 'expired'>('all');
  const userTasks = getTasksByPublisher(currentUser.id);

  const filteredTasks = userTasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'expired') return new Date(task.deadline).getTime() < Date.now() && task.status !== 'completed';
    return task.status === filter;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Tasks</h1>
              <p className="text-gray-400">Manage and track all your posted tasks</p>
            </div>
            <Link to="/publisher/add-task">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Task</span>
              </motion.button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'in-progress', 'completed', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as 'all' | 'open' | 'in-progress' | 'completed' | 'expired')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tasks Grid */}
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
                  ? "You haven't posted any tasks yet. Get started by creating your first task!"
                  : `No tasks with status "${filter}"`
                }
              </p>
              {filter === 'all' && (
                <Link to="/publisher/add-task">
                  <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
                    Post Your First Task
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/publisher/task/${task.id}`}>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className="text-xs text-gray-500">{task.category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {task.description}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                      <div className="flex items-center space-x-1 text-orange-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{task.budget} PYUSD</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1" title="Applications">
                          <Users className="w-4 h-4" />
                          <span>{task.applications.length}</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Deadline">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YourTasks;

