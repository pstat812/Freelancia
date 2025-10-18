import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, FileText } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { taskService, type Task } from '../../services/taskService';

const YourTasks: React.FC = () => {
  const { walletAddress } = useWallet();
  const [filter, setFilter] = useState<'in-progress' | 'completed'>('in-progress');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadTasks();
    }
  }, [walletAddress]);

  const loadTasks = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getTasksByFreelancer(walletAddress);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.status === filter);

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
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
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ml-4 ${
                          task.status === 'in-progress' 
                            ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                            : 'text-green-400 bg-green-400/10 border-green-400/20'
                        }`}>
                          {task.status === 'in-progress' ? 'In Progress' : 'Completed'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-1 text-orange-500">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{task.budget} PYUSD</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6">
                      {task.status === 'in-progress' && (
                        <Link to={`/freelancer/submit/${task.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-lg whitespace-nowrap"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Submit Work</span>
                          </motion.button>
                        </Link>
                      )}
                      <Link to={`/freelancer/task/${task.id}`}>
                        <button className="text-gray-400 hover:text-white text-sm transition-colors whitespace-nowrap">
                          View Details →
                        </button>
                      </Link>
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

