import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, DollarSign } from 'lucide-react';
import { mockTasks } from '../../data/mockData';

const YourTasks: React.FC = () => {
  // Show only approved tasks here (simplified mock: tasks with any application)
  const approvedTasks = mockTasks.filter(task => task.applications.length > 0);
  const [filter, setFilter] = useState<'in-progress' | 'completed'>('in-progress');
  const filteredTasks = approvedTasks.filter(t => t.status === filter);

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

        {/* Filters: In progress, Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {(['in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/50'
              }`}
            >
              {status === 'in-progress' ? 'In progress' : 'Completed'}
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
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-gray-400 mb-6">No tasks found for this filter.</p>
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
              return (
                <Link key={task.id} to={`/freelancer/task/${task.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 pb-8 hover:border-orange-500/50 transition-all cursor-pointer"
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
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 lg:ml-6" />
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

